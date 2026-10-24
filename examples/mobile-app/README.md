# Mobile App Example Project

## Overview
React Native (Expo) e-commerce mobile application for iOS and Android with native features.

## Architecture
```
mobile-app/
├── app/                    # Expo Router file-based routing
│   ├── (auth)/            # Auth stack
│   ├── (tabs)/            # Main tab navigation
│   ├── product/           # Product screens
│   ├── cart/              # Cart & checkout
│   ├── account/           # Account screens
│   └── _layout.tsx        # Root layout
├── src/
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API, storage, notifications
│   ├── store/             # Zustand/Redux state
│   ├── utils/             # Helpers
│   ├── types/             # TypeScript types
│   └── constants/         # Config, theme
├── assets/                # Images, fonts, animations
├── tests/
│   ├── unit/              # Jest + React Native Testing Library
│   ├── integration/       # Detox E2E tests
│   ├── visual/            # Visual regression
│   └── performance/       # Flashlist/React Native Perf
├── ios/                   # Native iOS code (if needed)
├── android/               # Native Android code (if needed)
├── .github/workflows/     # CI/CD pipelines
├── eas.json               # EAS Build config
├── app.json               # Expo config
└── package.json
```

## Requirements (requirements/)
See `requirements/` folder for:
- `functional.md` - User stories and acceptance criteria
- `non-functional.md` - Performance, security, platform requirements

## Quick Start

### 1. Analyze Requirements
```bash
/sdet-analyze --source ./requirements --format json
```

### 2. Generate Test Cases
```bash
/sdet-generate --template mobile --includeNegative --includeBoundary
```

### 3. Validate Test Cases
```bash
/sdet-validate --strict
```

### 4. Generate Automation
```bash
/sdet-automate --type ui --framework detox --pattern pom
/sdet-automate --type ui --framework appium --pattern screenplay
```

### 5. Execute Tests
```bash
# Local simulator/emulator
/sdet-execute --type ui --platform ios --device "iPhone 15" --parallel 2

# Device farm
/sdet-execute --type ui --platform both --device cloud --farm browserstack

# All
/sdet-execute --type ui --parallel 4 --retry 2
```

### 6. Analyze Results
```bash
/sdet-analyze-results --updateExcel --createDefects
```

### 7. Generate CI/CD Pipeline
```bash
/sdet-deploy --platform github-actions --qualityGates --platforms ios,android
```

### 8. Full Pipeline
```bash
/sdet-orchestrate --workflow full --autoApprove
```

## Key Features to Test

### Functional
- Authentication (biometric, social, email/password)
- Product discovery (search, filters, categories)
- Cart management (swipe, quantity, promo codes)
- Checkout (Apple Pay, Google Pay, card)
- Order tracking (map, push notifications)
- Profile management
- Offline support (cache, queue, sync)

### Platform-Specific
- **iOS**: Face ID, Apple Pay, Universal Links, Widgets, Siri Shortcuts, App Clips
- **Android**: BiometricPrompt, Google Pay, App Links, Widgets, App Actions
- **Both**: Push notifications (FCM/APNs), Deep links, Background sync

### Non-Functional
- **Performance**: Cold start < 2.5s, 60 FPS, memory < 200MB
- **Security**: Keychain/Keystore, certificate pinning, no PII in logs
- **Accessibility**: VoiceOver/TalkBack, Dynamic Type, Switch Control
- **Reliability**: Crash-free > 99.9%, offline-first
- **Compatibility**: iOS 16+, Android 7+, all screen sizes

## Test Scenarios

### Unit Tests (Jest + RNTL)
- Reducers, selectors, hooks
- Utility functions
- Component rendering with props
- API service mocking

### E2E Tests (Detox)
- Critical user flows (login → browse → purchase)
- Platform-specific features (Apple Pay, biometrics)
- Offline/online transitions
- Deep link navigation
- Push notification handling

### Cross-Platform Tests (Appium)
- Regression suite on device farm
- Real device testing (iOS + Android)
- Parallel execution on BrowserStack/Firebase Test Lab

### Visual Regression (Percy/Applitools)
- All screens at 3 sizes (phone, large phone, tablet)
- Light/dark mode
- Dynamic Type sizes
- RTL languages

### Performance Tests
- Launch time measurement
- Scroll performance (Flashlist)
- Memory profiling
- Battery impact
- Network request optimization

### Accessibility Tests
- axe-core/react-native for automated
- Manual VoiceOver/TalkBack verification
- Dynamic Type scaling
- Contrast ratios

### Security Tests
- OWASP MASVS compliance
- Static analysis (Semgrep mobile rules)
- Dependency scanning (Snyk)
- Runtime protection verification

## CI/CD Pipeline (GitHub Actions + EAS)
```yaml
stages:
  - analyze: Requirement analysis
  - generate: Test case generation
  - validate: Test case validation
  - automate: Automation code generation
  - test:
      - unit: Jest on every PR
      - detox-ios: iOS simulator (macOS runner)
      - detox-android: Android emulator (Ubuntu runner)
      - appium: Device farm (scheduled)
      - visual: Percy visual regression
      - performance: Launch time, memory
      - accessibility: axe-core + manual checklist
      - security: Semgrep, Snyk, dependency check
  - analyze-results: Results analysis
  - build: EAS Build (development/preview/production)
  - deploy: TestFlight / Play Console Internal
  - release: Phased rollout
```

## Quality Gates
- Unit test coverage: > 80%
- Detox E2E: Critical paths 100%
- No critical crashes in CI
- Performance: Launch < 2.5s, 60 FPS scroll
- Accessibility: WCAG 2.1 AA automated + manual
- Security: No high/critical vulnerabilities
- Visual: No unapproved regressions

## Running the Example
```bash
# Install dependencies
npm install

# Start Expo dev server
npx expo start

# Run on simulator/emulator
# iOS: Press 'i' in terminal (requires macOS)
# Android: Press 'a' in terminal

# Run Detox tests
# iOS: npm run test:detox:ios
# Android: npm run test:detox:android

# Run SDET pipeline
/sdet-orchestrate --workflow quick --autoApprove
```

## Device Testing Matrix

### iOS (TestFlight + Device Farm)
| Device | OS | Size | Density |
|--------|-----|------|---------|
| iPhone SE 3rd | 16+ | 375x667 | 2x |
| iPhone 14 | 16+ | 390x844 | 3x |
| iPhone 15 Pro | 17+ | 393x852 | 3x |
| iPhone 15 Pro Max | 17+ | 430x932 | 3x |
| iPad Air | 16+ | 820x1180 | 2x |
| iPad Pro 12.9" | 16+ | 1024x1366 | 2x |

### Android (Play Console + Device Farm)
| Device | API | Size | Density |
|--------|-----|------|---------|
| Pixel 6a | 33 | 393x851 | 2.75x |
| Pixel 7 Pro | 34 | 412x915 | 3.5x |
| Samsung S23 | 33 | 360x800 | 3x |
| Samsung S24 Ultra | 34 | 412x946 | 3.5x |
| Xiaomi 13 | 33 | 360x800 | 3x |
| Galaxy Z Fold 5 | 34 | 673x812 (folded) | 3x |
| Tablet (Pixel Tablet) | 33 | 1024x768 | 2x |

## Build & Release

### EAS Build Profiles
```json
{
  "development": { "developmentClient": true },
  "preview": { "distribution": "internal" },
  "production": { "distribution": "store" }
}
```

### Fastlane Lanes
- `ios beta` → TestFlight
- `ios release` → App Store Connect
- `android beta` → Play Console Internal
- `android release` → Play Console Production

### Phased Rollout
1. Internal team (100%)
2. Alpha testers (5%)
3. Beta testers (25%)
4. Production (phased: 1% → 10% → 50% → 100%)

## Monitoring & Analytics

### Crash Reporting
- Sentry (React Native SDK)
- Native crashes: PLCrashReporter (iOS), firebase-crashlytics (Android)
- Symbol upload: EAS Build auto-upload

### Performance
- Firebase Performance Monitoring
- Expo Application Services (EAS) Insights
- Custom metrics: launch time, screen load, API latency

### Business
- Amplitude / Mixpanel for funnel analysis
- RevenueCat for subscription tracking
- Custom events for key actions