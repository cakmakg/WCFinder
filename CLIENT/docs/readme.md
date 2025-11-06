# WCFinder - Tuvaletler Bulma ve Rezervasyon Platformu

WCFinder, kullanıcıların yakındaki tuvaletleri bulmasını, değerlendirmesini ve önceden rezervasyon yapmasını sağlayan modern web uygulamasıdır. İşletme sahipleri tuvaletlerini listeleyebilir ve yönetebilir.

## 🎯 Proje Özeti

WCFinder, Bonn, Almanya'da başlayan bir pilot projedir. Kullanıcılar harita üzerinden yakındaki tuvaletleri görebilir, detay bilgilerini inceleyebilir ve rezervasyon yapabilirler. İşletmeler tuvaletlerini yönetebilir ve gelir elde edebilirler.

## 🚀 Özellikler

### Kullanıcı Tarafı (Frontend)
- 🗺️ **İnteraktif Harita** - Leaflet ile gerçek zamanlı konum gösterimi
- 🔍 **Tuvaletleri Bulma** - Harita, liste ve arama ile tuvaletleri keşfetme
- 📅 **Rezervasyon Sistemi** - Tarih, kişi sayısı ve cinsiyet tercihi ile ön rezervasyon
- 💳 **Ödeme Entegrasyonu** - Stripe ile güvenli ödeme işlemleri
- 👤 **Profil Yönetimi** - Kullanıcı hesabı ve geçmiş rezervasyonlar
- ⭐ **Değerlendirme Sistemi** - Tuvaletleri puanlama ve yorum yazma
- 🎫 **QR Kod** - Rezervasyon doğrulaması için QR kod

### İşletme Tarafı (Backend/Admin)
- 🏢 **İşletme Yönetimi** - Tuvaletleri ekleme, düzenleme ve silme
- 📊 **Dashboard** - Rezervasyon istatistikleri ve gelir takibi
- ✅ **Onay Sistemi** - Yeni işletmelerin onaylanması
- 🔐 **Güvenlik** - JWT token ile kimlik doğrulama

## 🛠️ Teknoloji Stack

### Frontend
- **React** 18+ - UI framework
- **Material-UI (MUI)** - Component library
- **React Router** - Routing
- **Axios** - HTTP client
- **Leaflet** - Harita kütüphanesi
- **React QR Code** - QR kod oluşturma
- **Redux** - State management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL veritabanı
- **Mongoose** - MongoDB ODM
- **JWT** - Kimlik doğrulama
- **Stripe** - Ödeme işlemleri

### DevOps
- **Docker** - Containerization
- **MongoDB Atlas** - Cloud database
- **Heroku/AWS** - Deployment (isteğe bağlı)

## 📁 Proje Yapısı

```
WCFinder/
├── CLIENT/                    # React Frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── business/
│   │   │   ├── layout/
│   │   │   └── map/
│   │   ├── pages/            # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── BusinessDetail.jsx
│   │   │   ├── MyBookingsPage.jsx
│   │   │   └── PaymentPage.jsx
│   │   ├── services/         # API services
│   │   ├── hooks/            # Custom hooks
│   │   ├── context/          # Context API
│   │   ├── store/            # Redux store
│   │   └── App.jsx
│   └── package.json
│
├── SERVER/                    # Node.js Backend
│   ├── src/
│   │   ├── models/           # MongoDB models
│   │   │   ├── business.js
│   │   │   ├── toilet.js
│   │   │   ├── usage.js
│   │   │   ├── review.js
│   │   │   └── user.js
│   │   ├── routes/           # API routes
│   │   │   ├── business.js
│   │   │   ├── toilet.js
│   │   │   ├── usage.js
│   │   │   ├── payment.js
│   │   │   └── auth.js
│   │   ├── controllers/      # Business logic
│   │   ├── middleware/       # Custom middleware
│   │   ├── config/           # Configuration
│   │   └── server.js
│   ├── .env
│   └── package.json
│
└── README.md
```

## 🚀 Başlangıç

### Gereksinimler
- Node.js v14+
- MongoDB v4.4+
- npm veya yarn
- Stripe hesabı (ödeme için)

### Frontend Kurulumu

```bash
cd CLIENT
npm install
npm start
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

### Backend Kurulumu

```bash
cd SERVER
npm install
npm run dev
```

Backend `http://localhost:8000` adresinde çalışacaktır.

### Ortam Değişkenleri

**SERVER/.env**
```
PORT=8000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wcfinder
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLIC_KEY=your_stripe_public_key
NODE_ENV=development
```

**CLIENT/.env**
```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

## 📊 Veri Tabanı Yapısı

### Collections

**business**
- businessName, businessType, address, location
- owner (User reference), approvalStatus
- openingHours, createdAt, updatedAt

**toilet**
- business (Business reference)
- name, fee, features (isAccessible, hasBabyChangingStation)
- status (available, in_use, out_of_order)
- averageRatings, reviewCount

**usage** (Rezervasyonlar)
- userId, businessId, toiletId
- startTime, personCount, genderPreference
- accessCode, status, totalFee, paymentStatus

**review** (Değerlendirmeler)
- userId, toiletId, businessId
- rating, cleanliness, comment

**user**
- username, email, password (hashed)
- role (user, business, admin)
- profile information

## 🔑 API Endpoints

### Authentication
- `POST /auth/register` - Kayıt
- `POST /auth/login` - Giriş
- `POST /auth/logout` - Çıkış

### Business
- `GET /business` - Tüm işletmeleri listele
- `GET /business/:id` - İşletme detayları
- `POST /business` - Yeni işletme oluştur (İşletme sahibi)
- `PUT /business/:id` - İşletme güncelle
- `DELETE /business/:id` - İşletme sil

### Toilet
- `GET /toilet` - Tüm tuvaletleri listele
- `GET /toilet/:id` - Tuvalet detayları
- `POST /toilet` - Yeni tuvalet ekle
- `PUT /toilet/:id` - Tuvalet güncelle
- `DELETE /toilet/:id` - Tuvalet sil

### Usage (Rezervasyonlar)
- `GET /usage/my-usages` - Kullanıcının rezervasyonları
- `POST /usage` - Yeni rezervasyon oluştur
- `PUT /usage/:id` - Rezervasyon güncelle
- `GET /usage/:id/qr` - QR kod

### Payment
- `POST /payment/create-payment-intent` - Ödeme başlat
- `POST /payment/confirm` - Ödeme onayla

### Review
- `POST /review` - Yorum ekle
- `GET /review/toilet/:id` - Tuvaletin yorumları

## 🔐 Kimlik Doğrulama

WCFinder JWT (JSON Web Token) kullanır:

1. Kullanıcı giriş yapar → JWT token alır
2. Her request'te Authorization header'a token eklenir
3. Backend token'ı doğrular ve işlem yapar

## 💳 Ödeme Akışı

1. Kullanıcı rezervasyon bilgilerini doldurur
2. Payment page'e yönlendirilir
3. Stripe Checkout başlatılır
4. Ödeme başarılı → Usage kaydı oluşturulur
5. Kullanıcı QR kod ve accessCode alır

## 📱 Responsif Tasarım

- **Mobile** - xs: 320px - sm: 600px
- **Tablet** - md: 960px - lg: 1280px
- **Desktop** - xl: 1920px

## 🐛 Bilinen Sorunlar

- My Bookings sayfası için usage endpoint API çağrısı yapılması gerekiyor
- `/profile` route'u yapılandırılması gerekiyor

## 🚧 Gelecek Özellikler

- [ ] İletişim sistemi (Messaging)
- [ ] Anlık bildirimler (Real-time Notifications)
- [ ] Mobil app (React Native)
- [ ] AI tabanlı tuvaletleri bulma
- [ ] Sosyal paylaşım özellikleri
- [ ] Multilingüal destek

## 👥 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişiklikleri commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'ı push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT Lisansı altında yayınlanmıştır.

## 📞 İletişim

- **Email**: info@wcfinder.de
- **Website**: www.wcfinder.de
- **GitHub**: https://github.com/wcfinder/wcfinder

## 🙏 Teşekkürler

Bu proje açık kaynaklı kütüphaneler ve framework'ler kullanır:
- React community
- Material-UI team
- Leaflet developers
- MongoDB team

---

**Son Güncelleme**: Eylül 2025
**Versiyon**: 1.0.0-beta