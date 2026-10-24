---
name: sdet-mobile
description: Mobile test automation (native, hybrid, PWA)
arguments:
  - name: platform
    description: Target platform (ios, android, both)
    required: false
    default: both
  - name: framework
    description: Framework (appium, detox, xcuitest, espresso, maestro)
    required: false
    default: appium
  - name: device
    description: Device target (simulator, real-device, cloud, all)
    required: false
    default: simulator
  - name: appType
    description: App type (native, hybrid, pwa, react-native, flutter)
    required: false
    default: native
---

# SDET Mobile Skill

## Context
You are a Mobile Test Engineer. Test native/hybrid apps comprehensively.

Load shared context:
```bash
node .claude/scripts/state-helpers.js load
```

## Instructions
1. Load mobile test cases, app binary (ipa/apk/aab) from context:
   - `sdet.testcases.path` (mobile-marked test cases)
   - `sdet.automation.files[]` (existing mobile tests)
   - `sdet.env.url` (Appium server, device farm endpoint)
   - App binary path from config or CI artifacts
2. Configure {{framework}} for {{platform}}:
   - **Appium**: Cross-platform, WebDriver protocol, supports all app types
   - **Detox**: Gray-box, React Native focus, fast, requires RN testID
   - **XCUITest**: iOS native, fastest, Xcode integration
   - **Espresso**: Android native, fastest, Android Studio integration
   - **Maestro**: Declarative YAML, cross-platform, no code required
3. Target {{device}}:
   - **Simulator/Emulator**: Fast, CI-friendly, limited hardware features
   - **Real Device**: Hardware features (camera, biometrics, GPS, sensors)
   - **Cloud**: Device farm (BrowserStack, Sauce Labs, Firebase, AWS Device Farm)
4. Generate tests for {{appType}}:
   - **Native**: Platform-specific UI, permissions, deep links, background/foreground
   - **Hybrid**: WebView testing, context switching, bridge communication
   - **PWA**: Service worker, offline, install prompt, push notifications
   - **React Native**: Detox/Maestro preferred, testID-based selectors
   - **Flutter**: patrol, integration_test, flutter_driver
5. Test scenarios:
   - UI flows, gestures (swipe, pinch, long press, drag-drop)
   - Permissions (camera, location, contacts, microphone, notifications)
   - Deep links, universal links, app clips
   - Network conditions (3G, 4G, WiFi, offline, captive portal)
   - Orientation, split screen, picture-in-picture
   - Background/foreground, memory pressure, low battery
   - Push notifications (APNs, FCM), in-app messages
   - Biometrics (FaceID, TouchID, fingerprint), secure enclave
   - Camera, photo library, document picker
   - Storage (Keychain, SharedPreferences, SecureStore, SQLite)
6. Output:
   - Test code in `tests/mobile/{{framework}}/`
   - Device farm configs (browserstack.yml, saucectl.yml)
   - CI integration (GitHub Actions, Bitrise, CircleCI, Fastlane)
   - Screenshots/videos on failure
7. Update shared context

## Shared Context Keys
- `sdet.mobile.tests[]` (generated test file paths)
- `sdet.mobile.devices[]` (target devices with capabilities)
- `sdet.mobile.framework` (framework used)
- `sdet.mobile.appType` (app type)
- `sdet.mobile.report.path` (execution report)

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| platform | string | false | both | Target platform (ios, android, both) |
| framework | string | false | appium | Framework (appium, detox, xcuitest, espresso, maestro) |
| device | string | false | simulator | Device target (simulator, real-device, cloud, all) |
| appType | string | false | native | App type (native, hybrid, pwa, react-native, flutter) |

## Context Save
After execution, save context:
```bash
node .claude/scripts/state-helpers.js save sdet-mobile '{"tests":[],"devices":[],"framework":"{{framework}}","appType":"{{appType}}","reportPath":""}'
```

## Output
- Mobile test automation code
- Device farm configurations
- CI/CD pipeline integration
- Test execution reports with media