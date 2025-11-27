# Admin Panel Kullanım Kılavuzu

## 📋 Genel Bakış

WCFinder Admin Panel, platform yönetimi için kapsamlı bir yönetim arayüzüdür. Admin kullanıcıları bu panel üzerinden işletmeleri, kullanıcıları ve platform ayarlarını yönetebilir.

---

## 🔐 Admin Paneline Erişim

### Gereksinimler

1. **Admin rolüne sahip kullanıcı** olmalısınız
2. **Giriş yapmış** olmalısınız
3. Admin kullanıcısı oluşturma için `CREATE_ADMIN_USER.md` dosyasına bakın

### Erişim Yolu

1. Frontend'de giriş yapın
2. Sağ üst köşedeki **avatar** ikonuna tıklayın
3. **"Admin Panel"** seçeneğini seçin
4. Veya direkt olarak `/admin` URL'sine gidin

---

## 📊 Admin Panel Bölümleri

### 1. Dashboard
- Platform genel istatistikleri
- Gelir grafikleri
- Kanal dağılımı
- Son aktiviteler

### 2. User Management
- Kullanıcı listesi ve yönetimi
- Kullanıcı detayları
- Kullanıcı düzenleme/silme

### 3. Business Management ⭐ YENİ

**Business Management** bölümü, admin panelin en önemli özelliklerinden biridir. Bu bölüm sayesinde MongoDB Compass veya Postman kullanmadan, doğrudan admin panel üzerinden Owner, Business ve Toilet kayıtlarını oluşturabilirsiniz.

#### Özellikler

- ✅ **3 Adımlı Form Sistemi**: Owner → Business → Toilet
- ✅ **Otomatik Koordinat Bulma**: Adres bilgisinden otomatik olarak koordinatlar bulunur
- ✅ **Input Validation**: Tüm alanlar doğrulanır
- ✅ **Otomatik Onay**: Yeni işletmeler varsayılan olarak "approved" durumunda oluşturulur
- ✅ **Sabit Ücret**: Toilet ücreti her zaman 1.00 EUR olarak ayarlanır

#### Kullanım Adımları

**Adım 1: Owner Bilgileri**

1. **Username**: Owner kullanıcı adı (min. 3 karakter, sadece harf, rakam ve alt çizgi)
2. **Email**: Geçerli bir email adresi
3. **Password**: En az 8 karakter, büyük harf, küçük harf ve rakam içermeli
4. **Role**: Otomatik olarak "owner" olarak ayarlanır
5. **Aktif**: Kullanıcının aktif olup olmadığını belirler

**Adım 2: Business Bilgileri**

1. **Business Name**: İşletme adı (zorunlu)
2. **Business Type**: İşletme tipi seçin:
   - Cafe
   - Restaurant
   - Hotel
   - Shop
   - Gas Station
   - Other

3. **Adres Bilgileri**:
   - **Street**: Sokak adresi (zorunlu)
   - **City**: Şehir (zorunlu)
   - **Postal Code**: Posta kodu (zorunlu)
   - **Country**: Ülke (varsayılan: Deutschland)

4. **Koordinat Bulma**:
   - Adres bilgilerini girdikten sonra **"Koordinatları Bul"** butonuna tıklayın
   - Sistem OpenStreetMap Nominatim API kullanarak otomatik olarak koordinatları bulur
   - Koordinatlar bulunduğunda ekranda gösterilir
   - ⚠️ **Önemli**: Koordinatlar bulunmadan form gönderilemez

5. **Opening Hours**: Açılış saatleri (opsiyonel)
   - Örnek: `Mon-Fri 09:00-18:00; Sat 10:00-16:00`

6. **Approval Status**: Onay durumu
   - **Approved**: Onaylı (varsayılan)
   - **Pending**: Beklemede
   - **Rejected**: Reddedilmiş

**Adım 3: Toilet Bilgileri**

1. **Toilet Name**: Tuvalet adı (zorunlu)
   - Örnek: "Haupttoilette", "Erdgeschoss WC"

2. **Fee (EUR)**: Tuvalet ücreti
   - ⚠️ **Sabit**: Her zaman 1.00 EUR olarak ayarlanır (değiştirilemez)

3. **Özellikler**:
   - **Engelli Erişimli (Accessible)**: Engelli erişimi var mı?
   - **Bebek Bakım İstasyonu**: Bebek bakım istasyonu var mı?

4. **Status**: Tuvalet durumu
   - **Available**: Müsait
   - **In Use**: Kullanımda
   - **Out of Order**: Arızalı

#### Form Gönderimi

1. Tüm 3 adımı tamamlayın
2. **"Kaydet"** butonuna tıklayın
3. Sistem sırasıyla:
   - Owner kaydını oluşturur
   - Business kaydını oluşturur (owner'a bağlı)
   - Toilet kaydını oluşturur (business'a bağlı)
4. Başarılı olursa:
   - Success mesajı gösterilir
   - Form sıfırlanır
   - Business ve Toilet listeleri otomatik yenilenir
   - Harita üzerinde yeni işletme görünür

#### Hata Yönetimi

- **Validation Hataları**: Eksik veya hatalı alanlar kırmızı ile işaretlenir
- **Koordinat Bulunamadı**: Adres bilgilerini kontrol edin ve tekrar deneyin
- **API Hataları**: Hata mesajları ekranda gösterilir

#### Teknik Detaylar

**Backend API Endpoints:**
- `POST /api/users` - Owner oluşturma
- `POST /api/business` - Business oluşturma
- `POST /api/toilets` - Toilet oluşturma

**Geocoding Service:**
- OpenStreetMap Nominatim API kullanılır
- Adres → Koordinat dönüşümü otomatik yapılır
- Rate limiting: API'nin kullanım limitlerine dikkat edin

**Validation:**
- Frontend validation: Anlık geri bildirim
- Backend validation: `validationService.js` kullanılır
- Tüm input'lar sanitize edilir (XSS koruması)

**Otomatik İşlemler:**
- Toilet fee: Her zaman 1.00 EUR
- Business approvalStatus: Varsayılan "approved"
- Owner role: Otomatik "owner"
- Koordinat format: `[longitude, latitude]`

---

## 🎯 Kullanım Senaryoları

### Senaryo 1: Yeni İşletme Ekleme

1. Admin Panel → Business Management
2. Owner bilgilerini doldurun
3. "İleri" butonuna tıklayın
4. Business bilgilerini doldurun
5. "Koordinatları Bul" butonuna tıklayın
6. Koordinatların bulunduğunu doğrulayın
7. "İleri" butonuna tıklayın
8. Toilet bilgilerini doldurun
9. "Kaydet" butonuna tıklayın
10. ✅ İşletme başarıyla oluşturuldu!

### Senaryo 2: Koordinat Bulunamadı

1. Adres bilgilerini kontrol edin
2. Daha spesifik bir adres girin (örn: "Hauptstraße 1, 53111 Bonn, Deutschland")
3. "Koordinatları Bul" butonuna tekrar tıklayın
4. Hala bulunamazsa, adresi manuel olarak kontrol edin

---

## ⚙️ Yapılandırma

### Environment Variables

Business Management formu aşağıdaki environment variable'ları kullanır:

```env
# Backend
SERVICE_FEE=0.75              # Platform komisyonu (EUR)
DEFAULT_TOILET_FEE=1.00      # Varsayılan tuvalet ücreti (EUR)
```

### Geocoding API

OpenStreetMap Nominatim API kullanılır:
- **Rate Limit**: 1 istek/saniye (önerilen)
- **User-Agent**: "WCFinder App" (zorunlu)
- **Format**: JSON

---

## 🔒 Güvenlik

### Güvenlik Önlemleri

1. **Input Validation**: Tüm input'lar validate edilir
2. **XSS Protection**: HTML karakterleri escape edilir
3. **NoSQL Injection Protection**: ObjectId format kontrolü
4. **Admin Only**: Sadece admin kullanıcıları erişebilir
5. **Rate Limiting**: API istekleri rate limit'e tabidir

### Güvenlik Notları

- ⚠️ Admin panel sadece güvenli ağlardan erişilmelidir
- ⚠️ Owner şifreleri güçlü olmalıdır
- ⚠️ Production'da rate limiting aktif olmalıdır

---

## 🐛 Sorun Giderme

### Problem: Koordinatlar Bulunamıyor

**Çözüm:**
1. Adres bilgilerini kontrol edin
2. Daha spesifik bir adres girin
3. Posta kodunu doğru girin
4. Ülke bilgisini kontrol edin

### Problem: Form Gönderilemiyor

**Çözüm:**
1. Tüm zorunlu alanların doldurulduğundan emin olun
2. Koordinatların bulunduğunu kontrol edin
3. Şifrenin gereksinimleri karşıladığını kontrol edin
4. Browser console'da hata mesajlarını kontrol edin

### Problem: İşletme Haritada Görünmüyor

**Çözüm:**
1. Business'ın `approvalStatus: "approved"` olduğunu kontrol edin
2. Koordinatların doğru olduğunu kontrol edin
3. Sayfayı yenileyin
4. Browser cache'ini temizleyin

---

## 📚 İlgili Dokümantasyon

- **[Admin Kullanıcısı Oluşturma](CREATE_ADMIN_USER.md)** - İlk admin oluşturma
- **[Clean Code Improvements](SERVER/CLEAN_CODE_IMPROVEMENTS.md)** - Kod iyileştirmeleri
- **[API Dokümantasyonu](http://localhost:8000/documents/swagger)** - Swagger API docs

---

## 🔄 Güncellemeler

### v1.0.0 (Aralık 2024)
- ✅ Business Management formu eklendi
- ✅ Otomatik koordinat bulma eklendi
- ✅ 3 adımlı form sistemi
- ✅ Input validation
- ✅ Otomatik onay sistemi

---

## 💡 İpuçları

1. **Toplu İşlem**: Birden fazla işletme eklerken, form sıfırlandıktan sonra tekrar kullanabilirsiniz
2. **Koordinat Kontrolü**: Koordinatlar bulunduktan sonra, haritada doğru konumu kontrol edin
3. **Şifre Güvenliği**: Owner şifreleri güçlü olmalı, mümkünse kullanıcıya ilk girişte değiştirmesini söyleyin
4. **Açılış Saatleri**: Açılış saatlerini standart formatta girin (örn: "Mon-Fri 09:00-18:00")

---

**Son Güncelleme:** Aralık 2024  
**Versiyon:** 1.0.0

