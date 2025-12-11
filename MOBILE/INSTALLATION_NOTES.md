# 📦 Kurulum Notları

## Gerekli Paketler

Bazı paketler Expo ile uyumlu versiyonları gerektirir. Aşağıdaki komutları çalıştırın:

```bash
cd mobile

# NetInfo (offline detection için)
npx expo install @react-native-community/netinfo
```

## Environment Variables

`.env` dosyası oluşturun (`.env.example`'ı kopyalayın):

```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin:
```
EXPO_PUBLIC_API_URL=https://your-backend.railway.app
EXPO_PUBLIC_ENV=development
```

## İlk Kurulum

```bash
cd mobile
npm install
npx expo install @react-native-community/netinfo
```

## Development

```bash
npm start
```

## Build

```bash
# EAS CLI kurulumu (ilk kez)
npm install -g eas-cli
eas login

# Build
eas build --profile preview --platform android
```

## Önemli Notlar

1. **NetInfo Paketi:** Offline detection için gerekli. `npx expo install` ile kurulmalı.
2. **Environment Variables:** `.env` dosyası oluşturulmalı.
3. **Backend URL:** `app.config.js` veya `.env` dosyasında ayarlanmalı.

