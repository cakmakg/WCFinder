# WCFinder - Tuvalet Bulma ve Rezervasyon Platformu

**Versiyon:** 1.0.0  
**Durum:** Production Ready  
**Pilot Bölge:** Bonn, Almanya

---

## 📋 Proje Hakkında

WCFinder, kullanıcıların şehir içinde veya seyahat sırasında yakındaki tuvaletleri bulmasını, rezervasyon yapmasını ve güvenli ödeme ile hizmet almasını sağlayan modern bir platformdur. İşletmeler tuvaletlerini listeleyerek ek gelir elde edebilirler.

### Ana Özellikler

- 🗺️ **İnteraktif Harita** - Leaflet ile konum bazlı tuvalet arama
- 📅 **Rezervasyon Sistemi** - Tarih, saat ve kişi sayısı ile ön rezervasyon
- 💳 **Ödeme Entegrasyonu** - Stripe ve PayPal ile güvenli ödeme
- 🎫 **QR Kod Doğrulama** - Rezervasyon onayı için QR kod sistemi
- ⭐ **Değerlendirme Sistemi** - Tuvaletler için puanlama ve yorum
- 📊 **İşletme Paneli** - Rezervasyon yönetimi ve gelir takibi
- 🔐 **Admin Paneli** - İşletme onayları ve platform yönetimi

---

## 🛠️ Teknoloji Stack

### Frontend
- **React** 19.1.1 - UI framework
- **Material-UI (MUI)** 7.3.1 - Component library
- **Redux Toolkit** 2.8.2 - State management
- **React Router** 7.8.2 - Routing
- **Leaflet** 1.9.4 - Harita kütüphanesi
- **Vite** 7.1.2 - Build tool

### Backend
- **Node.js** - Runtime environment
- **Express.js** 4.21.2 - Web framework
- **MongoDB** - NoSQL veritabanı
- **Mongoose** 7.8.7 - MongoDB ODM
- **JWT** 9.0.2 - Kimlik doğrulama
- **Stripe** 19.1.0 - Ödeme işlemleri
- **PayPal** 1.0.3 - Ödeme işlemleri

### DevOps
- **MongoDB Atlas** - Cloud database
- **Swagger** - API dokümantasyonu

---

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Node.js 16+
- npm 8+ veya yarn 3+
- MongoDB (lokal veya MongoDB Atlas)
- Stripe hesabı (ödeme için)
- PayPal hesabı (ödeme için)

### Kurulum

1. **Repository'yi klonlayın:**
```bash
git clone https://github.com/yourusername/wcfinder.git
cd wcfinder
```

2. **Backend kurulumu:**
```bash
cd SERVER
npm install
cp .env.example .env
# .env dosyasını düzenleyin
npm run dev
```

3. **Frontend kurulumu:**
```bash
cd CLIENT
npm install
cp .env.example .env.local
# .env.local dosyasını düzenleyin
npm run dev
```

### Ortam Değişkenleri

**SERVER/.env:**
```env
PORT=8000
MONGODB=mongodb://localhost:27017/wcfinder
ACCESS_KEY=your_jwt_access_secret
REFRESH_KEY=your_jwt_refresh_secret
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
NODE_ENV=development
```

**CLIENT/.env.local:**
```env
VITE_BASE_URL=http://localhost:8000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
```

---

## 📁 Proje Yapısı

```
WCFinder/
├── CLIENT/                 # React Frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── features/      # Redux slices
│   │   └── router/        # Routing configuration
│   └── package.json
│
├── SERVER/                 # Node.js Backend
│   ├── src/
│   │   ├── models/        # MongoDB models
│   │   ├── controllers/   # Business logic
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   └── services/      # Business services
│   └── package.json
│
└── README.md
```

---

## 🔐 Kimlik Doğrulama

Platform JWT (JSON Web Token) tabanlı kimlik doğrulama kullanır:

- **Access Token:** 1 saat geçerlilik
- **Refresh Token:** 3 gün geçerlilik
- **Roller:** `user`, `owner`, `admin`

### İlk Admin Kullanıcısı

İlk admin kullanıcısını oluşturmak için `CREATE_ADMIN_USER.md` dosyasına bakın.

---

## 💳 Ödeme Sistemi

Platform hem Stripe hem de PayPal ödeme yöntemlerini destekler:

- **Komisyon Yapısı:** Her ödemeden platform 0.50€ komisyon alır
- **İşletme Payı:** Kalan tutar işletmeye ödenir
- **Ödeme Dağıtımı:** Admin tarafından aylık olarak manuel yapılır

Detaylar için `COMMISSION_SYSTEM_DOCUMENTATION.md` dosyasına bakın.

---

## 📚 Dokümantasyon

### Ana Dokümantasyon

- **[Product Requirements Document](prd.md)** - Ürün gereksinimleri ve özellikler
- **[Mimari Dokümantasyon](CLIENT/docs/ARCHITECTURE.md)** - Sistem mimarisi
- **[Dağıtım Rehberi](PRODUCTION_DEPLOYMENT.md)** - Production deployment

### Kullanıcı Rehberleri

- **[Admin Oluşturma](CREATE_ADMIN_USER.md)** - İlk admin kullanıcısı oluşturma
- **[Admin Panel Kılavuzu](ADMIN_PANEL_GUIDE.md)** - Admin panel kullanım kılavuzu ve Business Management
- **[Komisyon Sistemi](COMMISSION_SYSTEM_DOCUMENTATION.md)** - Ödeme ve komisyon yapısı

### API Dokümantasyonu

API dokümantasyonu Swagger ile sağlanmaktadır. Backend çalıştıktan sonra:
- **Swagger UI:** `http://localhost:8000/documents/swagger`
- **ReDoc:** `http://localhost:8000/documents/redoc`

---

## 🔒 Güvenlik

### Uygulanan Güvenlik Önlemleri

- ✅ JWT token tabanlı kimlik doğrulama
- ✅ Password hashing (PBKDF2)
- ✅ XSS koruması (input sanitization)
- ✅ NoSQL injection koruması
- ✅ CORS yapılandırması
- ✅ Rate limiting
- ✅ Helmet security headers
- ✅ HTTPS/TLS (production)

### Güvenlik Notları

- Kart bilgileri (kart numarası, CVV) asla saklanmaz
- Hassas bilgiler environment variables ile yönetilir
- Production'da rate limiting aktif olmalıdır

---

## 📊 Veritabanı

### Ana Collections

- **users** - Kullanıcı bilgileri
- **businesses** - İşletme bilgileri
- **toilets** - Tuvalet bilgileri
- **usages** - Rezervasyonlar
- **payments** - Ödeme kayıtları
- **reviews** - Değerlendirmeler
- **payouts** - Ödeme dağıtımları

### Indexler

Tüm collection'larda performans için uygun indexler tanımlanmıştır:
- User lookup (email, username)
- Business geospatial queries
- Usage queries (userId, businessId)
- Payment queries (businessId, status)

---

## 🧪 Test

### Test Komutları

```bash
# Backend testleri
cd SERVER
npm test

# Frontend testleri
cd CLIENT
npm test

# Lint kontrolü
npm run lint
```

---

## 🚢 Deployment

### 📚 Deployment Rehberleri

1. **[Hızlı Başlangıç (5 Dakika)](DEPLOYMENT_QUICKSTART.md)** ⚡ - En hızlı deployment için
2. **[Detaylı Production Rehberi](PRODUCTION_DEPLOYMENT.md)** 📖 - Adım adım detaylı talimatlar
3. **[Deployment Checklist](DEPLOYMENT_CHECKLIST.md)** ✅ - Kontrol listesi
4. **[Platform Karşılaştırması](DEPLOYMENT_PLATFORM_COMPARISON.md)** 🔄 - Railway vs Render karşılaştırması

### Hızlı Deployment

Production'a almak için en kolay yol:

1. **MongoDB Atlas** kurulumu (2 dk)
2. **Backend deployment** (Railway/Heroku) (3 dk)
3. **Frontend deployment** (Vercel/Netlify) (2 dk)
4. **CORS ayarları** (1 dk)

👉 **[DEPLOYMENT_QUICKSTART.md](DEPLOYMENT_QUICKSTART.md)** dosyasını takip edin!

### Deployment Checklist

- [ ] Environment variables yapılandırıldı
- [ ] MongoDB Atlas bağlantısı test edildi
- [ ] Stripe/PayPal production key'leri ayarlandı
- [ ] SSL sertifikası yapılandırıldı
- [ ] Domain ve DNS ayarları yapıldı
- [ ] Rate limiting aktif edildi
- [ ] Monitoring ve logging kuruldu
- [ ] Backup stratejisi hazırlandı

👉 Detaylı checklist için: **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)**

---

## 📈 Roadmap

### Gelecek Özellikler

- [ ] Mobil uygulama (React Native)
- [ ] Çoklu dil desteği (TR, EN, DE)
- [ ] Otomatik ödeme dağıtımı (Stripe Connect)
- [ ] Push notifications
- [ ] Sadakat/puan sistemi
- [ ] Abonelik modelleri

---

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişiklikleri commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'ı push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın

---

## 📄 Lisans

Bu proje özel bir projedir. Tüm hakları saklıdır.

---

## 📞 İletişim

- **Email:** info@wcfinder.de
- **Website:** www.wcfinder.de

---

## 🙏 Teşekkürler

Bu proje aşağıdaki açık kaynaklı kütüphaneleri kullanır:

- React Community
- Material-UI Team
- Leaflet Developers
- MongoDB Team
- Stripe & PayPal

---

**Son Güncelleme:** Aralık 2024  
**Versiyon:** 1.0.0

