# 🗺️ Mobil Uygulama Geliştirme Roadmap

## 📊 Mevcut Durum

### ✅ Tamamlananlar

1. **Temel Altyapı**
   - ✅ Redux store yapılandırması
   - ✅ API servisleri (Axios, interceptors)
   - ✅ Auth flow (Login, Register, Forgot Password)
   - ✅ Navigation yapısı (Tabs, Modals, Auth Stack)
   - ✅ Environment yönetimi (dev/staging/prod)
   - ✅ Offline support temelleri

2. **Ekranlar**
   - ✅ Login ekranı
   - ✅ Register ekranı
   - ✅ Forgot Password ekranı
   - ✅ Profile ekranı (temel)
   - ✅ Tab navigation yapısı

### ⏳ Yapılacaklar (Öncelik Sırasına Göre)

## 🎯 Faz 1: Temel Özellikler (1-2 Hafta)

### 1. Map Ekranı (Yüksek Öncelik)
**Dosya:** `app/(tabs)/index.tsx`

**Yapılacaklar:**
- [ ] React Native Maps entegrasyonu
- [ ] Kullanıcı konumu alma (GPS)
- [ ] Yakındaki tuvaletleri gösterme
- [ ] Marker'lar (tuvalet lokasyonları)
- [ ] Marker'a tıklayınca detay gösterimi
- [ ] Harita filtreleme (fiyat, mesafe, puan)

**Gerekli Paketler:**
```bash
npx expo install react-native-maps
npx expo install expo-location
```

**Backend Endpoint:**
- `GET /api/business?latitude=X&longitude=Y&radius=Z`

### 2. Business List Ekranı
**Dosya:** `app/(tabs)/list.tsx`

**Yapılacaklar:**
- [ ] Tuvalet listesi (backend'den)
- [ ] Arama (search bar)
- [ ] Filtreleme (fiyat, mesafe, puan, özellikler)
- [ ] Sıralama (mesafe, puan, fiyat)
- [ ] Pull-to-refresh
- [ ] Infinite scroll (pagination)
- [ ] List item'a tıklayınca detay

**Backend Endpoint:**
- `GET /api/business` (query params ile filtreleme)

### 3. Business Detail Ekranı
**Dosya:** `app/(modals)/business-detail.tsx`

**Yapılacaklar:**
- [ ] İşletme bilgileri (isim, adres, telefon)
- [ ] Fotoğraflar (carousel)
- [ ] Fiyat bilgisi
- [ ] Puan ve yorumlar
- [ ] Özellikler (kadın/erkek, engelli erişimi, vb.)
- [ ] "Rezervasyon Yap" butonu
- [ ] Haritada göster
- [ ] Favorilere ekle/çıkar

**Backend Endpoint:**
- `GET /api/business/:id`
- `GET /api/business/:id/reviews`

## 🎯 Faz 2: Ödeme ve Rezervasyon (1 Hafta)

### 4. Payment Ekranı
**Dosya:** `app/(modals)/payment.tsx`

**Yapılacaklar:**
- [ ] Stripe entegrasyonu (React Native)
- [ ] PayPal entegrasyonu (WebView veya native)
- [ ] Ödeme yöntemi seçimi
- [ ] Fiyat özeti
- [ ] Ödeme başarı/hata yönetimi
- [ ] QR kod oluşturma (ödeme sonrası)

**Gerekli Paketler:**
```bash
npm install @stripe/stripe-react-native
# PayPal için WebView kullanılabilir
```

**Backend Endpoint:**
- `POST /api/payment/create-intent`
- `POST /api/payment/confirm`

### 5. QR Code Scanner
**Dosya:** `app/(modals)/scan-qr.tsx`

**Yapılacaklar:**
- [ ] QR kod okuma (kamera)
- [ ] Rezervasyon doğrulama
- [ ] Giriş/çıkış kaydı
- [ ] Başarı/hata mesajları

**Gerekli Paketler:**
```bash
npx expo install expo-camera
npx expo install expo-barcode-scanner
```

**Backend Endpoint:**
- `POST /api/usage/check-in`
- `POST /api/usage/check-out`

## 🎯 Faz 3: Kullanıcı Özellikleri (1 Hafta)

### 6. Favorites Ekranı
**Dosya:** `app/(tabs)/favorites.tsx`

**Yapılacaklar:**
- [ ] Favori tuvaletler listesi
- [ ] Favori ekle/çıkar
- [ ] Favori listesinden detay görüntüleme
- [ ] Favori listesinden rezervasyon

**Backend Endpoint:**
- `GET /api/users/favorites`
- `POST /api/users/favorites/:businessId`
- `DELETE /api/users/favorites/:businessId`

### 7. Profile Ekranı Geliştirme
**Dosya:** `app/(tabs)/profile.tsx`

**Yapılacaklar:**
- [ ] Profil düzenleme
- [ ] Ödeme geçmişi
- [ ] Rezervasyon geçmişi
- [ ] Ayarlar (bildirimler, dil, vb.)
- [ ] Çıkış yap

**Backend Endpoint:**
- `GET /api/users/me`
- `PUT /api/users/me`
- `GET /api/users/bookings`
- `GET /api/users/payments`

## 🎯 Faz 4: İyileştirmeler (1 Hafta)

### 8. Offline Support Geliştirme
- [ ] Son görüntülenen tuvaletleri cache'le
- [ ] Offline modda cached data göster
- [ ] Network durumu göstergesi
- [ ] Sync mekanizması (online olduğunda)

### 9. Push Notifications
- [ ] Rezervasyon onayı
- [ ] Rezervasyon hatırlatıcı
- [ ] Özel teklifler

**Gerekli Paketler:**
```bash
npx expo install expo-notifications
```

### 10. Analytics & Monitoring
- [ ] Sentry entegrasyonu (hata takibi)
- [ ] Firebase Analytics (opsiyonel)
- [ ] Kullanıcı davranış analizi

## 📁 Dosya Yapısı Önerisi

```
mobile/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx ✅
│   │   ├── register.tsx ✅
│   │   └── forgot-password.tsx ✅
│   ├── (tabs)/
│   │   ├── index.tsx (Map) ⏳
│   │   ├── list.tsx ⏳
│   │   ├── favorites.tsx ⏳
│   │   └── profile.tsx ✅ (geliştirilecek)
│   └── (modals)/
│       ├── business-detail.tsx ⏳
│       ├── payment.tsx ⏳
│       └── scan-qr.tsx ⏳
├── src/
│   ├── components/
│   │   ├── map/
│   │   │   ├── BusinessMap.tsx
│   │   │   └── BusinessMarker.tsx
│   │   ├── business/
│   │   │   ├── BusinessCard.tsx
│   │   │   ├── BusinessListItem.tsx
│   │   │   └── BusinessDetailHeader.tsx
│   │   └── payment/
│   │       ├── StripePayment.tsx
│   │       └── PayPalPayment.tsx
│   ├── hooks/
│   │   ├── useBusiness.ts (business API calls)
│   │   ├── useLocation.ts (GPS)
│   │   └── useQRScanner.ts (QR code)
│   ├── services/
│   │   ├── businessService.ts
│   │   ├── paymentService.ts
│   │   └── qrService.ts
│   └── utils/
│       ├── location.ts (mesafe hesaplama)
│       └── format.ts (fiyat, tarih formatlama)
```

## 🔧 Geliştirme Adımları

### Adım 1: Map Ekranı (İlk Öncelik)

1. **Paketleri kur:**
```bash
cd mobile
npx expo install react-native-maps expo-location
```

2. **Konum izni ekle:**
`app.json` dosyasına:
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "Yakındaki tuvaletleri bulmak için konumunuza ihtiyacımız var."
      }
    },
    "android": {
      "permissions": ["ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"]
    }
  }
}
```

3. **Map component oluştur:**
`src/components/map/BusinessMap.tsx`

4. **Backend entegrasyonu:**
`src/hooks/useBusiness.ts` - Business API calls

### Adım 2: Business List

1. **List component:**
`src/components/business/BusinessListItem.tsx`

2. **Filtreleme:**
`src/hooks/useBusinessFilter.ts`

3. **Backend entegrasyonu:**
Business service ile listeleme

### Adım 3: Business Detail

1. **Detail component:**
`app/(modals)/business-detail.tsx`

2. **Rezervasyon butonu:**
Payment ekranına yönlendirme

## 🧪 Test Stratejisi

### Unit Tests
- API servisleri
- Utility fonksiyonlar
- Hooks

### Integration Tests
- Auth flow
- Payment flow
- Navigation flow

### E2E Tests (Opsiyonel)
- Detox veya Maestro kullanılabilir

## 📝 Notlar

1. **Backend API:**
   - Tüm endpoint'ler web uygulamasıyla aynı
   - CORS ayarları kontrol edilmeli
   - API URL environment variable'dan alınmalı

2. **Performance:**
   - List için FlatList kullan
   - Image lazy loading
   - Map için marker clustering (çok marker varsa)

3. **UX:**
   - Loading states
   - Error handling
   - Empty states
   - Pull-to-refresh

4. **Security:**
   - Token güvenliği
   - API key'ler environment variable'da
   - Sensitive data masking

## 🚀 Hızlı Başlangıç

### İlk Geliştirme Döngüsü

1. **Map ekranını yap** (en önemli özellik)
2. **Business list ekranını yap**
3. **Business detail ekranını yap**
4. **Payment entegrasyonu**

Bu 4 adım tamamlandığında, uygulama temel kullanım için hazır olacak!

## 📚 Kaynaklar

- [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)
- [Stripe React Native](https://stripe.dev/stripe-react-native/)
- [Expo Camera](https://docs.expo.dev/versions/latest/sdk/camera/)

