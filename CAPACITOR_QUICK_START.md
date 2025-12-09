# ⚡ Capacitor Hızlı Başlangıç (Alternatif Yöntem)

## 🎯 Capacitor Nedir?

Capacitor, mevcut web uygulamanızı iOS ve Android native uygulamaya dönüştüren bir framework'tür. **Mevcut React kodunuzu neredeyse hiç değiştirmeden** kullanabilirsiniz.

## ✅ Avantajlar

- ✅ Mevcut web kodunuzu %95+ kullanır
- ✅ Çok hızlı geçiş (1-2 hafta)
- ✅ Native özellikler eklenebilir (kamera, GPS, vb.)
- ✅ Tek codebase

## ❌ Dezavantajlar

- ❌ Web görünümü kalabilir (tam native görünmeyebilir)
- ❌ Performans React Native kadar iyi olmayabilir
- ❌ Bazı native özellikler sınırlı

---

## 🚀 Kurulum (5 Dakika)

### 1. Capacitor Kurulumu

```bash
cd CLIENT

# Capacitor paketlerini kur
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android

# Capacitor'ı başlat
npx cap init

# Sorular:
# App name: WCFinder
# App ID: com.wcfinder.app
# Web dir: dist
```

### 2. Web Uygulamasını Build Et

```bash
# Production build
npm run build

# dist/ klasörü oluşacak
```

### 3. iOS ve Android Platformlarını Ekle

```bash
# iOS ekle (Mac gerekli)
npx cap add ios

# Android ekle
npx cap add android

# Native kodları senkronize et
npx cap sync
```

### 4. Native Projeleri Aç

```bash
# iOS (Mac gerekli)
npx cap open ios

# Android
npx cap open android
```

---

## 📱 Native Özellikler Ekleme

### GPS Konum

```bash
npm install @capacitor/geolocation
```

```javascript
// CLIENT/src/services/geolocation.js
import { Geolocation } from '@capacitor/geolocation';

export const getCurrentPosition = async () => {
  const coordinates = await Geolocation.getCurrentPosition();
  return {
    latitude: coordinates.coords.latitude,
    longitude: coordinates.coords.longitude,
  };
};
```

### Kamera

```bash
npm install @capacitor/camera
```

```javascript
import { Camera } from '@capacitor/camera';

const takePicture = async () => {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: CameraResultType.Uri
  });
  return image.webPath;
};
```

### Push Notifications

```bash
npm install @capacitor/push-notifications
```

### Status Bar

```bash
npm install @capacitor/status-bar
```

---

## 🔧 Capacitor Config (capacitor.config.json)

```json
{
  "appId": "com.wcfinder.app",
  "appName": "WCFinder",
  "webDir": "dist",
  "server": {
    "androidScheme": "https",
    "iosScheme": "https"
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 2000,
      "backgroundColor": "#454F5B"
    }
  }
}
```

---

## 📝 Önemli Notlar

### 1. API URL'leri

Production'da API URL'lerinizi mutlaka kontrol edin:

```javascript
// Capacitor'da localhost çalışmaz!
// Gerçek API URL kullanın
const API_URL = import.meta.env.VITE_BASE_URL || 'https://your-api.com';
```

### 2. CORS Ayarları

Backend'de CORS ayarlarını kontrol edin:

```javascript
// SERVER/index.js
app.use(cors({
  origin: [
    'http://localhost:5173',
    'capacitor://localhost',
    'ionic://localhost',
    'https://your-domain.com'
  ]
}));
```

### 3. Build ve Sync

Her build'den sonra sync yapın:

```bash
npm run build
npx cap sync
```

### 4. iOS Permissions

iOS için `ios/App/App/Info.plist` dosyasına izinler ekleyin:

```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access for QR code scanning</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need location access to show nearby toilets</string>
```

### 5. Android Permissions

Android için `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
```

---

## 🏗️ Build ve Yayınlama

### iOS Build

```bash
# Xcode'da aç
npx cap open ios

# Xcode'da:
# 1. Signing & Capabilities'den team seçin
# 2. Product > Archive
# 3. Distribute App
# 4. App Store Connect'e yükleyin
```

### Android Build

```bash
# Android Studio'da aç
npx cap open android

# Android Studio'da:
# 1. Build > Generate Signed Bundle / APK
# 2. APK veya AAB seçin
# 3. Key store oluşturun
# 4. Build alın
# 5. Play Console'a yükleyin
```

---

## 🔄 Geliştirme Workflow

```bash
# 1. Web uygulamasını geliştir (normal şekilde)
npm run dev

# 2. Değişiklikleri test et
npm run build

# 3. Native projelere senkronize et
npx cap sync

# 4. Native uygulamada test et
npx cap open ios  # veya android

# 5. Native özellikler ekle (gerekirse)
npm install @capacitor/[plugin-name]
npx cap sync
```

---

## 📊 Capacitor vs React Native

| Özellik | Capacitor | React Native |
|---------|-----------|--------------|
| **Kod Paylaşımı** | %95+ | %70-80 |
| **Geliştirme Süresi** | 1-2 hafta | 2-3 ay |
| **Native Görünüm** | ⭐⭐ | ⭐⭐⭐ |
| **Performans** | ⭐⭐ | ⭐⭐⭐ |
| **Öğrenme Eğrisi** | Çok Düşük | Orta |
| **Mevcut Kod Kullanımı** | ✅✅✅ | ✅✅ |

---

## 🎯 Ne Zaman Capacitor Kullanılmalı?

✅ **Capacitor kullanın eğer:**
- Hızlı MVP istiyorsanız
- Mevcut web kodunuzu korumak istiyorsanız
- Native görünüm kritik değilse
- Zamanınız sınırlıysa

❌ **React Native kullanın eğer:**
- Uzun vadeli profesyonel çözüm istiyorsanız
- Native performans kritikse
- Native görünüm önemliyse
- Zamanınız varsa

---

## 🆘 Sorun Giderme

### "Cannot find module" hatası
```bash
npm install
npx cap sync
```

### iOS build hatası
```bash
cd ios/App
pod install
cd ../../..
npx cap sync
```

### Android build hatası
```bash
cd android
./gradlew clean
cd ..
npx cap sync
```

### API çağrıları çalışmıyor
- API URL'lerini kontrol edin (localhost yerine gerçek URL)
- CORS ayarlarını kontrol edin
- Network security config'i kontrol edin

---

## 📚 Kaynaklar

- [Capacitor Dokümantasyonu](https://capacitorjs.com/docs)
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins)
- [Ionic Framework](https://ionicframework.com/) (Capacitor ile birlikte kullanılabilir)

---

## ✅ Checklist

- [ ] Capacitor kuruldu
- [ ] iOS platform eklendi
- [ ] Android platform eklendi
- [ ] Web uygulaması build edildi
- [ ] Native projeler açıldı
- [ ] iOS'ta test edildi
- [ ] Android'de test edildi
- [ ] Native özellikler eklendi (gerekirse)
- [ ] Permissions ayarlandı
- [ ] Build alındı
- [ ] App Store'a yüklendi
- [ ] Play Store'a yüklendi

---

Bu yöntemle mevcut web uygulamanızı çok hızlı bir şekilde mobil uygulamaya dönüştürebilirsiniz! 🚀

