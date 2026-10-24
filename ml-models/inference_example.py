"""
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

    print("\n>> Predictions:")
    print(f"  Flaky: {inference.predict_flaky(test)}")
    print(f"  Failure: {inference.predict_failure(test)}")
    print(f"  Priority: {inference.predict_priority(test)}")
    print(f"  Root Cause: {inference.predict_root_cause(test)}")
