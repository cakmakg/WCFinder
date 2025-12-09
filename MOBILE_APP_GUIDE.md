# 📱 WCFinder Mobil Uygulama Geliştirme Rehberi

## 🎯 Önerilen Yöntem: React Native + Expo

### Neden React Native + Expo?

✅ **Avantajlar:**
- Zaten React kullanıyorsunuz → Kod paylaşımı %70-80
- Native performans (iOS ve Android)
- Tek codebase ile iki platform
- Expo ile kolay başlangıç ve deployment
- App Store ve Play Store'a yayınlama
- Native özellikler (kamera, GPS, push notification, vb.)

❌ **Dezavantajlar:**
- Bazı bileşenler yeniden yazılmalı (Material-UI → React Native Paper/UI Kitten)
- Öğrenme eğrisi (React Native syntax farklılıkları)

---

## 🚀 Adım Adım Kurulum

### 1. Gereksinimler

```bash
# Node.js (zaten var)
node --version

# Expo CLI kurulumu
npm install -g expo-cli

# iOS için (sadece Mac gerekli)
# Xcode ve CocoaPods

# Android için
# Android Studio ve Android SDK
```

### 2. Yeni Expo Projesi Oluşturma

```bash
# Proje kök dizininde
cd ..
npx create-expo-app WCFinderMobile --template

# Veya mevcut projeye ekleme
cd WCFinder
npx create-expo-app mobile --template blank
```

### 3. Proje Yapısı

```
WCFinder/
├── CLIENT/          # Mevcut web uygulaması
├── SERVER/          # Backend (değişiklik yok)
└── mobile/          # Yeni React Native uygulaması
    ├── src/
    │   ├── components/
    │   ├── screens/
    │   ├── navigation/
    │   ├── services/
    │   └── store/
    ├── app.json
    └── package.json
```

---

## 📦 Gerekli Paketler

### Temel Paketler

```bash
cd mobile
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install @reduxjs/toolkit react-redux
npm install axios
npm install react-native-paper  # Material Design için
npm install @react-native-async-storage/async-storage  # localStorage yerine
npm install react-native-maps  # Harita için
npm install expo-location  # GPS için
npm install expo-camera  # QR kod okuma için
```

### Ödeme Entegrasyonları

```bash
npm install @stripe/stripe-react-native
npm install react-native-paypal  # veya webview kullan
```

---

## 🔄 Kod Dönüşümü Stratejisi

### 1. State Management (Redux)
✅ **Değişiklik yok** - Aynı Redux store kullanılabilir

### 2. API Calls
✅ **Minimal değişiklik** - Axios aynı şekilde çalışır

```javascript
// mobile/src/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'YOUR_API_URL/api',
});

// Token'ı AsyncStorage'dan al
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 3. Routing
❌ **Değişiklik gerekli** - React Router → React Navigation

```javascript
// mobile/src/navigation/AppNavigator.js
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="BusinessDetail" component={BusinessDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### 4. UI Components
❌ **Büyük değişiklik** - Material-UI → React Native Components

**Material-UI → React Native Mapping:**

| Material-UI | React Native | Alternatif |
|------------|--------------|------------|
| `Button` | `Button` (RN) | `react-native-paper` Button |
| `TextField` | `TextInput` | `react-native-paper` TextInput |
| `Card` | `View` + styling | `react-native-paper` Card |
| `Dialog` | `Modal` | `react-native-paper` Dialog |
| `Grid` | `View` + flexbox | - |
| `Typography` | `Text` | `react-native-paper` Text |

**Örnek Dönüşüm:**

```javascript
// Web (Material-UI)
<Button variant="contained" onClick={handleClick}>
  Login
</Button>

// Mobile (React Native Paper)
import { Button } from 'react-native-paper';

<Button mode="contained" onPress={handleClick}>
  Login
</Button>
```

### 5. Styling
❌ **Değişiklik gerekli** - CSS → StyleSheet

```javascript
// Web
const styles = {
  container: {
    padding: 20,
    backgroundColor: '#fff',
  }
};

// Mobile
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  }
});
```

---

## 🗺️ Harita Entegrasyonu

### React Native Maps

```bash
npm install react-native-maps
```

```javascript
// mobile/src/components/MapView.js
import MapView, { Marker } from 'react-native-maps';

function BusinessMap({ businesses }) {
  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: 52.5200,
        longitude: 13.4050,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    >
      {businesses.map(business => (
        <Marker
          key={business._id}
          coordinate={{
            latitude: business.location.latitude,
            longitude: business.location.longitude,
          }}
          title={business.name}
        />
      ))}
    </MapView>
  );
}
```

---

## 💳 Ödeme Entegrasyonu

### Stripe

```bash
npm install @stripe/stripe-react-native
```

```javascript
// mobile/src/components/StripePayment.js
import { useStripe } from '@stripe/stripe-react-native';

function PaymentScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const handlePayment = async () => {
    // Backend'den payment intent al
    const { clientSecret } = await fetchPaymentIntent();
    
    // Payment sheet'i başlat
    await initPaymentSheet({
      paymentIntentClientSecret: clientSecret,
    });
    
    // Ödeme ekranını göster
    await presentPaymentSheet();
  };
}
```

---

## 📱 Native Özellikler

### GPS Konum

```bash
npx expo install expo-location
```

```javascript
import * as Location from 'expo-location';

const getCurrentLocation = async () => {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    return;
  }
  
  let location = await Location.getCurrentPositionAsync({});
  return location;
};
```

### QR Kod Okuma

```bash
npx expo install expo-camera expo-barcode-scanner
```

### Push Notifications

```bash
npx expo install expo-notifications
```

---

## 🏗️ Alternatif Yöntem: Capacitor (Hızlı Geçiş)

Eğer React Native öğrenmek istemiyorsanız, mevcut web uygulamanızı Capacitor ile sarmalayabilirsiniz.

### Capacitor Avantajları:
- ✅ Mevcut web kodunuzu kullanır
- ✅ Hızlı geçiş (1-2 gün)
- ✅ Native özellikler eklenebilir

### Capacitor Dezavantajları:
- ❌ Web görünümü kalabilir (native görünmeyebilir)
- ❌ Performans web kadar olabilir
- ❌ Bazı native özellikler sınırlı

### Capacitor Kurulumu:

```bash
cd CLIENT
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android

npx cap init

# Build web uygulaması
npm run build

# iOS ve Android ekle
npx cap add ios
npx cap add android

# Native projeleri oluştur
npx cap sync

# iOS için (Mac gerekli)
npx cap open ios

# Android için
npx cap open android
```

---

## 📊 Karşılaştırma Tablosu

| Özellik | React Native + Expo | Capacitor | PWA |
|---------|---------------------|-----------|-----|
| **Kod Paylaşımı** | %70-80 | %95+ | %100 |
| **Native Görünüm** | ✅✅✅ | ✅✅ | ✅ |
| **Performans** | ✅✅✅ | ✅✅ | ✅ |
| **Öğrenme Eğrisi** | Orta | Düşük | Çok Düşük |
| **Geliştirme Süresi** | 2-3 ay | 1-2 hafta | 1 hafta |
| **App Store Yayınlama** | ✅ | ✅ | ❌ |
| **Native Özellikler** | ✅✅✅ | ✅✅ | ✅ |

---

## 🎯 Önerilen Yaklaşım

### Senaryo 1: Uzun Vadeli, Profesyonel Çözüm
→ **React Native + Expo**
- 2-3 aylık geliştirme
- Native performans ve görünüm
- App Store ve Play Store'da yayınlama

### Senaryo 2: Hızlı MVP (Minimum Viable Product)
→ **Capacitor**
- 1-2 haftalık geliştirme
- Mevcut web kodunu kullan
- Sonra React Native'e geçiş yapılabilir

### Senaryo 3: Test ve Prototip
→ **PWA (Progressive Web App)**
- 1 haftalık geliştirme
- App Store'a yayınlanamaz ama "Add to Home Screen" ile kullanılabilir

---

## 📝 Sonraki Adımlar

1. **Karar Verin**: React Native mi, Capacitor mu?
2. **Kurulum**: Seçtiğiniz yönteme göre kurulum yapın
3. **Pilot Ekran**: Bir ekranı (örn: Login) dönüştürün
4. **Test**: iOS ve Android'de test edin
5. **İterasyon**: Diğer ekranları dönüştürün

---

## 🔗 Yararlı Kaynaklar

- [Expo Dokümantasyonu](https://docs.expo.dev/)
- [React Native Dokümantasyonu](https://reactnative.dev/)
- [Capacitor Dokümantasyonu](https://capacitorjs.com/docs)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [React Navigation](https://reactnavigation.org/)

---

## 💡 İpuçları

1. **Shared Code**: API servisleri, utilities, Redux store'u paylaşın
2. **Component Library**: React Native Paper kullanın (Material Design)
3. **TypeScript**: Type safety için TypeScript kullanın
4. **Testing**: Jest ve React Native Testing Library
5. **CI/CD**: Expo EAS Build ile otomatik build

---

## ❓ Sorular?

Herhangi bir adımda takılırsanız veya daha detaylı bilgi isterseniz, yardımcı olabilirim!

