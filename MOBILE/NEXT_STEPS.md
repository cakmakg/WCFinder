# 🎯 Sonraki Adımlar - Hızlı Başlangıç

## ⚡ Hemen Başlayabileceğiniz İlk 3 Adım

### 1️⃣ Map Ekranını Yapın (En Öncelikli)

**Neden:** Kullanıcıların en çok ihtiyaç duyduğu özellik - yakındaki tuvaletleri bulmak.

**Adımlar:**

```bash
# 1. Paketleri kurun
cd mobile
npx expo install react-native-maps expo-location

# 2. app.json'a konum izni ekleyin (aşağıdaki kodu ekleyin)
```

**app.json güncellemesi:**
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

**Dosya:** `app/(tabs)/index.tsx` - Map ekranını implement edin

**Backend:** `GET /api/business?latitude=X&longitude=Y&radius=Z`

---

### 2️⃣ Business List Ekranını Yapın

**Neden:** Harita dışında liste görünümü de önemli.

**Adımlar:**

1. `app/(tabs)/list.tsx` dosyasını doldurun
2. Backend'den business listesi çekin
3. FlatList ile gösterin
4. Arama ve filtreleme ekleyin

**Backend:** `GET /api/business` (query params ile)

---

### 3️⃣ Business Detail Ekranını Yapın

**Neden:** Kullanıcılar detay görmek ve rezervasyon yapmak ister.

**Adımlar:**

1. `app/(modals)/business-detail.tsx` dosyasını oluşturun
2. Business bilgilerini gösterin
3. "Rezervasyon Yap" butonu ekleyin
4. Payment ekranına yönlendirin

**Backend:** `GET /api/business/:id`

---

## 📋 Geliştirme Checklist

### Faz 1: Temel Özellikler
- [ ] Map ekranı (GPS + harita)
- [ ] Business list ekranı
- [ ] Business detail ekranı
- [ ] Backend API entegrasyonu test

### Faz 2: Ödeme
- [ ] Payment ekranı
- [ ] Stripe entegrasyonu
- [ ] QR kod oluşturma

### Faz 3: Kullanıcı Özellikleri
- [ ] Favorites ekranı
- [ ] Profile geliştirme
- [ ] Rezervasyon geçmişi

---

## 🛠️ Geliştirme İpuçları

### 1. Component Yapısı
```typescript
// Örnek: BusinessCard component
src/components/business/BusinessCard.tsx
```

### 2. Custom Hooks
```typescript
// Örnek: useBusiness hook
src/hooks/useBusiness.ts
```

### 3. Services
```typescript
// Örnek: Business service
src/services/businessService.ts
```

---

## 🔗 Backend Entegrasyonu

Tüm API endpoint'leri web uygulamasıyla aynı. Sadece base URL'i kontrol edin:

```typescript
// src/config/api.ts
export const API_URL = getApiUrl(); // app.config.js'den geliyor
```

---

## 📱 Test Etme

1. **Development:**
   ```bash
   npm start
   # Expo Go ile test edin
   ```

2. **Preview Build:**
   ```bash
   eas build --profile preview --platform android
   ```

---

## ❓ Sorular?

- Backend API endpoint'leri: `SERVER/src/routes/` klasörüne bakın
- Web uygulaması örnekleri: `CLIENT/src/` klasörüne bakın
- Detaylı roadmap: `DEVELOPMENT_ROADMAP.md` dosyasına bakın

---

**İyi kodlamalar! 🚀**

