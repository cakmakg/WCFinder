# ✅ Test Checklist - Mobil Uygulama

## 🎉 Başarılı Adımlar

- ✅ Uygulama telefonda çalışıyor
- ✅ Login/Register sayfaları görünüyor
- ✅ Expo Go bağlantısı çalışıyor

## 📋 Test Edilmesi Gerekenler

### 1. Authentication (Giriş/Auth)

#### Login Testi
- [ ] Email ve password ile giriş yapabiliyor musunuz?
- [ ] Hatalı email/password'de hata mesajı görünüyor mu?
- [ ] Backend'e istek gidiyor mu? (Console log'ları kontrol edin)
- [ ] Login başarılı olduğunda Map ekranına yönlendiriliyor mu?

#### Register Testi
- [ ] Yeni kullanıcı kaydı yapabiliyor musunuz?
- [ ] Form validasyonu çalışıyor mu? (Email formatı, password uzunluğu)
- [ ] Kayıt başarılı olduğunda login ekranına yönlendiriliyor mu?

#### Forgot Password
- [ ] "Forgot Password" linki çalışıyor mu?
- [ ] Email gönderimi çalışıyor mu?

### 2. Map Ekranı

#### Konum İzni
- [ ] Uygulama konum izni istiyor mu?
- [ ] İzin verildiğinde harita görünüyor mu?
- [ ] İzin reddedildiğinde uygun mesaj gösteriliyor mu?

#### Harita Görünümü
- [ ] Harita yükleniyor mu?
- [ ] Kullanıcı konumu (mavi nokta) görünüyor mu?
- [ ] Yakındaki tuvaletler (marker'lar) görünüyor mu?
- [ ] Marker'lara tıklayınca detay açılıyor mu?

#### Backend Bağlantısı
- [ ] Backend'den business listesi çekiliyor mu?
- [ ] Hata durumunda uygun mesaj gösteriliyor mu?
- [ ] Loading state görünüyor mu?

### 3. List Ekranı

#### Liste Görünümü
- [ ] Business listesi görünüyor mu?
- [ ] Her business için bilgiler doğru mu? (isim, adres, fiyat, mesafe)
- [ ] Pull-to-refresh çalışıyor mu?

#### Arama
- [ ] Arama çalışıyor mu?
- [ ] Filtreleme çalışıyor mu?

#### Navigation
- [ ] List item'a tıklayınca detay ekranı açılıyor mu?

### 4. Business Detail Ekranı

#### Bilgiler
- [ ] İşletme bilgileri doğru görünüyor mu?
- [ ] Harita görünümü çalışıyor mu?
- [ ] "Book Now" butonu var mı?

### 5. Profile Ekranı

#### Kullanıcı Bilgileri
- [ ] Kullanıcı bilgileri görünüyor mu?
- [ ] Logout butonu çalışıyor mu?

### 6. Navigation

#### Tab Navigation
- [ ] Tab'lar arasında geçiş yapabiliyor musunuz?
- [ ] Her tab doğru ekranı gösteriyor mu?

#### Stack Navigation
- [ ] Business detail ekranı açılıyor mu?
- [ ] Geri butonu çalışıyor mu?

## 🐛 Bilinen Sorunlar

### Web Platform
- ❌ Web'de harita çalışmıyor (normal - sadece iOS/Android)
- ✅ Web fallback mesajı gösteriliyor

## 📝 Test Sonuçları

### Başarılı Testler
- ✅ Uygulama açılıyor
- ✅ Login/Register sayfaları görünüyor
- ✅ Expo Go bağlantısı çalışıyor

### Test Edilecek
- ⏳ Login işlevselliği
- ⏳ Map ekranı
- ⏳ Backend bağlantısı
- ⏳ Konum izni

## 🚀 Sonraki Adımlar

1. **Login test edin:**
   - Backend'de bir kullanıcı var mı?
   - Login yapabiliyor musunuz?

2. **Map ekranını test edin:**
   - Login yaptıktan sonra Map ekranına gidin
   - Konum izni verin
   - Haritada tuvaletler görünüyor mu?

3. **Backend bağlantısını kontrol edin:**
   - Backend URL doğru mu? (`app.config.js`)
   - Backend çalışıyor mu? (Railway'de)
   - API endpoint'leri çalışıyor mu?

## 💡 İpuçları

- **Console log'ları:** Expo Go'da shake gesture yapın → "Debug Remote JS" seçin
- **Network istekleri:** Chrome DevTools → Network tab
- **Hata mesajları:** Terminal'de Metro bundler log'larını kontrol edin

## ✅ Test Tamamlandığında

Tüm testler başarılı olduğunda:
1. Payment ekranını ekleyin
2. QR Scanner ekranını ekleyin
3. Favorites ekranını geliştirin
4. Profile ekranını geliştirin

