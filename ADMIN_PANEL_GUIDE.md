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

### 1. Dashboard ⭐ GELİŞTİRİLDİ
**Ana kontrol paneli** - Platform genel görünümü ve önemli metrikler

#### Özellikler:
- ✅ **Gelişmiş İstatistik Kartları**: Trend göstergeleri ile (artış/azalış yüzdeleri)
- ✅ **30 Günlük Trend Analizi**: Gelir, kullanıcı, işletme ve rezervasyon trendleri
- ✅ **Gelir Grafikleri**: Aylık trend grafikleri (son 12 ay)
- ✅ **Kanal Dağılımı**: İşletme durumlarına göre dağılım (Pie Chart)
- ✅ **İşletme Satış Tablosu**: Günlük, aylık ve toplam satışlar
- ✅ **Son Aktivite Akışı**: Platform üzerindeki son işlemler

#### Metrikler:
- **Toplam Gelir**: Tüm zamanların toplam geliri (trend ile)
- **Toplam Kullanıcı**: Son 30 günde yeni kullanıcı sayısı (trend ile)
- **Toplam İşletme**: Onaylanmış işletme sayısı (trend ile)
- **Toplam Rezervasyon**: Tamamlanan rezervasyon sayısı (trend ile)
- **Bekleyen Rezervasyonlar**: Henüz tamamlanmamış rezervasyonlar
- **Onay Bekleyen İşletmeler**: Pending durumundaki işletmeler

---

### 2. Kullanıcılar (User Management) ⭐ GELİŞTİRİLDİ
**Kullanıcı yönetim sistemi** - Tüm kullanıcıları görüntüleme ve yönetme

#### Özellikler:
- ✅ **Detaylı Kullanıcı Listesi**: Avatar, rol, istatistikler
- ✅ **Genişletilebilir Satırlar**: Her kullanıcı için detaylı bilgiler
- ✅ **Kullanıcı İstatistikleri**: Rezervasyon, ödeme ve harcama bilgileri
- ✅ **Sıralama ve Filtreleme**: Tüm kolonlara göre sıralama
- ✅ **Sayfalama**: Büyük listeler için sayfalama desteği

#### Görüntülenen Bilgiler:
- Kullanıcı adı, email, rol
- Toplam rezervasyon sayısı (tamamlanan, bekleyen, iptal edilen)
- Toplam harcama miktarı
- Son aktivite tarihi
- Kayıt tarihi
- Son ödemeler listesi
- Son rezervasyonlar listesi

---

### 3. İşletmeler (Businesses Tab) ⭐ GELİŞTİRİLDİ
**İşletme yönetim sistemi** - İşletmeleri görüntüleme, analiz ve fatura oluşturma

#### Özellikler:
- ✅ **Günlük/Aylık Görünüm**: Tarih seçimi ile detaylı analiz
- ✅ **İstatistik Grafikleri**: Gelir ve müşteri trend grafikleri
- ✅ **İşletme Detay Tablosu**: Satış ve müşteri istatistikleri
- ✅ **PDF Fatura Oluşturma**: İşletmeler için fatura üretimi
- ✅ **Sıralama ve Filtreleme**: Gelişmiş tablo özellikleri

#### Görüntülenen Metrikler:
- Günlük/Aylık gelir
- Günlük/Aylık müşteri sayısı
- Toplam gelir
- Toplam müşteri sayısı
- İşletme durumu (Aktif, Beklemede, Reddedilmiş)

---

### 4. Rezervasyonlar (Bookings) ⭐ YENİ
**Rezervasyon yönetim sistemi** - Tüm rezervasyonları görüntüleme ve yönetme

#### Özellikler:
- ✅ **Kapsamlı Rezervasyon Listesi**: Tüm rezervasyonlar tek bir yerde
- ✅ **Gelişmiş Filtreleme**: 
  - Arama (İşletme, Kullanıcı, Rezervasyon ID)
  - Durum filtresi (Tümü, Bekleyen, Onaylandı, Tamamlandı, İptal Edildi)
  - Tarih filtresi (Bugün, Son 7 Gün, Bu Ay, Tümü)
- ✅ **Sıralama ve Sayfalama**: Tüm kolonlara göre sıralama
- ✅ **Detaylı Görüntüleme**: Rezervasyon detay dialogu
- ✅ **Silme İşlemleri**: Rezervasyon silme (onaylı)
- ✅ **İstatistik Kartları**: 
  - Toplam rezervasyon sayısı
  - Tamamlanan rezervasyonlar
  - Bekleyen rezervasyonlar
  - İptal edilen rezervasyonlar
  - Toplam gelir

#### Görüntülenen Bilgiler:
- Rezervasyon tarihi
- İşletme bilgisi
- Kullanıcı bilgisi
- Tutar
- Durum (Chip ile görsel gösterim)
- İşlemler (Görüntüle, Sil)

#### Kullanım Senaryoları:
1. **Rezervasyon İnceleme**: Tüm rezervasyonları listeleme ve detaylı görüntüleme
2. **Problem Çözme**: İptal edilen veya bekleyen rezervasyonları bulma
3. **Raporlama**: Belirli tarih aralığındaki rezervasyonları filtreleme
4. **Temizlik**: Eski veya hatalı rezervasyonları silme

---

### 5. Ödemeler (Payments) ⭐ YENİ
**Ödeme yönetim sistemi** - Tüm ödemeleri görüntüleme ve takip etme

#### Özellikler:
- ✅ **Kapsamlı Ödeme Listesi**: Tüm ödemeler tek bir yerde
- ✅ **Gelişmiş Filtreleme**:
  - Arama (Kullanıcı, Ödeme ID, Payment Intent ID)
  - Durum filtresi (Tümü, Başarılı, Ödendi, Bekleyen, Başarısız, İade Edildi)
  - Tarih filtresi (Bugün, Son 7 Gün, Bu Ay, Tümü)
- ✅ **Sıralama ve Sayfalama**: Tüm kolonlara göre sıralama
- ✅ **Detaylı Görüntüleme**: Ödeme detay dialogu
- ✅ **İstatistik Kartları**:
  - Toplam ödeme sayısı
  - Başarılı ödemeler
  - Bekleyen ödemeler
  - Toplam gelir
  - Ortalama ödeme tutarı

#### Görüntülenen Bilgiler:
- Ödeme tarihi
- Kullanıcı bilgisi
- Tutar
- Ödeme yöntemi
- Durum (Chip ile görsel gösterim)
- Payment Intent ID (Stripe)
- Detaylı ödeme bilgileri

#### Kullanım Senaryoları:
1. **Ödeme Takibi**: Tüm ödemeleri görüntüleme ve durum kontrolü
2. **Problem Çözme**: Başarısız ödemeleri bulma ve analiz etme
3. **Raporlama**: Belirli tarih aralığındaki gelirleri analiz etme
4. **Mali Analiz**: Ortalama ödeme tutarı ve trend analizi

---

### 6. Tuvaletler (Toilets) ⭐ YENİ
**Tuvalet yönetim sistemi** - Tüm tuvaletleri görüntüleme, oluşturma, düzenleme ve silme

#### Özellikler:
- ✅ **CRUD İşlemleri**: Oluştur, Oku, Güncelle, Sil
- ✅ **Gelişmiş Filtreleme**:
  - Arama (Tuvalet adı, İşletme, Tuvalet ID)
  - Durum filtresi (Tümü, Müsait, Kullanımda, Arızalı)
  - İşletme filtresi (Belirli bir işletmeye ait tuvaletler)
- ✅ **Sıralama ve Sayfalama**: Tüm kolonlara göre sıralama
- ✅ **Detaylı Görüntüleme**: Tuvalet detay dialogu
- ✅ **Düzenleme Dialogu**: Hızlı düzenleme için modal form
- ✅ **Yeni Tuvalet Ekleme**: İşletmelere tuvalet ekleme
- ✅ **İstatistik Kartları**:
  - Toplam tuvalet sayısı
  - Müsait tuvaletler
  - Kullanımda olan tuvaletler
  - Arızalı tuvaletler
  - Engelli erişimli tuvaletler
  - Bebek bakım istasyonu olan tuvaletler

#### Tuvalet Özellikleri:
- **Temel Bilgiler**:
  - Tuvalet adı (zorunlu)
  - İşletme (zorunlu)
  - Ücret (EUR)
  - Durum: Müsait, Kullanımda, Arızalı
  
- **Özellikler**:
  - Engelli erişimli (Evet/Hayır)
  - Bebek bakım istasyonu (Evet/Hayır)

#### İşlem Akışı:

**Yeni Tuvalet Ekleme:**
1. "Yeni Tuvalet" butonuna tıklayın
2. Formu doldurun:
   - Tuvalet adını girin
   - İşletmeyi seçin
   - Ücreti belirleyin (varsayılan: 1.00 EUR)
   - Durumu seçin
   - Özellikleri işaretleyin (Engelli erişimli, Bebek istasyonu)
3. "Kaydet" butonuna tıklayın
4. ✅ Tuvalet başarıyla oluşturuldu!

**Tuvalet Düzenleme:**
1. Tabloda düzenlemek istediğiniz tuvaletin yanındaki "Düzenle" ikonuna tıklayın
2. Formda değişiklikleri yapın
3. "Kaydet" butonuna tıklayın
4. ✅ Tuvalet başarıyla güncellendi!

**Tuvalet Silme:**
1. Tabloda silmek istediğiniz tuvaletin yanındaki "Sil" ikonuna tıklayın
2. Onay dialogunda "Sil" butonuna tıklayın
3. ⚠️ **Dikkat**: Bu işlem geri alınamaz!
4. ✅ Tuvalet başarıyla silindi!

#### Görüntülenen Bilgiler:
- Tuvalet adı (Icon ile)
- İşletme bilgisi
- Ücret
- Özellikler (Chip'ler ile)
- Durum (Chip ile görsel gösterim)
- Oluşturulma tarihi
- İşlemler (Görüntüle, Düzenle, Sil)

#### Kullanım Senaryoları:
1. **Yeni İşletme Ekleme**: İşletmeye ait tuvaletleri ekleme
2. **Durum Yönetimi**: Tuvalet durumunu güncelleme (Müsait → Kullanımda → Arızalı)
3. **Bakım Takibi**: Arızalı tuvaletleri filtreleme ve takip etme
4. **Özellik Güncelleme**: Engelli erişimli veya bebek istasyonu ekleme

---

### 7. Analytics ⭐ YENİ
**Analitik ve raporlama sistemi** - Platform performansını detaylı analiz etme

#### Özellikler:
- ✅ **Kapsamlı Metrikler**: Platform genel performans göstergeleri
- ✅ **İnteraktif Grafikler**: Recharts kullanarak modern grafikler
- ✅ **Tarih Aralığı Seçimi**: Son 7 gün, 30 gün, 90 gün, 1 yıl
- ✅ **Gelir Trend Analizi**: Area chart ile gelir trendi
- ✅ **İşletme Tipi Dağılımı**: Pie chart ile işletme dağılımı
- ✅ **Rezervasyon Durumu**: Pie chart ile durum dağılımı
- ✅ **En Çok Gelir Getiren İşletmeler**: Bar chart ile top 10 işletme
- ✅ **Kullanıcı Büyümesi & Rezervasyon Trendi**: Dual-axis line chart

#### Metrikler:
- **Toplam Gelir**: Tüm zamanların toplam geliri
- **Toplam Rezervasyon**: Toplam rezervasyon sayısı
- **Tamamlanma Oranı**: Tamamlanan / Toplam rezervasyon yüzdesi
- **Ortalama Gelir/Rezervasyon**: Rezervasyon başına ortalama gelir
- **Toplam İşletme**: Platformdaki toplam işletme sayısı

#### Grafikler:

1. **Gelir Trendi (Area Chart)**:
   - Seçilen tarih aralığına göre günlük gelir trendi
   - Yumuşak area chart ile görselleştirme
   - Hover ile detaylı bilgi

2. **İşletme Tipi Dağılımı (Pie Chart)**:
   - İşletme tiplerine göre dağılım (Cafe, Restaurant, Hotel, vb.)
   - Renk kodlu gösterim
   - Yüzde hesaplaması

3. **Rezervasyon Durumu (Pie Chart)**:
   - Tamamlanan, Bekleyen, İptal Edilen rezervasyonların dağılımı
   - Renk kodlu gösterim
   - Durum bazlı analiz

4. **En Çok Gelir Getiren İşletmeler (Bar Chart)**:
   - Top 10 işletme gelir bazlı
   - Yatay bar chart
   - İşletme isimleri ve gelir miktarları

5. **Kullanıcı Büyümesi & Rezervasyon Trendi (Dual-Axis Line Chart)**:
   - İki Y ekseni ile çift metrik gösterimi
   - Rezervasyon sayısı ve gelir trendi
   - Zaman içindeki değişim analizi

#### Kullanım Senaryoları:
1. **Performans Analizi**: Platform genel performansını görüntüleme
2. **Trend Takibi**: Gelir ve rezervasyon trendlerini analiz etme
3. **İş Kararları**: Veriye dayalı iş kararları alma
4. **Raporlama**: Yönetim için detaylı raporlar oluşturma

---

### 8. Business Management ⭐ YENİ

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

### v2.0.0 (Aralık 2024) ⭐ MAJOR UPDATE
**Büyük Güncelleme - Gelişmiş Admin Panel**

#### Yeni Özellikler:
- ✅ **Gelişmiş Dashboard**: Trend göstergeleri, 30 günlük karşılaştırma, ek metrikler
- ✅ **Rezervasyonlar Sayfası**: Kapsamlı rezervasyon yönetimi, filtreleme, arama
- ✅ **Ödemeler Sayfası**: Detaylı ödeme takibi, filtreleme, istatistikler
- ✅ **Tuvaletler Sayfası**: Tam CRUD işlemleri, durum yönetimi, özellik yönetimi
- ✅ **Analytics Sayfası**: Detaylı grafikler, trend analizi, raporlama
- ✅ **Gelişmiş Tablolar**: Sıralama, filtreleme, sayfalama, toplu işlemler
- ✅ **Gelişmiş UI/UX**: Modern tasarım, hover efektleri, responsive layout

#### Geliştirmeler:
- ✅ StatCard bileşeni trend göstergeleri ile geliştirildi
- ✅ Tüm sayfalara arama ve filtreleme eklendi
- ✅ Detaylı görüntüleme dialogları eklendi
- ✅ İstatistik kartları tüm sayfalara eklendi
- ✅ Export özelliği için placeholder eklendi (yakında aktif)

### v1.0.0 (Aralık 2024)
- ✅ Business Management formu eklendi
- ✅ Otomatik koordinat bulma eklendi
- ✅ 3 adımlı form sistemi
- ✅ Input validation
- ✅ Otomatik onay sistemi

---

## 💡 İpuçları

### Genel İpuçları:
1. **Toplu İşlem**: Birden fazla işletme eklerken, form sıfırlandıktan sonra tekrar kullanabilirsiniz
2. **Koordinat Kontrolü**: Koordinatlar bulunduktan sonra, haritada doğru konumu kontrol edin
3. **Şifre Güvenliği**: Owner şifreleri güçlü olmalı, mümkünse kullanıcıya ilk girişte değiştirmesini söyleyin
4. **Açılış Saatleri**: Açılış saatlerini standart formatta girin (örn: "Mon-Fri 09:00-18:00")

### Rezervasyonlar İpuçları:
1. **Hızlı Filtreleme**: Durum filtresi ile hızlıca bekleyen veya tamamlanan rezervasyonları bulun
2. **Tarih Filtresi**: Belirli bir gün veya hafta için rezervasyonları görüntüleyin
3. **Arama Özelliği**: İşletme adı, kullanıcı email veya rezervasyon ID ile arama yapın

### Ödemeler İpuçları:
1. **Başarısız Ödemeleri Bulma**: Durum filtresini "Başarısız" olarak ayarlayarak problemli ödemeleri görüntüleyin
2. **Gelir Analizi**: Tarih filtresi ile belirli dönemlerdeki gelirleri analiz edin
3. **Payment Intent ID**: Stripe entegrasyonu ile ilgili problemleri çözmek için Payment Intent ID'yi kullanın

### Tuvaletler İpuçları:
1. **Durum Güncelleme**: Tuvalet durumunu gerçek zamanlı olarak güncelleyin (Müsait → Kullanımda → Arızalı)
2. **Toplu Ekleme**: Aynı işletmeye ait birden fazla tuvalet eklerken, formu tekrar kullanabilirsiniz
3. **Özellik Filtreleme**: Engelli erişimli tuvaletleri bulmak için özellikleri kullanın

### Analytics İpuçları:
1. **Tarih Aralığı Seçimi**: Analiz yaparken uygun tarih aralığını seçin (7 gün, 30 gün, vb.)
2. **Trend Takibi**: Gelir trendini takip ederek iş performansını değerlendirin
3. **İşletme Analizi**: En çok gelir getiren işletmeleri görüntüleyerek stratejik kararlar alın
4. **Veri Dışa Aktarma**: Export özelliği yakında eklenecek, şimdilik ekran görüntüsü alabilirsiniz

---

**Son Güncelleme:** Aralık 2024  
**Versiyon:** 2.0.0  
**Durum:** Production Ready ✅

