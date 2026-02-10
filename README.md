# 🚻 WCFinder

### WC-Finder und Reservierungsplattform für Städte und Reisen

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![React Native](https://img.shields.io/badge/React_Native-Mobile-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_&_Mongoose-47A248?style=for-the-badge&logo=mongodb)
![Expo](https://img.shields.io/badge/Expo-React_Native-000000?style=for-the-badge&logo=expo)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe)
![PayPal](https://img.shields.io/badge/PayPal-Payments-00457C?style=for-the-badge&logo=paypal)

<!-- Hero / Screenshot (Bild hier ablegen, Pfad anpassen) -->
![WCFinder UI](CLIENT/dist/assets/Screenshot%202026-02-10%20113119.png)

**Plattform für die Suche, Reservierung und Bezahlung von öffentlichen und privaten Toiletten.**  
Modernes Fullstack-Setup mit sicherer Zahlungsabwicklung, Rollenverwaltung und Multi-Client-Support (Web & Mobile).

[🌐 Live Demo](https://wc-finder-wheat.vercel.app) · [📋 Projektüberblick](#-projektüberblick) · [🚀 Schnellstart](#-schnellstart-lokal) · [🛠️ Tech-Stack](#-tech-stack) · [🚢 Deployment](#-deployment-kurzüberblick)

---

## 📋 Projektüberblick

WCFinder ist eine Plattform, mit der Nutzer in der Stadt oder auf Reisen schnell und einfach **öffentliche und private Toiletten** finden, reservieren und per **Stripe / PayPal** bezahlen können.  
Geschäftsinhaber können ihre Toiletten listen und so zusätzliche Einnahmen erzielen.

### 🎯 Hauptfunktionen

- **Interaktive Karte**
  - Web: Leaflet
  - Mobile: React Native Maps
- **Mobile App** – Expo / React Native für iOS & Android
- **Reservierungssystem** – Datum, Uhrzeit und Personenzahl
- **Zahlungsabwicklung** – Stripe & PayPal (Test- & Live-Modus)
- **QR-Code-Verifizierung** – Einlass / Nutzung über QR-Code
- **Bewertungen** – Ratings & Reviews für Toiletten
- **Business-Panel** – Reservierungen & Umsätze für Betreiber
- **Admin-Panel** – Freigabe von Businesses, Monitoring, Auswertungen
- **Rechnungssystem** – XRechnung / EN 16931 kompatible Auszahlungen an Betreiber

---

## 🛠️ Tech-Stack

### Web Frontend (`CLIENT`)

- **React** 19
- **Material-UI (MUI)** 7
- **Redux Toolkit** – State-Management
- **React Router** – Routing
- **Leaflet** – Kartenanzeige
- **Vite** – Dev-Server & Build

### Mobile App (`MOBILE`)

- **Expo** – Entwicklung & Build (iOS / Android)
- **React Native** + **TypeScript**
- **Expo Router** – File-based Routing
- **React Native Paper** – UI-Komponenten
- **expo-secure-store** – sichere Token-Speicherung
- Offline-Handling & Error-Handling (Netzwerkstatus, ErrorBoundary)

### Backend (`SERVER`)

- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **JWT** – Authentifizierung (Access- & Refresh-Tokens)
- **Stripe** – Kartenzahlungen
- **PayPal** – alternative Zahlungen
- **PDF / XRechnung** – gesetzeskonforme Rechnungen (Deutschland)

### DevOps & Infrastruktur

- **MongoDB Atlas** – gehostete MongoDB
- **Render** – Backend-Deployment (Root: `SERVER`)
- **Vercel** – Frontend-Deployment (Root: `CLIENT`)
- **Swagger / ReDoc** – API-Dokumentation

---

## 🚀 Schnellstart (Lokal)

### Voraussetzungen

- **Node.js 18+**
- **npm** oder **yarn**
- **MongoDB**
  - lokal: `mongodb://localhost:27017/wcfinder`
  - oder MongoDB Atlas Connection String
- Stripe- und PayPal-Testkonten (für Payments)
- Für Mobile: Expo Go App oder iOS/Android-Emulator

### Backend starten

```bash
cd SERVER
npm install
npm start
```

### Web-Frontend im Dev-Modus starten

```bash
cd CLIENT
npm install
npm run dev
```

Vite zeigt die lokale URL (z. B. `http://localhost:5173`) an.

---

## 🔐 Authentifizierung & Rollen

- **JWT-basierte Authentifizierung**
  - Access Token (kurzlebig)
  - Refresh Token (verlängert Session)
- **Rollen**
  - `user` – Endnutzer
  - `owner` – Geschäftsinhaber (WC-Betreiber)
  - `admin` – Plattform-Administrator

Der erste Admin wird über ein lokales Script erstellt (siehe `CREATE_ADMIN_USER.md`, nicht auf GitHub).

---

## 💳 Zahlungen & Kommission

- **Stripe** und **PayPal** Integration
- **Service Fee** pro Nutzung für die Plattform
- Restbetrag wird dem Business gutgeschrieben (Auszahlung über Admin-Panel)
- Details lokal dokumentiert in:
  - `COMMISSION_SYSTEM_DOCUMENTATION.md`
  - `STRIPE_TEST_CARDS.md`

---

## 📚 Lokale Dokumentation (nicht auf GitHub)

Viele detaillierte Dokumente (`*.md`) werden per `.gitignore` **nicht** zu GitHub gepusht, sind aber im Projektordner vorhanden, z. B.:

- **`prd.md`** – Product Requirements Document
- **`CLIENT/docs/ARCHITECTURE.md`** – Architektur
- **`ADMIN_PANEL_GUIDE.md`** – Admin-Panel & Business-Management
- **`RECHNUNG_SYSTEM_COMPLETE.md`** – deutsches Rechnungssystem (XRechnung / EN 16931)
- **`SECURITY_REVIEW.md`** – ausführlicher Security-Review
- **`CLEAN_CODE_IMPROVEMENTS.md`** – Clean-Code- & Sicherheitsverbesserungen
- **`RENDER_VERCEL_DEPLOYMENT.md`** – Backend (Render) + Frontend (Vercel)
- **`DEPLOYMENT_CHECKLIST.md`, `PRODUCTION_DEPLOYMENT.md`** – weitere Deployment-Guides

Diese Dateien sind für Entwicklung und Betrieb wichtig, werden aber nicht veröffentlicht.

---

## 🔒 Sicherheit (Kurzfassung)

Details siehe `SECURITY_REVIEW.md` (lokal).

- **Passwort-Hashing** mit PBKDF2 (`SECRET_KEY`, konfigurierbare Runden)
- **Input-Validierung & Sanitizing** (Schutz vor XSS / NoSQL-Injections)
- **Rate-Limiting** für Auth, Payments und API
- **CORS-Konfiguration** abhängig von Umgebung
- **HTTP-Sicherheitsheader** via Helmet
- **Sicheres Logging** (keine Passwörter / Tokens in Logs)
- **Mobile-Sicherheit**
  - Tokens nur in `expo-secure-store` (kein AsyncStorage)
  - Netzwerk-Status-Handling und klare Fehleranzeigen

---

## 🧪 Tests & Qualität

```bash
# Backend-Tests
cd SERVER
npm test

# Frontend-Tests
cd CLIENT
npm test

# Linting (Root)
npm run lint
```

---

## 🚢 Deployment (Kurzüberblick)

**Empfohlene Umgebung:** Backend auf **Render**, Frontend auf **Vercel**.

- **Backend (Render)**
  - Root Directory: `SERVER`
  - Build Command: `npm install`
  - Start Command: `npm start`
- **Frontend (Vercel)**
  - Root Directory: `CLIENT`
  - Build Command: `npm run build`
  - Output Directory: `dist`

**Konfiguration:**

- **Render Env**
  - `MONGODB` – MongoDB Atlas Connection String
  - `ACCESS_KEY`, `REFRESH_KEY`, `SECRET_KEY`, Payment-Keys etc.
  - `CORS_ORIGIN` = Vercel-URL (z. B. `https://xxx.vercel.app`)
- **Vercel Env**
  - `VITE_BASE_URL` = Render-Backend-URL (z. B. `https://wcfinder-backend.onrender.com`)

Detailierte Schritt-für-Schritt-Anleitung: `RENDER_VERCEL_DEPLOYMENT.md` (lokal).

---

## 📈 Roadmap (Auszug)

**Bereits umgesetzt**

- Mobile App (Expo / React Native)
- Karten- & Listen-Ansicht (Web & Mobile)
- Stripe- & PayPal-Integration
- XRechnung-kompatibles Rechnungssystem
- Admin-Dashboard mit Analytics, Payments, Toiletten & Businesses

**Geplante Erweiterungen**

- Mehrsprachigkeit (DE / EN / TR)
- Automatisierte Auszahlungen (z. B. Stripe Connect)
- Push-Notifications (Mobile)
- Loyalty- / Punktesystem
- Abo-Modelle für Businesses

---

## 🤝 Contribution

1. **Repository forken**
2. **Feature-Branch erstellen**: `git checkout -b feature/MeinFeature`
3. **Änderungen committen**: `git commit -m "Add MeinFeature"`
4. **Branch pushen**: `git push origin feature/MeinFeature`
5. **Pull-Request eröffnen**

---

## 📄 Lizenz

Dieses Projekt ist ein **privates Projekt**. Alle Rechte vorbehalten.

---

## 📞 Kontakt

- **E-Mail:** info@wcfinder.de
- **Website:** www.wcfinder.de

---

**Letztes Update:** Februar 2026  
**Version:** 1.0.0
