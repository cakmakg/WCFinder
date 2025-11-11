# WCFinder Proje Analiz Raporu

**Tarih:** Aralık 2024  
**Versiyon:** 1.0

---

## 1. Projenin Amacı ve Genel İşlevi

### 1.1 Proje Özeti
**WCFinder**, kullanıcıların yakındaki tuvaletleri bulmasını, değerlendirmesini ve önceden rezervasyon yapmasını sağlayan modern bir web uygulamasıdır. Platform, Bonn, Almanya'da başlayan bir pilot projedir.

### 1.2 Ana İşlevler

#### Kullanıcı Tarafı (Frontend)
- 🗺️ **İnteraktif Harita** - Leaflet ile gerçek zamanlı konum gösterimi
- 🔍 **Tuvaletleri Bulma** - Harita, liste ve arama ile tuvaletleri keşfetme
- 📅 **Rezervasyon Sistemi** - Tarih, kişi sayısı ve cinsiyet tercihi ile ön rezervasyon
- 💳 **Ödeme Entegrasyonu** - Stripe ve PayPal ile güvenli ödeme işlemleri
- 👤 **Profil Yönetimi** - Kullanıcı hesabı ve geçmiş rezervasyonlar
- ⭐ **Değerlendirme Sistemi** - Tuvaletleri puanlama ve yorum yazma
- 🎫 **QR Kod** - Rezervasyon doğrulaması için QR kod

#### İşletme Tarafı (Backend)
- 🏢 **İşletme Yönetimi** - Tuvaletleri ekleme, düzenleme ve silme
- 📊 **Dashboard** - Rezervasyon istatistikleri ve gelir takibi
- ✅ **Onay Sistemi** - Yeni işletmelerin onaylanması (pending/approved/rejected)
- 🔐 **Güvenlik** - JWT token ile kimlik doğrulama

---

## 2. Kullanılan Teknolojiler ve Framework'ler

### 2.1 Frontend (CLIENT)

| Teknoloji | Versiyon | Amaç |
|-----------|----------|------|
| **React** | ^19.1.1 | UI framework |
| **React Router DOM** | ^7.8.2 | Routing |
| **Material-UI (MUI)** | ^7.3.1 | Component library |
| **Redux Toolkit** | ^2.8.2 | State management |
| **Axios** | ^1.12.2 | HTTP client |
| **Leaflet** | ^1.9.4 | Harita kütüphanesi |
| **React-Leaflet** | ^5.0.0 | React wrapper for Leaflet |
| **Formik** | ^2.4.6 | Form yönetimi |
| **Yup** | ^1.7.0 | Form validation |
| **Stripe** | ^8.0.0 | Ödeme entegrasyonu (Stripe) |
| **PayPal** | ^8.9.2 | Ödeme entegrasyonu (PayPal) |
| **React QR Code** | ^2.0.18 | QR kod oluşturma |
| **React Toastify** | ^11.0.5 | Bildirim sistemi |
| **Styled Components** | ^6.1.19 | CSS-in-JS |
| **Redux Persist** | ^6.0.0 | State persistence (yorumda) |
| **Vite** | ^7.1.2 | Build tool |

### 2.2 Backend (SERVER)

| Teknoloji | Versiyon | Amaç |
|-----------|----------|------|
| **Node.js** | - | Runtime environment |
| **Express.js** | ^4.21.2 | Web framework |
| **MongoDB** | - | NoSQL veritabanı |
| **Mongoose** | ^7.8.7 | MongoDB ODM |
| **JWT (jsonwebtoken)** | ^9.0.2 | Kimlik doğrulama |
| **Stripe SDK** | ^19.1.0 | Ödeme işlemleri (Stripe) |
| **PayPal SDK** | ^1.0.3 | Ödeme işlemleri (PayPal) |
| **Multer** | ^2.0.2 | Dosya yükleme |
| **Helmet** | ^7.2.0 | Güvenlik middleware |
| **CORS** | ^2.8.5 | Cross-origin resource sharing |
| **Express Rate Limit** | ^6.11.2 | Rate limiting (yorumda) |
| **Swagger** | ^2.23.7 | API dokümantasyonu |
| **Express Async Errors** | ^3.1.1 | Async error handling |
| **Dotenv** | ^16.6.1 | Ortam değişkenleri |

### 2.3 Development Tools

- **Nodemon** - Backend hot reload
- **ESLint** - Code linting
- **Vite** - Frontend build tool ve dev server

---

## 3. Klasör / Dosya Yapısı

### 3.1 Root Yapısı
```
WCFinder/
├── CLIENT/              # React Frontend uygulaması
├── SERVER/              # Node.js/Express Backend uygulaması
└── WCFinder-clean.git/  # Git repository klasörü
```

### 3.2 CLIENT/ Klasör Yapısı

#### `CLIENT/src/`
| Klasör | Amaç |
|--------|------|
| **api/** | Redux store yapılandırması |
| **components/** | Yeniden kullanılabilir React component'leri |
| ├── **business/** | İşletme ile ilgili component'ler (BookingPanel, BusinessList, BusinessSearchBar, ToiletList) |
| ├── **layout/** | Layout component'leri (AppBar, SideBar) |
| ├── **map/** | Harita ile ilgili component'ler (MapContainer, MapController, MapMarker, MarkerPopup) |
| └── **payment/** | Ödeme ile ilgili component'ler (OrderSummary, PaymentMethodCard, PayPalButton, StripeCardForm) |
| **features/** | Redux slice'ları (authSlice, crudSlice) |
| **helper/** | Yardımcı fonksiyonlar (ToastNotify) |
| **hook/** | Custom React hooks |
| ├── useApiCall.jsx | API çağrıları için hook |
| ├── useAuthCall.jsx | Authentication işlemleri için hook |
| ├── useAxios.jsx | Axios instance yönetimi |
| ├── useBusinessFilter.js | İşletme filtreleme |
| ├── useBusinessSearch.js | İşletme arama |
| ├── useCrudCall.jsx | CRUD işlemleri için hook |
| └── useMapControl.js | Harita kontrolü |
| **pages/** | Sayfa component'leri |
| ├── Home.jsx | Ana sayfa (harita ve liste görünümü) |
| ├── Dashboard.jsx | Dashboard sayfası |
| ├── BusinessDetail.jsx | İşletme detay sayfası |
| ├── Login.jsx | Giriş sayfası |
| ├── Register.jsx | Kayıt sayfası |
| ├── PaymentPage.jsx | Ödeme sayfası |
| ├── PaymentSuccessPage.jsx | Ödeme başarı sayfası |
| ├── PaymentFailedPage.jsx | Ödeme başarısız sayfası |
| └── MyBookingsPage.jsx | Rezervasyonlarım sayfası |
| **router/** | Routing yapılandırması |
| ├── AppRouter.jsx | Ana router yapılandırması |
| └── PrivateRouter.jsx | Özel route koruması |
| **services/** | API servisleri |
| ├── api.js | Ana API instance (Axios) |
| ├── paymentService.js | Ödeme servisleri |
| ├── geocoding.js | Geocoding servisleri |
| └── usageService.js | Kullanım/rezervasyon servisleri |
| **utils/** | Yardımcı fonksiyonlar |
| └── markerUtils.js | Harita marker yardımcı fonksiyonları |

#### `CLIENT/docs/`
- **readme.md** - Proje dokümantasyonu
- **projectcharter.md** - Proje sözleşmesi
- **ARCHITECTURE.md** - Mimari dokümantasyon
- **DEPLOYMENT.md** - Dağıtım rehberi
- **TESTING_PLAN.md** - Test planı
- **requirements.md** - Gereksinimler

### 3.3 SERVER/ Klasör Yapısı

#### `SERVER/src/`
| Klasör | Amaç |
|--------|------|
| **config/** | Yapılandırma dosyaları |
| ├── dbConnection.js | MongoDB bağlantı yapılandırması |
| ├── stripe.js | Stripe yapılandırması |
| └── paypal.js | PayPal yapılandırması |
| **controller/** | İş mantığı (business logic) |
| ├── auth.js | Authentication işlemleri |
| ├── business.js | İşletme işlemleri |
| ├── payment.js | Ödeme işlemleri |
| ├── review.js | Değerlendirme işlemleri |
| ├── toilet.js | Tuvalet işlemleri |
| ├── token.js | Token işlemleri |
| ├── usage.js | Rezervasyon/kullanım işlemleri |
| └── user.js | Kullanıcı işlemleri |
| **middleware/** | Express middleware'leri |
| ├── authentication.js | JWT token doğrulama |
| ├── errorHnadler.js | Hata yönetimi (⚠️ typo: errorHnadler) |
| ├── permissions.js | Yetki kontrolü (isLogin, isAdmin, isOwnerOrAdmin) |
| ├── queryHandler.js | Query parametreleri işleme |
| └── upload.js | Dosya yükleme işlemleri |
| **models/** | MongoDB Mongoose modelleri |
| ├── user.js | Kullanıcı modeli |
| ├── business.js | İşletme modeli |
| ├── toilet.js | Tuvalet modeli |
| ├── usage.js | Rezervasyon modeli |
| ├── payment.js | Ödeme modeli |
| ├── review.js | Değerlendirme modeli |
| └── token.js | Token modeli |
| **routes/** | API route tanımları |
| ├── index.js | Ana route yönlendirici |
| ├── auth.js | Authentication route'ları |
| ├── business.js | İşletme route'ları |
| ├── toilet.js | Tuvalet route'ları |
| ├── usage.js | Rezervasyon route'ları |
| ├── payment.js | Ödeme route'ları |
| ├── review.js | Değerlendirme route'ları |
| ├── user.js | Kullanıcı route'ları |
| ├── token.js | Token route'ları |
| └── document.js | API dokümantasyon route'ları |
| **helper/** | Yardımcı fonksiyonlar |
| ├── passwordEncrypt.js | Şifre hash'leme |
| ├── sendMail.js | E-posta gönderme |
| └── sync.js | Veritabanı senkronizasyonu |

#### `SERVER/`
- **index.js** - Server giriş noktası
- **swaggerAutogen.js** - Swagger otomatik dokümantasyon oluşturucu
- **uploads/** - Yüklenen dosyalar klasörü

---

## 4. Giriş Dosyaları

### 4.1 Backend Giriş Noktası: `SERVER/index.js`

**Özellikler:**
- Express.js server yapılandırması
- MongoDB bağlantısı (`dbConnection()`)
- Middleware sırası:
  1. `queryHandler` - Query parametreleri işleme
  2. `helmet` - Güvenlik headers
  3. `cors` - Cross-origin ayarları
  4. `express.json()` - JSON parser
  5. `authentication` - JWT doğrulama (her request'te)
  6. Routes - API route'ları
  7. `errorHandler` - Hata yakalama
- Port: `8000` (varsayılan) veya `process.env.PORT`
- Host: `127.0.0.1` (varsayılan) veya `process.env.HOST`
- Swagger dokümantasyon: `/documents/swagger`, `/documents/redoc`

**Önemli Notlar:**
- Rate limiting yorum satırında (kullanılmıyor)
- Sync helper yorum satırında (veritabanını temizler, dikkatli kullanılmalı)

### 4.2 Frontend Giriş Noktası: `CLIENT/src/main.jsx`

**Özellikler:**
- React 19 ile render
- `App.jsx` component'ini render eder
- Basit giriş noktası

### 4.3 Frontend Ana Component: `CLIENT/src/App.jsx`

**Özellikler:**
- Material-UI Theme Provider
- Redux Provider (store)
- Error Boundary (hata yakalama)
- ToastContainer (bildirimler)
- AppRouter (routing)

**Önemli Notlar:**
- Redux Persist yorum satırında (kullanılmıyor)

### 4.4 Router Yapılandırması: `CLIENT/src/router/AppRouter.jsx`

**Özellikler:**
- React Router DOM ile routing
- Stripe Elements Provider (conditional)
- PayPal Script Provider (conditional)
- Route'lar:
  - `/login` - Giriş (public)
  - `/register` - Kayıt (public)
  - `/` - Ana sayfa (private)
  - `/business/:id` - İşletme detay (private)
  - `/payment` - Ödeme (private)
  - `/payment/success` - Ödeme başarı (private)
  - `/payment/failed` - Ödeme başarısız (private)
  - `/my-bookings` - Rezervasyonlarım (private)

**Önemli Notlar:**
- Stripe ve PayPal key'leri kontrol edilerek conditional rendering yapılıyor
- Key'ler yoksa uygulama çalışmaya devam ediyor

---

## 5. Backend ve Frontend Arasındaki İletişim

### 5.1 İletişim Mimarisi

```
Frontend (React) 
    ↓
Axios Instance (services/api.js)
    ↓
Axios Interceptor (Authorization Header ekler)
    ↓
Backend API (Express.js)
    ↓
Authentication Middleware (JWT doğrulama)
    ↓
Routes & Controllers
    ↓
MongoDB (Mongoose)
```

### 5.2 API İletişim Detayları

#### Frontend Tarafı

**1. API Instance Oluşturma** (`CLIENT/src/services/api.js`)
```javascript
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8000';
const api = axios.create({ baseURL: BASE_URL });
```

**2. Token Yönetimi**
- Token `localStorage`'da saklanır
- Her request'te `Authorization: Bearer <token>` header'ı eklenir
- Axios interceptor ile otomatik ekleme

**3. Custom Hooks**
- `useAxios` - Token'lı ve token'sız axios instance'ları
- `useAuthCall` - Authentication işlemleri
- `useApiCall` - Genel API çağrıları
- `useCrudCall` - CRUD işlemleri

#### Backend Tarafı

**1. CORS Yapılandırması** (`SERVER/index.js`)
```javascript
cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})
```

**2. Authentication Middleware** (`SERVER/src/middleware/authentication.js`)
- Her request'te çalışır
- `Authorization` header'ını kontrol eder
- İki token tipi destekler:
  - `Token <simpleToken>` - Simple token (Token model'den)
  - `Bearer <jwtToken>` - JWT token
- `req.user` objesini set eder (veya null)

**3. API Endpoints Yapısı**

| Endpoint | Method | Açıklama | Auth |
|----------|--------|----------|------|
| `/auth/login` | POST | Giriş | - |
| `/auth/register` | POST | Kayıt | - |
| `/auth/logout` | GET | Çıkış | - |
| `/auth/refresh` | POST | Token yenileme | - |
| `/business` | GET | İşletmeleri listele | - |
| `/business/:id` | GET | İşletme detay | - |
| `/business` | POST | İşletme oluştur | isLogin |
| `/toilet` | GET | Tuvaletleri listele | - |
| `/usages` | GET | Rezervasyonlar | isLogin |
| `/usages` | POST | Rezervasyon oluştur | isLogin |
| `/payments/stripe/create` | POST | Stripe ödeme | isLogin |
| `/payments/paypal/create` | POST | PayPal ödeme | isLogin |
| `/payments/paypal/capture` | POST | PayPal onaylama | isLogin |
| `/review` | POST | Değerlendirme ekle | isLogin |

### 5.3 Hata Yönetimi

**Frontend:**
- Axios interceptor ile 401 hatası yakalanıyor
- 401 durumunda `localStorage` temizleniyor ve `/login`'e yönlendiriliyor
- `react-toastify` ile kullanıcıya bildirim gösteriliyor

**Backend:**
- `express-async-errors` ile async hatalar yakalanıyor
- `errorHandler` middleware ile hata response'ları formatlanıyor
- Hata response formatı:
```javascript
{
  error: true,
  message: "Error message",
  cause: "Error cause",
  body: req.body,
  stack: err.stack // Development'ta
}
```

### 5.4 State Management

**Frontend:**
- Redux Toolkit kullanılıyor
- Store yapısı:
  - `auth` - Authentication state (user, token, loading, error)
  - `crud` - CRUD işlemleri state
- LocalStorage ile token persistence (Redux Persist kullanılmıyor)

---

## 6. Ortam Değişkenleri (.env) Yapılandırması

### 6.1 Backend Ortam Değişkenleri (`SERVER/.env`)

**Gerekli Değişkenler:**

```env
# Server Yapılandırması
PORT=8000
HOST=127.0.0.1
NODE_ENV=development

# Veritabanı
MONGODB=mongodb://localhost:27017/wcfinder
# veya MongoDB Atlas:
# MONGODB=mongodb+srv://username:password@cluster.mongodb.net/wcfinder

# JWT Authentication
ACCESS_KEY=your_access_token_secret_key
REFRESH_KEY=your_refresh_token_secret_key

# Stripe Ödeme
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# PayPal Ödeme
PAYPAL_CLIENT_ID=Axxxxx
PAYPAL_CLIENT_SECRET=xxxxx
```

**Kullanım:**
- `dotenv` paketi ile `index.js`'de yükleniyor
- `process.env.VARIABLE_NAME` şeklinde erişiliyor

### 6.2 Frontend Ortam Değişkenleri (`CLIENT/.env`)

**Gerekli Değişkenler:**

```env
# API URL
VITE_BASE_URL=http://localhost:8000
# veya
VITE_API_URL=http://localhost:8000

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# PayPal
VITE_PAYPAL_CLIENT_ID=Axxxxx
```

**Kullanım:**
- Vite'de `import.meta.env.VITE_*` şeklinde erişiliyor
- Sadece `VITE_` ile başlayan değişkenler expose edilir

### 6.3 ⚠️ Mevcut Durum

**Eksiklikler:**
- `.env.example` dosyaları yok
- `.env` dosyaları git'e commit edilmemeli (`.gitignore`'da var)
- Ortam değişkenleri dokümantasyonda belirtilmiş ancak örnek dosyalar yok

**Öneriler:**
1. `SERVER/.env.example` oluşturulmalı
2. `CLIENT/.env.example` oluşturulmalı
3. Tüm gerekli değişkenler dokümante edilmeli

---

## 7. Eksik, Hatalı veya Geliştirilebilir Noktalar

### 7.1 🔴 Kritik Sorunlar

#### 1. **Ortam Değişkenleri Eksik**
- `.env.example` dosyaları yok
- Yeni geliştiriciler için kurulum zorluğu

#### 2. **Hata Yönetimi - Typo**
- `errorHnadler.js` → `errorHandler.js` olmalı (typo)
- Dosya adı standartlara uygun değil

#### 3. **Rate Limiting Devre Dışı**
- `SERVER/index.js`'de rate limiting yorum satırında
- DDoS saldırılarına karşı korumasız

#### 4. **Güvenlik Sorunları**
- Error handler'da `stack` trace production'da expose ediliyor
- Production'da detaylı hata mesajları güvenlik riski

#### 5. **MongoDB Bağlantı Ayarları**
- `useNewUrlParser` ve `useUnifiedTopology` eski Mongoose versiyonları için (Mongoose 7'de varsayılan)
- Gereksiz parametreler

### 7.2 🟡 Orta Öncelikli Sorunlar

#### 1. **Redux Persist Kullanılmıyor**
- `App.jsx`'de yorum satırında
- Token persistence için localStorage manuel kullanılıyor
- Redux Persist kullanılsa daha iyi olur

#### 2. **Token Yönetimi**
- Refresh token mekanizması var ancak frontend'de otomatik kullanılmıyor
- Token expire olduğunda manuel refresh gerekli

#### 3. **API Error Handling**
- Frontend'de hata mesajları standart değil
- Bazı yerlerde try-catch eksik

#### 4. **Validation**
- Backend'de Mongoose validation var
- Frontend'de Yup validation var
- Ancak bazı endpoint'lerde validation eksik olabilir

#### 5. **CORS Yapılandırması**
- Sadece localhost URL'leri hardcoded
- Production URL'leri environment variable'dan alınmalı

### 7.3 🟢 Düşük Öncelikli / İyileştirmeler

#### 1. **Kod Organizasyonu**
- Bazı controller'larda kod tekrarı var
- Helper fonksiyonlar daha iyi organize edilebilir

#### 2. **TypeScript**
- Proje JavaScript kullanıyor
- TypeScript'e geçiş type safety sağlar

#### 3. **Testing**
- Unit test yok
- Integration test yok
- E2E test yok

#### 4. **Dokümantasyon**
- API dokümantasyonu Swagger ile var
- Ancak kod içi dokümantasyon eksik
- JSDoc comment'leri yok

#### 5. **Logging**
- Console.log kullanılıyor
- Professional logging library (Winston, Pino) kullanılmalı

#### 6. **Performance**
- MongoDB index'leri var ancak bazı sorgularda optimize edilebilir
- Frontend'de lazy loading yok
- Image optimization yok

#### 7. **Accessibility**
- Material-UI kullanılıyor (iyi)
- Ancak accessibility test'leri yapılmamış

### 7.4 📋 Best Practice Önerileri

#### 1. **Environment Variables**
```javascript
// .env.example dosyaları oluştur
// Tüm değişkenleri dokümante et
// Validation ekle (joi, zod gibi)
```

#### 2. **Error Handling**
```javascript
// Centralized error handling
// Custom error classes
// Error logging service
```

#### 3. **Security**
```javascript
// Rate limiting aktif et
// Input validation (express-validator)
// SQL injection koruması (NoSQL injection için)
// XSS koruması
// CSRF token
```

#### 4. **Code Quality**
```javascript
// ESLint rules sıkılaştır
// Prettier ekle
// Husky ile pre-commit hooks
// Code review process
```

#### 5. **Testing**
```javascript
// Jest + React Testing Library (Frontend)
// Jest + Supertest (Backend)
// Cypress (E2E)
```

#### 6. **CI/CD**
```javascript
// GitHub Actions
// Automated testing
// Automated deployment
```

#### 7. **Monitoring**
```javascript
// Error tracking (Sentry)
// Performance monitoring
// Analytics
```

#### 8. **Database**
```javascript
// Connection pooling
// Query optimization
// Backup strategy
```

#### 9. **API Design**
```javascript
// RESTful standartlara uy
// API versioning
// Pagination
// Filtering, sorting
```

#### 10. **Frontend Optimization**
```javascript
// Code splitting
// Lazy loading
// Image optimization
// Caching strategy
```

---

## 8. Özet ve Sonuçlar

### 8.1 Güçlü Yönler
✅ Modern teknoloji stack  
✅ İyi organize edilmiş klasör yapısı  
✅ Redux ile state management  
✅ JWT authentication  
✅ Ödeme entegrasyonları (Stripe, PayPal)  
✅ Swagger API dokümantasyonu  
✅ Material-UI ile modern UI  
✅ Harita entegrasyonu (Leaflet)  

### 8.2 Zayıf Yönler
❌ Ortam değişkenleri dokümantasyonu eksik  
❌ Rate limiting devre dışı  
❌ Testing eksik  
❌ Error handling iyileştirilebilir  
❌ TypeScript yok  
❌ Logging sistemi yok  
❌ Production hazırlığı eksik  

### 8.3 Öncelikli Aksiyonlar
1. 🔴 `.env.example` dosyaları oluştur
2. 🔴 `errorHnadler.js` dosya adını düzelt
3. 🔴 Rate limiting aktif et
4. 🟡 Token refresh mekanizmasını frontend'e ekle
5. 🟡 Error handling'i iyileştir
6. 🟢 Testing altyapısını kur
7. 🟢 Logging sistemi ekle

---

**Rapor Hazırlayan:** AI Assistant  
**Son Güncelleme:** Aralık 2024  
**Versiyon:** 1.0


