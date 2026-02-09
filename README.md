WCFinder – WC-Finder und Reservierungsplattform
===============================================

**Version:** 1.0.0  
**Status:** Production Ready  
**Pilotregion:** Bonn, Deutschland

---

## 📋 Projektüberblick

WCFinder ist eine Plattform, mit der Nutzer in der Stadt oder auf Reisen schnell und einfach **öffentliche / private Toiletten** finden, reservieren und per **Stripe / PayPal** bezahlen können.  
Geschäftsinhaber können ihre Toiletten listen und so zusätzliche Einnahmen erzielen.

### Hauptfunktionen

- 🗺️ **Interaktive Karte** – Toiletten-Suche nach Standort  
  - Web: Leaflet  
  - Mobile: React Native Maps
- 📱 **Mobile App** – Expo / React Native für iOS & Android
- 📅 **Reservierungssystem** – Datum, Uhrzeit und Personenzahl
- 💳 **Zahlungsabwicklung** – Stripe & PayPal (Test- & Live-Modus)
- 🎫 **QR-Code-Verifizierung** – Einlass / Nutzung über QR-Code
- ⭐ **Bewertungen** – Bewertungen & Rezensionen für Toiletten
- 📊 **Business-Panel** – Reservierungen & Umsätze für Betreiber
- 🔐 **Admin-Panel** – Freigabe von Businesses, Monitoring, Auswertungen
- 🧾 **Rechnungssystem (Rechnung)** – XRechnung / EN 16931 kompatible Rechnungen für Auszahlungen an Betreiber

---

## 🛠️ Tech-Stack

### Web Frontend (`CLIENT`)

- **React** 19.x
- **Material-UI (MUI)** 7.x
- **Redux Toolkit** – State-Management
- **React Router** – Routing
- **Leaflet** – Karten
- **Vite** – Build-Tool

### Mobile App (`MOBILE`)

- **Expo** – Entwicklung & Build (iOS / Android)
- **React Native** + **TypeScript**
- **Expo Router** – File-based Routing
- **React Native Paper** – UI-Komponenten
- **expo-secure-store** – sichere Token-Speicherung
- Offline- & Error-Handling (Netzwerkstatus, ErrorBoundary)

### Backend (`SERVER`)

- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **JWT** – Authentifizierung (Access- & Refresh-Tokens)
- **Stripe** – Kartenzahlungen
- **PayPal** – Alternative Zahlungen
- **PDF / XRechnung** – gesetzeskonforme Rechnungen (Deutschland)

### DevOps & Infrastruktur

- **MongoDB Atlas** – gehostete MongoDB
- **Railway** – Deployment von Backend & Frontend
- **Swagger / ReDoc** – API-Dokumentation

---

## 🚀 Schnellstart

### Voraussetzungen

- **Node.js 18+**
- npm oder yarn
- MongoDB  
  - lokal (`mongodb://localhost:27017/wcfinder`) **oder**  
  - MongoDB Atlas Connection String
- Stripe- und PayPal-Testkonten (für Zahlungen)
- Für Mobile: Expo Go App oder iOS/Android-Emulator

### Installation

1. **Repository klonen**

```bash
git clone https://github.com/yourusername/wcfinder.git
cd WCFinder
```

2. **Backend (`SERVER`)**

```bash
cd SERVER
npm install
cp .env.example .env

# .env anpassen:
# MONGODB, ACCESS_KEY, REFRESH_KEY, STRIPE_SECRET_KEY, PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, ...

npm run dev
```

Standard:
- Backend läuft auf `http://localhost:8000`
- Swagger: `http://localhost:8000/documents/swagger`

3. **Web-Frontend (`CLIENT`)**

```bash
cd CLIENT
npm install
cp .env.example .env.local

# .env.local anpassen:
# VITE_BASE_URL=http://localhost:8000
# VITE_STRIPE_PUBLISHABLE_KEY=...
# VITE_PAYPAL_CLIENT_ID=...

npm run dev
```

Standard:
- Frontend läuft auf `http://localhost:5173`

4. **Mobile App (`MOBILE`, optional aber empfohlen)**

```bash
cd MOBILE
npm install

# API-URL konfigurieren:
# Entweder in app.config.js / app.json oder .env:
# EXPO_PUBLIC_API_URL=http://localhost:8000

npm start
```

Dann:
- `i` für iOS-Simulator  
- `a` für Android-Emulator  
- oder QR-Code mit **Expo Go** scannen

Details zur Mobile-App findest du lokal in `MOBILE_APP_GUIDE.md` und `MOBILE/README.md` (werden nicht zu GitHub gepusht).

---

## 📁 Projektstruktur (Kurzfassung)

```text
WCFinder/
├── CLIENT/                 # React Web Frontend
│   ├── src/
│   │   ├── components/    # UI-Komponenten
│   │   ├── pages/         # Seiten
│   │   ├── features/      # Redux-Slices & Admin-UI
│   │   └── router/        # Routing-Konfiguration
│   └── package.json
│
├── SERVER/                 # Node.js Backend (Express)
│   ├── src/
│   │   ├── models/        # Mongoose-Modelle
│   │   ├── controller/    # Controller (Business-Logik)
│   │   ├── routes/        # API-Routen
│   │   ├── middleware/    # Auth, Validierung, Errors, Rate-Limiting
│   │   ├── services/      # Payment, Rechnung, Analytics
│   │   └── utils/         # Logger, Env-Validator, Helpers
│   └── package.json
│
├── MOBILE/                 # Expo / React Native App
│   ├── app/               # Expo Router-Seiten (Tabs, Modals, Auth)
│   ├── src/
│   │   ├── components/   # Map, Cards, Common UI
│   │   ├── hooks/        # useBusiness, useAuth, useLocation, ...
│   │   ├── services/     # API-Client, Geocoding
│   │   └── store/        # Redux (auth)
│   └── package.json
│
└── README.md               # Diese Datei
```

---

## 🔐 Authentifizierung & Rollen

- **JWT-basierte Authentifizierung**
  - Access Token (~1h)
  - Refresh Token (~3 Tage)
- **Rollen**
  - `user` – Endnutzer
  - `owner` – Geschäftsinhaber (WC-Betreiber)
  - `admin` – Plattform-Administrator

Der erste Admin kann über das Script / die Anleitung in `CREATE_ADMIN_USER.md` erstellt werden (wird lokal gehalten, nicht auf GitHub).

---

## 💳 Zahlungen & Kommission

- Integration von **Stripe** und **PayPal**
- Plattform-Gebühr (Service Fee) pro Nutzung
- Restbetrag wird dem Business gutgeschrieben (Auszahlung über Admin-Panel)
- Vollständige Dokumentation lokal in:
  - `COMMISSION_SYSTEM_DOCUMENTATION.md`
  - `STRIPE_TEST_CARDS.md`

---

## 📚 Lokale Dokumentation (nicht in GitHub)

Die meisten detaillierten Dokumente (`*.md`) werden per `.gitignore` **nicht** zu GitHub gepusht, sind aber im Projektordner vorhanden, z. B.:

- `prd.md` – Product Requirements Document
- `CLIENT/docs/ARCHITECTURE.md` – Architektur
- `ADMIN_PANEL_GUIDE.md` – Admin-Panel & Business-Management
- `RECHNUNG_SYSTEM_COMPLETE.md` – deutsches Rechnungssystem (XRechnung / EN 16931)
- `SECURITY_REVIEW.md` – ausführlicher Security-Review
- `CLEAN_CODE_IMPROVEMENTS.md` – Clean-Code- & Sicherheitsverbesserungen
- `DEPLOYMENT_CHECKLIST.md`, `PRODUCTION_DEPLOYMENT.md`, `RAILWAY_DEPLOYMENT.md` – Deployment-Guides

Alle diese Dateien sind für die Entwicklung wichtig, werden aber nicht veröffentlicht.

---

## 🔒 Sicherheit (Kurzfassung)

Details siehe `SECURITY_REVIEW.md` (lokal).

- Passwort-Hashing mit PBKDF2 (SECRET_KEY, konfigurierbare Runden)
- Strikte Input-Validierung & Sanitizing (XSS / NoSQL-Injection)
- Rate-Limiting (Auth, Payment, API)
- CORS-Konfiguration abhängig von Umgebung
- HTTP-Sicherheitsheader (Helmet)
- Sichere Logging-Strategie (keine Passwörter / Tokens im Log)
- HTTPS im Produktivbetrieb (Railway)
- Mobile:
  - Tokens nur in `expo-secure-store` (kein AsyncStorage)
  - Network-Status-Handling & Fehleranzeigen

---

## 🧪 Tests

```bash
# Backend-Tests
cd SERVER
npm test

# Frontend-Tests
cd CLIENT
npm test

# Linting
npm run lint
```

---

## 🚢 Deployment (Überblick)

Die vollständigen Anleitungen liegen lokal in:

- `PRODUCTION_DEPLOYMENT.md`
- `DEPLOYMENT_CHECKLIST.md`
- `RAILWAY_DEPLOYMENT.md`
- `RAILWAY_ENV_VARIABLES.md`

**Typischer Flow:**

1. MongoDB Atlas einrichten (oder lokale MongoDB)
2. Backend auf Railway deployen (Root: `SERVER`)
3. Web-Frontend auf Railway (Root: `CLIENT`)
4. Domain / SSL konfigurieren
5. CORS & Environment-Variablen setzen
6. API-URL in `CLIENT` und `MOBILE` auf die Produktiv-Backend-URL stellen

---

## 📈 Roadmap (Auszug)

**Bereits umgesetzt**

- Mobile App (Expo / React Native)
- Karten- & Listen-Ansicht (Web & Mobile)
- Stripe- & PayPal-Integration
- XRechnung-kompatibles Rechnungssystem
- Admin-Dashboard mit Analytics, Zahlungen, Toiletten & Businesses

**Geplante Erweiterungen**

- Mehrsprachigkeit (DE / EN / TR)
- Automatisierte Auszahlungen (z. B. Stripe Connect)
- Push-Notifications (Mobile)
- Loyalty- / Punktesystem
- Abo-Modelle für Businesses

---

## 🤝 Contribution

1. Repository forken  
2. Feature-Branch erstellen (`git checkout -b feature/MeinFeature`)  
3. Änderungen committen (`git commit -m "Add MeinFeature"`)  
4. Branch pushen (`git push origin feature/MeinFeature`)  
5. Pull-Request eröffnen

---

## 📄 Lizenz

Dieses Projekt ist ein **privates Projekt**. Alle Rechte vorbehalten.

---

## 📞 Kontakt

- **E-Mail:** info@wcfinder.de  
- **Website:** www.wcfinder.de

---

**Letztes Update:** Februar 2025  
**Version:** 1.0.0

