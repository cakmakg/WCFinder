# ✅ Sonraki Adımlar - Checklist

## 🎯 Şu Anki Durum

- ✅ Backend URL'i `app.config.js`'e eklendi
- ✅ Temel dosyalar oluşturuldu
- ⏳ Paketlerin kurulu olup olmadığı kontrol ediliyor

## 📋 Adım Adım Yapılacaklar

### 1️⃣ Gerekli Paketleri Kurun

```bash
cd mobile
npx expo install react-native-maps expo-location
```

**Kontrol:**
- `react-native-maps` kurulu mu?
- `expo-location` kurulu mu?

### 2️⃣ Backend URL'ini Test Edin

Backend'iniz çalışıyor mu kontrol edin:

```bash
# Terminal'de test edin
curl https://your-backend-url.railway.app/api/business

# Veya browser'da açın
https://your-backend-url.railway.app/api/business
```

**Beklenen:** JSON response (business listesi veya boş array)

### 3️⃣ Metro Bundler'ı Başlatın

```bash
cd mobile
npm start -- --clear
```

**Kontrol:**
- Metro bundler başladı mı?
- QR kod göründü mü?

### 4️⃣ Uygulamayı Test Edin

#### iOS Simulator (Mac):
- Terminal'de `i` tuşuna basın

#### Android Emulator:
- Terminal'de `a` tuşuna basın
- Veya Android Studio'da emulator başlatın

#### Fiziksel Cihaz:
- Expo Go uygulamasını indirin
- QR kodu tarayın

### 5️⃣ İlk Test - Login Ekranı

1. Uygulama açıldığında login ekranı görünmeli
2. Email ve password ile giriş yapmayı deneyin
3. Backend'e istek gidiyor mu kontrol edin (console log'ları)

### 6️⃣ Map Ekranını Test Edin

1. Login yaptıktan sonra Map ekranına gidin
2. Konum izni isteyecek → İzin verin
3. Haritada tuvaletler görünüyor mu kontrol edin

### 7️⃣ List Ekranını Test Edin

1. List tab'ına gidin
2. Business listesi görünüyor mu?
3. Arama çalışıyor mu?

## 🐛 Sorun Giderme

### Backend'e Bağlanamıyorsa:

1. **Backend URL kontrolü:**
   ```bash
   curl https://your-backend-url.railway.app/api/business
   ```

2. **CORS kontrolü:**
   - Backend'de CORS ayarları mobil uygulama için açık mı?
   - Railway loglarında CORS hatası var mı?

3. **Network kontrolü:**
   - Fiziksel cihazda: WiFi/Data bağlantısı var mı?
   - Emulator'de: İnternet bağlantısı var mı?

### Map Görünmüyorsa:

1. **Paket kontrolü:**
   ```bash
   npm list react-native-maps
   ```

2. **Konum izni:**
   - iOS: Settings → Privacy → Location Services
   - Android: Settings → Apps → Permissions → Location

### Business Listesi Boşsa:

1. **Backend'de data var mı?**
   ```bash
   curl https://your-backend-url.railway.app/api/business
   ```

2. **API response kontrolü:**
   - Console log'larını kontrol edin
   - Network tab'ında istek başarılı mı?

## ✅ Başarı Kriterleri

- [ ] Login ekranı görünüyor
- [ ] Login yapabiliyorsunuz
- [ ] Map ekranı açılıyor
- [ ] Konum izni alınıyor
- [ ] Haritada tuvaletler görünüyor (veya "No toilets found" mesajı)
- [ ] List ekranında business listesi görünüyor
- [ ] Business detail ekranı açılıyor

## 🚀 Hızlı Test Komutları

```bash
# 1. Paketleri kur
cd mobile
npx expo install react-native-maps expo-location

# 2. Backend'i test et
curl https://your-backend-url.railway.app/api/business

# 3. Uygulamayı başlat
npm start -- --clear

# 4. iOS'ta aç (Mac)
# Terminal'de 'i' tuşuna bas

# 5. Android'de aç
# Terminal'de 'a' tuşuna bas
```

## 📝 Notlar

1. **İlk çalıştırmada:**
   - Metro bundler biraz zaman alabilir
   - İlk build uzun sürebilir

2. **Backend URL:**
   - `app.config.js` dosyasında doğru mu?
   - Railway'de backend çalışıyor mu?

3. **Environment:**
   - Development: `http://localhost:8000`
   - Production: Railway backend URL'iniz

## 🎯 Sonraki Geliştirmeler

Map ve List çalıştıktan sonra:
1. Payment ekranı
2. QR Scanner
3. Favorites ekranı
4. Profile geliştirme

