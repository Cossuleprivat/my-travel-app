# My Travel App - Architecture Documentation

## Project Overview

**My Travel App** is a Flutter application with Firebase integration, designed to provide an interactive way to explore the world through an immersive 3D globe interface.

## Current Status

### Phase 1: ✅ Complete - Interactive Globe Home Page
- ✅ Flutter project setup with Firebase dependencies
- ✅ Custom theme system with design guidelines (colors, typography)
- ✅ Interactive 3D-like rotating globe widget
- ✅ Home page with globe interaction
- ✅ Bottom navigation bar structure
- ✅ Featured destinations showcase

## Project Structure

```
lib/
├── main.dart                    # App entry point with theme configuration
├── pages/
│   ├── home_page.dart          # Main landing page with interactive globe
│   └── country_detail_page.dart # Placeholder for country detail pages (Phase 2)
├── widgets/
│   └── interactive_globe.dart   # Interactive globe widget with drag rotation
├── services/
│   └── firebase_service.dart    # Firebase initialization and services (Phase 2)
├── models/
│   └── country.dart             # Country data model
└── theme/
    ├── app_colors.dart          # Color palette definitions
    ├── app_typography.dart      # Typography styles
    └── app_theme.dart           # Material theme configuration
```

## Design System

### Color Palette
- **Primary**: #0D47A1 (Deep Blue) - Water, backgrounds, primary UI
- **Secondary**: #4CAF50 (Muted Green) - Countries, buttons
- **Accent**: #FB8C00 (Warm Orange) - Highlights, CTAs
- **Background**: #212121 (Dark Gray) - Main app background
- **Text**: #F5F5F5 (Light Gray) - Primary text on dark backgrounds

### Typography
- **Font Family**: Roboto
- **Heading 1**: 32pt Bold
- **Heading 2**: 24pt Bold
- **Heading 3**: 20pt Bold
- **Body**: 16pt Regular
- **Caption**: 12pt Regular

## Features

### Home Page
- **Interactive Globe**: Rotating 3D-like globe with:
  - Auto-rotation (enabled by default)
  - Horizontal drag to rotate
  - Vertical drag to tilt
  - Clickable country/continent regions
  
- **Featured Destinations**: Grid showcase of popular cities
- **Bottom Navigation**: Placeholder structure for:
  - Explore (active)
  - Favorites (planned)
  - Map (planned)
  - Profile (planned)

- **Responsive Design**: Adapts to different screen sizes

## Dependencies

### Firebase (Phase 2)
```yaml
firebase_core: ^2.32.0
cloud_firestore: ^4.17.5
firebase_auth: ^4.19.0
```

### State Management
```yaml
provider: ^6.1.5+1
```

## Next Steps (Phase 2)

1. **Country Detail Pages**
   - Create dedicated pages for each country
   - Display detailed country information
   - Show cities and attractions
   - Add travel guides and recommendations

2. **Firebase Integration**
   - Initialize Firebase in the app
   - Set up Firestore database with countries and cities data
   - Implement Firebase Auth for user accounts
   - Store user favorites and preferences

3. **Bottom Navigation Enhancement**
   - Implement navigation to all tabs
   - Create Favorites page with user's saved destinations
   - Implement Map view with country highlights
   - Add User Profile page

4. **Data Population**
   - Load country data from Firestore
   - Create comprehensive travel database
   - Add images and media for destinations

## Development Guidelines

### Code Style
- Use `provider` for state management
- Keep widgets small and focused
- Document public APIs with comments
- Follow Dart naming conventions

### Navigation
- Navigation to country detail pages will use named routes
- Example: `Navigator.pushNamed(context, '/country/US')`

### Testing
- Run analysis: `flutter analyze`
- Check code: `flutter pub get`

## Known Limitations & Future Improvements

1. **Globe Rendering**: Currently using 2D approximation with transforms
   - Future: Integrate true 3D globe library (babylon.dart, three_dart, or model_viewer)

2. **Country Regions**: Simplified with circular markers
   - Future: Add detailed geographic boundaries and proper GeoJSON support

3. **Navigation**: Currently shows placeholder messages
   - Future: Implement full routing to country detail pages

4. **Data**: Hardcoded featured destinations
   - Future: Load all countries and cities from Firestore

## Getting Started

### Prerequisites
- Flutter 3.11+
- Dart 3.11+
- iOS 11+ or Android 5.0+

### Installation
```bash
# Install dependencies
flutter pub get

# Run the app
flutter run
```

### Firebase Setup
1. Create a Firebase project in Firebase Console
2. Add iOS/Android apps to your project
3. Download and configure GoogleService-Info.plist (iOS) or google-services.json (Android)
4. Follow Firebase setup guides in the console

## Documentation

- **README.md** - Project overview and guidelines
- **ARCHITECTURE.md** - This file, technical documentation
- **pubspec.yaml** - Dependency management

## Contact & Support

For questions or contributions, please refer to the project guidelines in README.md.
