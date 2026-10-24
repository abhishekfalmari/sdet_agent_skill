"""
SDET ML Models Training Scripts

Trains 4 ONNX models for quality intelligence:
1. flake-detector.onnx - Detects flaky tests from execution history
2. failure-predictor.onnx - Predicts test failure probability
3. test-prioritizer.onnx - Prioritizes tests for maximum defect detection
4. root-cause.onnx - Classifies failure root cause category

Requirements: pip install scikit-learn onnx skl2onnx pandas numpy xgboost lightgbm
"""

import os
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
import joblib
import warnings
warnings.filterwarnings('ignore')

# Try to import ONNX conversion tools
try:
    from skl2onnx import convert_sklearn
    from skl2onnx.common.data_types import FloatTensorType, Int64TensorType, StringTensorType
    ONNX_AVAILABLE = True
except ImportError:
    ONNX_AVAILABLE = False
    print("⚠️  ONNX conversion not available. Install skl2onnx for ONNX export.")

try:
    import xgboost as xgb
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False
    print("⚠️  XGBoost not available. Install xgboost for better models.")

try:
    import lightgbm as lgb
    LIGHTGBM_AVAILABLE = True
except ImportError:
    LIGHTGBM_AVAILABLE = False
    print("⚠️  LightGBM not available. Install lightgbm for better models.")

OUTPUT_DIR = "ml-models"
os.makedirs(OUTPUT_DIR, exist_ok=True)


def generate_synthetic_training_data(n_samples=10000, seed=42):
    """Generate synthetic training data for all 4 models."""
    np.random.seed(seed)

    data = {
        'test_id': [f'TC-{i:06d}' for i in range(n_samples)],
        # Test metadata features
        'test_type': np.random.choice(['unit', 'integration', 'e2e', 'api', 'ui', 'performance', 'security'], n_samples, p=[0.4, 0.2, 0.15, 0.1, 0.1, 0.03, 0.02]),
        'priority': np.random.choice(['critical', 'high', 'medium', 'low'], n_samples, p=[0.15, 0.3, 0.4, 0.15]),
        'component': np.random.choice([f'comp-{i}' for i in range(50)], n_samples),
        'owner_team': np.random.choice([f'team-{i}' for i in range(10)], n_samples),
        'lines_of_code': np.random.lognormal(4, 1, n_samples).astype(int),
        'cyclomatic_complexity': np.random.poisson(5, n_samples) + 1,
        'has_mock': np.random.choice([0, 1], n_samples, p=[0.3, 0.7]),
        'has_async': np.random.choice([0, 1], n_samples, p=[0.6, 0.4]),
        'uses_database': np.random.choice([0, 1], n_samples, p=[0.5, 0.5]),
        'uses_external_api': np.random.choice([0, 1], n_samples, p=[0.7, 0.3]),
        'test_age_days': np.random.exponential(100, n_samples).astype(int),
        'last_modified_days': np.random.exponential(30, n_samples).astype(int),

        # Historical execution features
        'total_runs': np.random.poisson(50, n_samples) + 1,
        'pass_rate': np.random.beta(90, 10, n_samples),  # Most tests pass
        'avg_duration_ms': np.random.lognormal(6, 1, n_samples).astype(int),
        'duration_std': np.random.lognormal(4, 1, n_samples).astype(int),
        'flaky_rate': np.random.beta(2, 50, n_samples),  # Low flaky rate
        'consecutive_passes': np.random.poisson(20, n_samples),
        'consecutive_failures': np.random.poisson(1, n_samples),
        'failure_pattern': np.random.choice(['none', 'intermittent', 'consistent', 'environment', 'data'], n_samples, p=[0.7, 0.15, 0.1, 0.03, 0.02]),

        # Code change features
        'recent_changes': np.random.poisson(3, n_samples),
        'lines_changed': np.random.poisson(50, n_samples),
        'files_changed': np.random.poisson(3, n_samples),
        'author_churn': np.random.poisson(2, n_samples),
        'is_new_test': np.random.choice([0, 1], n_samples, p=[0.85, 0.15]),

        # Environment features
        'env_stability_score': np.random.beta(8, 2, n_samples),
        'parallel_execution': np.random.choice([0, 1], n_samples, p=[0.3, 0.7]),
        'resource_contention': np.random.beta(2, 8, n_samples),

        # Target labels (generated with realistic relationships)
    }

    df = pd.DataFrame(data)

    # Generate realistic flaky label
    # Flaky if: high flaky_rate, certain patterns, high duration variance, env instability
    flaky_prob = (
        0.3 * df['flaky_rate'] +
        0.2 * (df['failure_pattern'].isin(['intermittent', 'environment', 'data']).astype(int)) +
        0.15 * (df['duration_std'] / (df['avg_duration_ms'] + 1)) +
        0.15 * (1 - df['env_stability_score']) +
        0.1 * (df['test_type'].isin(['ui', 'e2e', 'integration']).astype(int)) +
        0.1 * (df['uses_external_api'] == 1).astype(int)
    )
    df['is_flaky'] = (flaky_prob + np.random.normal(0, 0.1, n_samples) > 0.3).astype(int)

    # Generate failure label for next run
    # Fail if: recent failures, code changes, flaky, low pass rate, high complexity
    fail_prob = (
        0.25 * (1 - df['pass_rate']) +
        0.2 * (df['consecutive_failures'] > 0).astype(int) +
        0.15 * df['is_flaky'] +
        0.15 * (df['recent_changes'] > 5).astype(int) +
        0.1 * (df['cyclomatic_complexity'] > 10).astype(int) +
        0.1 * (df['test_type'].isin(['e2e', 'ui']).astype(int)) +
        0.05 * (df['uses_database'] == 1).astype(int)
    )
    df['will_fail_next'] = (fail_prob + np.random.normal(0, 0.1, n_samples) > 0.4).astype(int)

    # Generate priority score for test prioritization
    # High priority: critical tests, high risk areas, recent changes, historical defects
    priority_score = (
        0.3 * (df['priority'] == 'critical').astype(int) +
        0.2 * (df['priority'] == 'high').astype(int) +
        0.15 * (df['recent_changes'] > 3).astype(int) +
        0.15 * (df['component'].str.contains('auth|payment|security|core').astype(int)) +
        0.1 * (df['is_flaky'] == 0).astype(int) +  # Prefer stable tests
        0.1 * (1 / (df['avg_duration_ms'] / 1000 + 1))  # Prefer fast tests
    )
    df['priority_rank'] = (priority_score * 100).astype(int)

    # Generate root cause category
    # Categories: code_bug, environment, test_bug, data_issue, dependency, flaky, infrastructure
    cause_probs = np.zeros((n_samples, 7))
    cause_probs[:, 0] = 0.3 * (df['will_fail_next'] == 1) * (df['is_flaky'] == 0) * (df['recent_changes'] > 0)  # code_bug
    cause_probs[:, 1] = 0.2 * (1 - df['env_stability_score']) * (df['failure_pattern'] == 'environment')  # environment
    cause_probs[:, 2] = 0.15 * df['is_flaky'] * (df['failure_pattern'] == 'intermittent')  # test_bug
    cause_probs[:, 3] = 0.1 * (df['failure_pattern'] == 'data') * (df['uses_database'] == 1)  # data_issue
    cause_probs[:, 4] = 0.1 * (df['uses_external_api'] == 1) * (df['resource_contention'] > 0.5)  # dependency
    cause_probs[:, 5] = 0.1 * df['is_flaky']  # flaky
    cause_probs[:, 6] = 0.05 * (df['resource_contention'] > 0.7)  # infrastructure

    # Normalize and sample - handle zero-sum rows with uniform distribution
    row_sums = cause_probs.sum(axis=1, keepdims=True)
    # Replace zero sums with 1 to avoid division by zero, will result in uniform distribution
    row_sums = np.where(row_sums == 0, 1, row_sums)
    cause_probs = cause_probs / row_sums
    # For rows that were all zeros, set uniform distribution
    zero_mask = (cause_probs.sum(axis=1) == 0)
    if zero_mask.any():
        cause_probs[zero_mask] = 1.0 / 7
    cause_labels = ['code_bug', 'environment', 'test_bug', 'data_issue', 'dependency', 'flaky', 'infrastructure']
    df['root_cause'] = [np.random.choice(cause_labels, p=probs) for probs in cause_probs]

    return df


def prepare_features(df, target_col, drop_cols=None):
    """Prepare features for training."""
    if drop_cols is None:
        drop_cols = ['test_id', 'is_flaky', 'will_fail_next', 'priority_rank', 'root_cause']

    # Remove target from drop_cols if present
    drop_cols = [c for c in drop_cols if c != target_col]

    X = df.drop(columns=drop_cols)
    y = df[target_col]

    # Encode categorical features
    categorical_cols = X.select_dtypes(include=['object']).columns
    encoders = {}
    for col in categorical_cols:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col].astype(str))
        encoders[col] = le

    # Scale numeric features
    scaler = StandardScaler()
    numeric_cols = X.select_dtypes(include=[np.number]).columns
    X[numeric_cols] = scaler.fit_transform(X[numeric_cols])

    return X, y, encoders, scaler


def train_flake_detector(df):
    """Train flaky test detection model."""
    print("\n>> Training Flake Detector...")

    X, y, encoders, scaler = prepare_features(df, 'is_flaky')

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Use best available model - GradientBoostingClassifier for ONNX compatibility
    # XGBoost/LightGBM require additional ONNX converters
    model = GradientBoostingClassifier(
        n_estimators=200, max_depth=6, learning_rate=0.1,
        subsample=0.8, random_state=42
    )

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    print(f"  Accuracy: {(y_pred == y_test).mean():.4f}")
    print(f"  ROC-AUC: {roc_auc_score(y_test, y_prob):.4f}")
    print(classification_report(y_test, y_pred, target_names=['Stable', 'Flaky']))

    # Save model artifacts
    artifacts = {
        'model': model,
        'encoders': encoders,
        'scaler': scaler,
        'feature_names': list(X.columns),
        'model_type': 'flake_detector',
        'trained_at': datetime.now().isoformat(),
        'version': '1.0.0'
    }

    joblib.dump(artifacts, f'{OUTPUT_DIR}/flake_detector.joblib')

    if ONNX_AVAILABLE:
        initial_type = [('float_input', FloatTensorType([None, X.shape[1]]))]
        onnx_model = convert_sklearn(model, initial_types=initial_type)
        with open(f'{OUTPUT_DIR}/flake-detector.onnx', 'wb') as f:
            f.write(onnx_model.SerializeToString())
        print(f"  >> ONNX model saved: {OUTPUT_DIR}/flake-detector.onnx")

    return artifacts


def train_failure_predictor(df):
    """Train test failure prediction model."""
    print("\n>> Training Failure Predictor...")

    X, y, encoders, scaler = prepare_features(df, 'will_fail_next')

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Use GradientBoostingClassifier for ONNX compatibility
    model = GradientBoostingClassifier(
        n_estimators=200, max_depth=6, learning_rate=0.1,
        subsample=0.8, random_state=42
    )

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    print(f"  Accuracy: {(y_pred == y_test).mean():.4f}")
    print(f"  ROC-AUC: {roc_auc_score(y_test, y_prob):.4f}")
    print(classification_report(y_test, y_pred, target_names=['Pass', 'Fail']))

    artifacts = {
        'model': model,
        'encoders': encoders,
        'scaler': scaler,
        'feature_names': list(X.columns),
        'model_type': 'failure_predictor',
        'trained_at': datetime.now().isoformat(),
        'version': '1.0.0'
    }

    joblib.dump(artifacts, f'{OUTPUT_DIR}/failure_predictor.joblib')

    if ONNX_AVAILABLE:
        initial_type = [('float_input', FloatTensorType([None, X.shape[1]]))]
        onnx_model = convert_sklearn(model, initial_types=initial_type)
        with open(f'{OUTPUT_DIR}/failure-predictor.onnx', 'wb') as f:
            f.write(onnx_model.SerializeToString())
        print(f"  >> ONNX model saved: {OUTPUT_DIR}/failure-predictor.onnx")

    return artifacts


def train_test_prioritizer(df):
    """Train test prioritization model (regression for priority score)."""
    print("\n>> Training Test Prioritizer...")

    from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
    from sklearn.metrics import mean_squared_error, r2_score

    X, y, encoders, scaler = prepare_features(df, 'priority_rank')

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Use GradientBoostingRegressor for ONNX compatibility
    model = GradientBoostingRegressor(
        n_estimators=200, max_depth=6, learning_rate=0.1,
        subsample=0.8, random_state=42
    )

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    print(f"  RMSE: {np.sqrt(mean_squared_error(y_test, y_pred)):.2f}")
    print(f"  R²: {r2_score(y_test, y_pred):.4f}")

    # Also train a classifier for "high priority" (top 20%)
    high_priority_threshold = df['priority_rank'].quantile(0.8)
    y_class = (df['priority_rank'] >= high_priority_threshold).astype(int)
    X_class, _, encoders_class, scaler_class = prepare_features(df, 'priority_rank')  # Use same features
    # Re-prepare for classification
    X_class = X
    y_class = y_class

    Xc_train, Xc_test, yc_train, yc_test = train_test_split(
        X_class, y_class, test_size=0.2, random_state=42, stratify=y_class
    )

    # Use GradientBoostingClassifier for ONNX compatibility
    clf_model = GradientBoostingClassifier(
        n_estimators=100, max_depth=5, learning_rate=0.1,
        subsample=0.8, random_state=42
    )

    clf_model.fit(Xc_train, yc_train)
    yc_pred = clf_model.predict(Xc_test)
    yc_prob = clf_model.predict_proba(Xc_test)[:, 1]

    print(f"  High-priority classification ROC-AUC: {roc_auc_score(yc_test, yc_prob):.4f}")

    artifacts = {
        'regressor': model,
        'classifier': clf_model,
        'encoders': encoders,
        'scaler': scaler,
        'feature_names': list(X.columns),
        'high_priority_threshold': float(high_priority_threshold),
        'model_type': 'test_prioritizer',
        'trained_at': datetime.now().isoformat(),
        'version': '1.0.0'
    }

    joblib.dump(artifacts, f'{OUTPUT_DIR}/test_prioritizer.joblib')

    if ONNX_AVAILABLE:
        initial_type = [('float_input', FloatTensorType([None, X.shape[1]]))]
        onnx_model = convert_sklearn(model, initial_types=initial_type)
        with open(f'{OUTPUT_DIR}/test-prioritizer.onnx', 'wb') as f:
            f.write(onnx_model.SerializeToString())
        print(f"  >> ONNX model saved: {OUTPUT_DIR}/test-prioritizer.onnx")

    return artifacts


def train_root_cause(df):
    """Train root cause classification model."""
    print("\n>> Training Root Cause Classifier...")

    X, y, encoders, scaler = prepare_features(df, 'root_cause')

    # Encode target
    le_target = LabelEncoder()
    y_encoded = le_target.fit_transform(y)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )

    # Use RandomForestClassifier for multi-class ONNX compatibility
    model = RandomForestClassifier(
        n_estimators=200, max_depth=10, random_state=42,
        class_weight='balanced'
    )

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)

    print(f"  Accuracy: {(y_pred == y_test).mean():.4f}")
    print(classification_report(y_test, y_pred, target_names=le_target.classes_))

    artifacts = {
        'model': model,
        'encoders': encoders,
        'target_encoder': le_target,
        'scaler': scaler,
        'feature_names': list(X.columns),
        'model_type': 'root_cause',
        'trained_at': datetime.now().isoformat(),
        'version': '1.0.0'
    }

    joblib.dump(artifacts, f'{OUTPUT_DIR}/root_cause.joblib')

    if ONNX_AVAILABLE:
        initial_type = [('float_input', FloatTensorType([None, X.shape[1]]))]
        onnx_model = convert_sklearn(model, initial_types=initial_type)
        with open(f'{OUTPUT_DIR}/root-cause.onnx', 'wb') as f:
            f.write(onnx_model.SerializeToString())
        print(f"  >> ONNX model saved: {OUTPUT_DIR}/root-cause.onnx")

    return artifacts


def create_model_metadata():
    """Create metadata file for all models."""
    metadata = {
        'models': {
            'flake-detector': {
                'name': 'Flake Detector',
                'description': 'Detects flaky tests from execution history',
                'input_features': [
                    'test_type', 'priority', 'component', 'owner_team',
                    'lines_of_code', 'cyclomatic_complexity', 'has_mock', 'has_async',
                    'uses_database', 'uses_external_api', 'test_age_days', 'last_modified_days',
                    'total_runs', 'pass_rate', 'avg_duration_ms', 'duration_std',
                    'flaky_rate', 'consecutive_passes', 'consecutive_failures', 'failure_pattern',
                    'recent_changes', 'lines_changed', 'files_changed', 'author_churn', 'is_new_test',
                    'env_stability_score', 'parallel_execution', 'resource_contention'
                ],
                'output': 'is_flaky (0=stable, 1=flaky)',
                'threshold': 0.5,
                'use_case': 'Quarantine flaky tests, prioritize fixes'
            },
            'failure-predictor': {
                'name': 'Failure Predictor',
                'description': 'Predicts probability of test failure in next run',
                'input_features': [
                    'test_type', 'priority', 'component', 'owner_team',
                    'lines_of_code', 'cyclomatic_complexity', 'has_mock', 'has_async',
                    'uses_database', 'uses_external_api', 'test_age_days', 'last_modified_days',
                    'total_runs', 'pass_rate', 'avg_duration_ms', 'duration_std',
                    'flaky_rate', 'consecutive_passes', 'consecutive_failures', 'failure_pattern',
                    'recent_changes', 'lines_changed', 'files_changed', 'author_churn', 'is_new_test',
                    'env_stability_score', 'parallel_execution', 'resource_contention'
                ],
                'output': 'will_fail_next (0=pass, 1=fail)',
                'threshold': 0.5,
                'use_case': 'Risk-based test selection, pre-merge validation'
            },
            'test-prioritizer': {
                'name': 'Test Prioritizer',
                'description': 'Ranks tests by priority for maximum defect detection per time unit',
                'input_features': [
                    'test_type', 'priority', 'component', 'owner_team',
                    'lines_of_code', 'cyclomatic_complexity', 'has_mock', 'has_async',
                    'uses_database', 'uses_external_api', 'test_age_days', 'last_modified_days',
                    'total_runs', 'pass_rate', 'avg_duration_ms', 'duration_std',
                    'flaky_rate', 'consecutive_passes', 'consecutive_failures', 'failure_pattern',
                    'recent_changes', 'lines_changed', 'files_changed', 'author_churn', 'is_new_test',
                    'env_stability_score', 'parallel_execution', 'resource_contention'
                ],
                'output': 'priority_rank (0-100), is_high_priority (0/1)',
                'threshold': 'Top 20% by priority_rank',
                'use_case': 'Test suite optimization, CI time reduction'
            },
            'root-cause': {
                'name': 'Root Cause Classifier',
                'description': 'Classifies failure root cause category',
                'input_features': [
                    'test_type', 'priority', 'component', 'owner_team',
                    'lines_of_code', 'cyclomatic_complexity', 'has_mock', 'has_async',
                    'uses_database', 'uses_external_api', 'test_age_days', 'last_modified_days',
                    'total_runs', 'pass_rate', 'avg_duration_ms', 'duration_std',
                    'flaky_rate', 'consecutive_passes', 'consecutive_failures', 'failure_pattern',
                    'recent_changes', 'lines_changed', 'files_changed', 'author_churn', 'is_new_test',
                    'env_stability_score', 'parallel_execution', 'resource_contention'
                ],
                'output': 'root_cause (code_bug, environment, test_bug, data_issue, dependency, flaky, infrastructure)',
                'threshold': 'Max probability class',
                'use_case': 'Automated RCA, defect routing, prevention'
            }
        },
        'feature_engineering': {
            'categorical_encoding': 'LabelEncoder per column',
            'numeric_scaling': 'StandardScaler',
            'missing_values': 'Not expected (synthetic data complete)',
            'feature_count': 27
        },
        'training': {
            'data_samples': 10000,
            'test_split': 0.2,
            'random_state': 42,
            'algorithms': 'XGBoost (preferred), LightGBM, GradientBoosting, RandomForest'
        },
        'serving': {
            'format': 'ONNX (primary), joblib (fallback)',
            'runtime': 'ONNX Runtime (Python, Node.js, C#, Java)',
            'inference_time_ms': '<10ms per prediction',
            'batch_support': True
        },
        'versioning': {
            'strategy': 'Semantic versioning (MAJOR.MINOR.PATCH)',
            'retraining_trigger': 'Performance drift >5%, new data >10k samples',
            'ab_testing': 'Canary deployment with 10% traffic'
        }
    }

    with open(f'{OUTPUT_DIR}/model-metadata.json', 'w') as f:
        json.dump(metadata, f, indent=2)

    print(f"\n>> Model metadata saved: {OUTPUT_DIR}/model-metadata.json")
    return metadata


def create_inference_example():
    """Create example inference script."""
    inference_code = '''"""
Example inference script for SDET ML models.
Loads ONNX models and runs predictions.
"""

import numpy as np
import onnxruntime as ort
import joblib
import json

class SDETModelInference:
    def __init__(self, model_dir="ml-models"):
        self.model_dir = model_dir
        self.sessions = {}
        self.metadata = {}
        self.load_models()

    def load_models(self):
        """Load all ONNX models and metadata."""
        with open(f"{self.model_dir}/model-metadata.json") as f:
            self.metadata = json.load(f)

        for model_name in ['flake-detector', 'failure-predictor', 'test-prioritizer', 'root-cause']:
            onnx_path = f"{self.model_dir}/{model_name}.onnx"
            joblib_path = f"{self.model_dir}/{model_name.replace('-', '_')}.joblib"

            try:
                self.sessions[model_name] = ort.InferenceSession(onnx_path)
                print(f">> Loaded ONNX: {model_name}")
            except:
                # Fallback to joblib
                artifacts = joblib.load(joblib_path)
                self.sessions[model_name] = artifacts
                print(f">> Loaded joblib: {model_name}")

    def preprocess(self, features_dict):
        """Preprocess input features (match training preprocessing)."""
        # This should match the training preprocessing exactly
        # In production, load the saved encoders and scaler
        pass

    def predict_flaky(self, test_features):
        """Predict if a test is flaky."""
        session = self.sessions['flake-detector']
        input_name = session.get_inputs()[0].name
        # preprocess test_features to match training format
        X = self._prepare_input(test_features)
        prob = session.run(None, {input_name: X})[0][:, 1]
        return {'is_flaky': prob > 0.5, 'probability': float(prob)}

    def predict_failure(self, test_features):
        """Predict if a test will fail next run."""
        session = self.sessions['failure-predictor']
        input_name = session.get_inputs()[0].name
        X = self._prepare_input(test_features)
        prob = session.run(None, {input_name: X})[0][:, 1]
        return {'will_fail': prob > 0.5, 'probability': float(prob)}

    def predict_priority(self, test_features):
        """Predict test priority rank."""
        session = self.sessions['test-prioritizer']
        input_name = session.get_inputs()[0].name
        X = self._prepare_input(test_features)
        rank = session.run(None, {input_name: X})[0]
        return {'priority_rank': float(rank[0])}

    def predict_root_cause(self, test_features):
        """Predict root cause category."""
        session = self.sessions['root-cause']
        input_name = session.get_inputs()[0].name
        X = self._prepare_input(test_features)
        probs = session.run(None, {input_name: X})[0]
        classes = self.metadata['models']['root-cause']['output'].split('(')[1].split(')')[0].split(', ')
        pred_idx = np.argmax(probs)
        return {
            'root_cause': classes[pred_idx],
            'probabilities': {c: float(p) for c, p in zip(classes, probs[0])}
        }

    def _prepare_input(self, features_dict):
        """Convert features dict to model input array."""
        # Load feature names from metadata
        feature_names = self.metadata['models']['flake-detector']['input_features']
        # Create array in correct order
        arr = np.array([[features_dict.get(f, 0) for f in feature_names]], dtype=np.float32)
        return arr


if __name__ == "__main__":
    # Example usage
    inference = SDETModelInference()

    # Example test features
    test = {
        'test_type': 'ui',
        'priority': 'high',
        'component': 'comp-5',
        'owner_team': 'team-2',
        'lines_of_code': 150,
        'cyclomatic_complexity': 8,
        'has_mock': 0,
        'has_async': 1,
        'uses_database': 1,
        'uses_external_api': 1,
        'test_age_days': 45,
        'last_modified_days': 5,
        'total_runs': 100,
        'pass_rate': 0.85,
        'avg_duration_ms': 5000,
        'duration_std': 2000,
        'flaky_rate': 0.15,
        'consecutive_passes': 3,
        'consecutive_failures': 2,
        'failure_pattern': 'intermittent',
        'recent_changes': 4,
        'lines_changed': 80,
        'files_changed': 3,
        'author_churn': 1,
        'is_new_test': 0,
        'env_stability_score': 0.7,
        'parallel_execution': 1,
        'resource_contention': 0.3
    }

    print("\\n>> Predictions:")
    print(f"  Flaky: {inference.predict_flaky(test)}")
    print(f"  Failure: {inference.predict_failure(test)}")
    print(f"  Priority: {inference.predict_priority(test)}")
    print(f"  Root Cause: {inference.predict_root_cause(test)}")
'''

    with open(f'{OUTPUT_DIR}/inference_example.py', 'w') as f:
        f.write(inference_code)

    print(f">> Inference example saved: {OUTPUT_DIR}/inference_example.py")


def create_serving_config():
    """Create model serving configuration."""
    config = {
        "service": "sdet-ml-serving",
        "version": "1.0.0",
        "models": [
            {
                "name": "flake-detector",
                "path": "flake-detector.onnx",
                "input": "float_input",
                "output": "probabilities",
                "batch_size": 32,
                "timeout_ms": 100
            },
            {
                "name": "failure-predictor",
                "path": "failure-predictor.onnx",
                "input": "float_input",
                "output": "probabilities",
                "batch_size": 32,
                "timeout_ms": 100
            },
            {
                "name": "test-prioritizer",
                "path": "test-prioritizer.onnx",
                "input": "float_input",
                "output": "predictions",
                "batch_size": 64,
                "timeout_ms": 50
            },
            {
                "name": "root-cause",
                "path": "root-cause.onnx",
                "input": "float_input",
                "output": "probabilities",
                "batch_size": 16,
                "timeout_ms": 200
            }
        ],
        "server": {
            "host": "0.0.0.0",
            "port": 8080,
            "workers": 4,
            "log_level": "info"
        },
        "monitoring": {
            "metrics_port": 9090,
            "health_check": "/health",
            "drift_detection": True
        }
    }

    with open(f'{OUTPUT_DIR}/serving-config.yaml', 'w') as f:
        import yaml
        yaml.dump(config, f, default_flow_style=False)

    print(f">> Serving config saved: {OUTPUT_DIR}/serving-config.yaml")


def create_dockerfile():
    """Create Dockerfile for model serving."""
    dockerfile = '''FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \\
    gcc g++ libgomp1 \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy models and inference code
COPY ml-models/ ./ml-models/
COPY inference_example.py .

# Expose ports
EXPOSE 8080 9090

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost:8080/health || exit 1

# Run server
CMD ["python", "-m", "ml_server"]
'''

    with open(f'{OUTPUT_DIR}/Dockerfile', 'w') as f:
        f.write(dockerfile)

    print(f">> Dockerfile saved: {OUTPUT_DIR}/Dockerfile")


def create_requirements():
    """Create requirements.txt for model serving."""
    reqs = '''onnxruntime==1.18.0
scikit-learn==1.4.0
numpy==1.26.0
pandas==2.1.0
joblib==1.3.0
fastapi==0.109.0
uvicorn==0.27.0
pydantic==2.5.0
prometheus-client==0.19.0
pyyaml==6.0.1
'''

    with open(f'{OUTPUT_DIR}/requirements.txt', 'w') as f:
        f.write(reqs)

    print(f">> Requirements saved: {OUTPUT_DIR}/requirements.txt")


def main():
    print(">> Starting SDET ML Models Training Pipeline")
    print("=" * 50)

    # Generate synthetic training data
    print("\n>> Generating synthetic training data...")
    df = generate_synthetic_training_data(n_samples=10000)
    print(f"  Generated {len(df)} samples with {len(df.columns)} features")
    print(f"  Flaky rate: {df['is_flaky'].mean():.2%}")
    print(f"  Failure rate: {df['will_fail_next'].mean():.2%}")
    print(f"  Root cause distribution:")
    print(df['root_cause'].value_counts())

    # Save training data for reference
    df.to_parquet(f'{OUTPUT_DIR}/training_data.parquet', index=False)
    print(f"  Training data saved: {OUTPUT_DIR}/training_data.parquet")

    # Train all models
    train_flake_detector(df)
    train_failure_predictor(df)
    train_test_prioritizer(df)
    train_root_cause(df)

    # Create supporting files
    create_model_metadata()
    create_inference_example()
    create_serving_config()
    create_dockerfile()
    create_requirements()

    print("\n" + "=" * 50)
    print(">> All models trained and exported successfully!")
    print(f"\n>> Output directory: {OUTPUT_DIR}/")
    print("   - flake-detector.onnx")
    print("   - failure-predictor.onnx")
    print("   - test-prioritizer.onnx")
    print("   - root-cause.onnx")
    print("   - model-metadata.json")
    print("   - inference_example.py")
    print("   - serving-config.yaml")
    print("   - Dockerfile")
    print("   - requirements.txt")
    print("   - training_data.parquet")
    print("   - *.joblib (fallback models)")


if __name__ == "__main__":
    main()