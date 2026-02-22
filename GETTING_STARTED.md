# Getting Started - My Travel App

## Quick Start

### 1. Prerequisites
- Flutter 3.11 or higher
- Dart 3.11 or higher
- Xcode (for iOS) or Android Studio (for Android)

### 2. Install Dependencies
```bash
cd /Users/andreacossu/my-travel-app-new
flutter pub get
```

### 3. Run the App
```bash
flutter run
```

For specific platform:
```bash
flutter run -d ios
flutter run -d android
flutter run -d chrome
```

## Project Structure

```
lib/
├── main.dart              # App entry point
├── pages/                 # UI screens/pages
├── widgets/               # Reusable components
├── services/              # Firebase & backend services
├── models/                # Data models
└── theme/                 # Design system
```

## Current Features

✅ **Interactive Home Page**
- Rotating globe with drag controls
- Country/continent selection
- Featured destinations showcase
- Bottom navigation structure

## Next Phase Features

📅 **Coming Soon**
- Country detail pages
- Firebase Firestore integration
- User authentication
- Favorites management
- Interactive map view

## Key Design Colors

| Name       | Color    | Hex     | Usage                          |
|-----------|----------|---------|--------------------------------|
| Primary   | Blue     | #0D47A1 | Water, backgrounds             |
| Secondary | Green    | #4CAF50 | Countries, interactive areas   |
| Accent    | Orange   | #FB8C00 | Highlights, CTAs               |
| Background| Dark Gray| #212121 | Main app background            |
| Text      | Light    | #F5F5F5 | Primary text                   |

## Useful Commands

```bash
# Check code analysis
flutter analyze

# Get latest dependencies
flutter pub upgrade

# Clean build
flutter clean
flutter pub get
flutter run

# Run on specific device
flutter devices
flutter run -d <device-id>

# Build APK (Android)
flutter build apk

# Build IPA (iOS)
flutter build ios
```

## Project Architecture

The app follows a clean architecture with separation of concerns:

- **Pages**: UI screens
- **Widgets**: Reusable UI components
- **Services**: Business logic and external services (Firebase)
- **Models**: Data structures
- **Theme**: Design system and constants

## State Management

The app uses `provider` package for state management. When adding new features:

1. Create a provider class extending `ChangeNotifier`
2. Implement state logic in the provider
3. Use `Consumer<ProviderClass>` in widgets to access state
4. Update state using `notifyListeners()`

## Firebase Setup

Firebase integration is prepared but not yet configured. To set it up:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Add iOS app: Download `GoogleService-Info.plist` → Place in `ios/Runner/`
4. Add Android app: Download `google-services.json` → Place in `android/app/`
5. Initialize Firebase in `main.dart` (already prepared in `FirebaseService`)

## Common Tasks

### Add a New Page
1. Create file in `lib/pages/`
2. Create a `StatelessWidget` or `StatefulWidget`
3. Add route in `main.dart` (when navigation is implemented)

### Add a New Widget
1. Create file in `lib/widgets/`
2. Extract reusable UI components
3. Use in pages as needed

### Add a New Model
1. Create file in `lib/models/`
2. Define data structure with constructor
3. Add serialization methods for Firebase (when needed)

### Modify Theme
1. Edit color palette in `lib/theme/app_colors.dart`
2. Edit typography in `lib/theme/app_typography.dart`
3. Update theme configuration in `lib/theme/app_theme.dart`

## Troubleshooting

### App won't run
```bash
flutter clean
flutter pub get
flutter run
```

### Build issues
- Make sure Flutter SDK is up to date: `flutter upgrade`
- Check device availability: `flutter devices`
- Review error messages carefully

### Performance issues
- Profile app: `flutter run --profile`
- Use DevTools: `flutter pub global activate devtools`

## Support

For detailed documentation, see:
- **README.md** - Project overview
- **ARCHITECTURE.md** - Technical architecture
- [Flutter Documentation](https://flutter.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)

## Next Steps

1. **Understand the Code**: Review `HomePage` and `InteractiveGlobe` widgets
2. **Explore Design System**: Check `lib/theme/` for colors and typography
3. **Plan Phase 2**: Country detail pages and Firebase integration
4. **Test**: Run the app on iOS/Android simulator or real device

Happy coding! 🚀
