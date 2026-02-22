# My Travel App - Flutter with Firebase

Eine interaktive Weltreise-App, die eine 3D-Weltkugel auf der Startseite darstellt, von der aus man Länder und Städte erkunden kann.

---

## 1. Überblick
Dies ist eine Flutter-App mit Firebase-Integration. Ziel ist eine interaktive Weltreise-App, die eine 3D-Weltkugel auf der Startseite darstellt, von der aus man Länder und Städte erkunden kann.

## 2. Farbpalette
- **Primärfarbe**: Tiefes Blau (#0D47A1) für Wasserflächen und Hintergründe
- **Sekundärfarbe**: Gedämpftes Grün (#4CAF50) für Länder und interaktive Buttons
- **Akzentfarbe**: Warmes Orange (#FB8C00) für Highlights und wichtige Aktionselemente
- **Hintergrund**: Dunkles Grau (#212121) für die gesamte App, um einen modernen Look zu schaffen
- **Schriftfarbe**: Hellgrau bis Weiß für gute Lesbarkeit auf dunklem Hintergrund

## 3. Typografie
- **Primäre Schrift**: Roboto, Regular und Bold
- **Überschriften**: Roboto Bold, 24pt für große Titel
- **Fließtext**: Roboto Regular, 16pt für normalen Text

## 4. Projektstruktur
```
/lib
  ├── pages/              # Alle Seiten (Startseite, Länderseiten, etc.)
  ├── widgets/            # Wiederverwendbare Widgets (3D-Globus, etc.)
  ├── services/           # Firebase-Anbindung (Auth, Datenbank)
  ├── models/             # Datenmodelle (Country, City, etc.)
  ├── theme/              # Design-Definitionen (Farben, Typografie)
  └── main.dart           # App-Einstiegspunkt
```

## 5. Bibliotheken
- `flutter_gl`: Für die Darstellung des 3D-Globus
- `firebase_core`: Firebase-Initialisierung
- `cloud_firestore`: Firestore-Datenbank
- `firebase_auth`: Firebase-Authentifizierung
- `provider`: State Management

## 6. Code-Stil
- State Management basiert auf `provider`
- Strukturierte, getrennte Widgets für bessere Wartbarkeit
- Kommentare und Dokumentation in englischer Sprache
- Saubere Benennung der Widgets und Variablen

---

## Erste Schritte

### Abhängigkeiten installieren
```bash
flutter pub get
```

### App ausführen
```bash
flutter run
```

### Firebase konfigurieren
Folge den Anweisungen in der Firebase Console, um dein Projekt einzurichten.

---

## Lizenz
MIT
