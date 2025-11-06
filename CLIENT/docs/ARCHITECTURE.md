# WCFinder - Sistem Mimarisi (Architecture)

**Versiyon**: 1.0  
**Tarih**: Eylül 2025

---

## 1. Mimari Genel Bakış

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (React)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   UI Layer   │  │ Redux Store  │  │ API Client   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              ↓ (HTTPS)
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY                               │
│              (Rate Limiting, Auth, Logging)                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Auth Routes  │  │ Business API │  │ Toilet API   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Usage API    │  │ Payment API   │  │ Review API   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  DATA LAYER                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   MongoDB    │  │ Redis Cache  │  │ File Storage │       │
│  │   (Primary)  │  │ (Session)    │  │ (S3/AWS)     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│               EXTERNAL SERVICES                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Stripe     │  │  OpenStreetMap  │  │   SendGrid   │       │
│  │  (Payment)   │  │   (Harita)      │  │  (Email)     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Mimarisi

### 2.1 Katmanlı Yapı (Layered Architecture)

```
┌─────────────────────────────────────┐
│        PRESENTATION LAYER           │
│  ├── Pages (Home, Detail, etc.)     │
│  ├── Components (Card, Modal, etc.) │
│  └── Layout                         │
├─────────────────────────────────────┤
│         BUSINESS LOGIC LAYER        │
│  ├── Redux Actions/Reducers         │
│  ├── Custom Hooks                   │
│  └── Utilities                      │
├─────────────────────────────────────┤
│          DATA ACCESS LAYER          │
│  ├── API Services (axios)           │
│  ├── Local Storage                  │
│  └── Context API                    │
└─────────────────────────────────────┘
```

### 2.2 Klasör Yapısı

```
CLIENT/src/
├── components/
│   ├── business/
│   │   ├── BusinessCard.jsx
│   │   ├── BusinessDetail.jsx
│   │   └── BusinessList.jsx
│   ├── layout/
│   │   ├── AppBar.jsx
│   │   ├── Sidebar.jsx
│   │   └── Footer.jsx
│   └── map/
│       ├── MapContainer.jsx
│       └── MapMarker.jsx
├── pages/
│   ├── Home.jsx
│   ├── BusinessDetail.jsx
│   ├── MyBookingsPage.jsx
│   └── PaymentPage.jsx
├── services/
│   ├── businessService.js
│   ├── toiletService.js
│   ├── usageService.js
│   └── paymentService.js
├── hooks/
│   ├── useAxios.js
│   └── useAuth.js
├── store/
│   ├── slices/
│   │   ├── authSlice.js
│   │   ├── crudSlice.js
│   │   └── mapSlice.js
│   └── index.js
└── App.jsx
```

### 2.3 State Management (Redux)

```
Redux Store
├── auth
│   ├── currentUser
│   ├── token
│   └── isAuthenticated
├── crud
│   ├── business
│   ├── toilet
│   ├── usage
│   └── loading/error
└── map
    ├── center
    ├── zoom
    └── selectedBusiness
```

---

## 3. Backend Mimarisi

### 3.1 MVC Patern

```
┌──────────────────────────────────────┐
│      ROUTES (Controllers)            │
│  ├── auth.js                         │
│  ├── business.js                     │
│  ├── toilet.js                       │
│  ├── usage.js                        │
│  ├── payment.js                      │
│  └── review.js                       │
└──────────────────────────────────────┘
            ↓
┌──────────────────────────────────────┐
│    CONTROLLERS (Business Logic)      │
│  ├── authController.js               │
│  ├── businessController.js           │
│  ├── toiletController.js             │
│  ├── usageController.js              │
│  ├── paymentController.js            │
│  └── reviewController.js             │
└──────────────────────────────────────┘
            ↓
┌──────────────────────────────────────┐
│      MODELS (Data Access)            │
│  ├── User.js                         │
│  ├── Business.js                     │
│  ├── Toilet.js                       │
│  ├── Usage.js                        │
│  ├── Review.js                       │
│  └── Payment.js                      │
└──────────────────────────────────────┘
            ↓
┌──────────────────────────────────────┐
│      DATABASE (MongoDB)              │
└──────────────────────────────────────┘
```

### 3.2 Klasör Yapısı

```
SERVER/src/
├── routes/
│   ├── auth.js
│   ├── business.js
│   ├── toilet.js
│   ├── usage.js
│   ├── payment.js
│   └── review.js
├── controllers/
│   ├── auth.controller.js
│   ├── business.controller.js
│   ├── toilet.controller.js
│   ├── usage.controller.js
│   ├── payment.controller.js
│   └── review.controller.js
├── models/
│   ├── User.js
│   ├── Business.js
│   ├── Toilet.js
│   ├── Usage.js
│   ├── Review.js
│   └── Payment.js
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   ├── queryHandler.js
│   └── logger.js
├── services/
│   ├── stripe.service.js
│   ├── email.service.js
│   └── cache.service.js
├── config/
│   ├── database.js
│   ├── stripe.js
│   └── email.js
└── server.js
```

### 3.3 Middleware Pipeline

```
Request
   ↓
[Logger] → Tüm istekleri logla
   ↓
[CORS] → Cross-Origin kontrol
   ↓
[Body Parser] → JSON'u parse et
   ↓
[Query Handler] → Filtering/Sorting/Pagination
   ↓
[Auth] → JWT doğrula
   ↓
[Routes] → Uygun rota bul
   ↓
[Controller] → İş mantığını çalıştır
   ↓
[Error Handler] → Hataları yakala
   ↓
Response
```

---

## 4. Veri Tabanı Mimarisi

### 4.1 ER Diyagramı

```
┌─────────────┐
│    USER     │
├─────────────┤
│ _id (PK)    │
│ username    │
│ email       │
│ password    │
│ role        │
└─────────────┘
      ↑
      │ 1:N
      └─────────────────┐
                        │
┌─────────────┐    ┌──────────────┐
│ BUSINESS    │←──→│   TOILET     │
├─────────────┤    ├──────────────┤
│ _id (PK)    │ 1:N│ _id (PK)     │
│ owner (FK)  │    │ business(FK) │
│ name        │    │ name         │
│ type        │    │ fee          │
│ address     │    │ features     │
│ location    │    │ status       │
└─────────────┘    └──────────────┘
      ↑                    ↑
      │ 1:N                │ 1:N
      │                    │
      └────┬───────────────┘
           │
      ┌─────────┐
      │  USAGE  │
      ├─────────┤
      │ _id (PK)│
      │ user(FK)│
      │business │
      │ toilet  │
      │ date    │
      │ fee     │
      └─────────┘
           │
           │ 1:N
           ↓
      ┌──────────┐
      │  REVIEW  │
      ├──────────┤
      │ _id (PK) │
      │ user(FK) │
      │ toilet(FK)
      │ rating   │
      │ comment  │
      └──────────┘
```

### 4.2 Koleksiyon Şemaları

```javascript
// Users Collection
{
  _id: ObjectId,
  username: String,
  email: String (unique),
  password: String (hashed),
  role: String (user|business|admin),
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    avatar: String
  },
  createdAt: Date,
  updatedAt: Date
}

// Business Collection
{
  _id: ObjectId,
  owner: ObjectId (ref: User),
  businessName: String,
  businessType: String,
  address: {
    street: String,
    city: String,
    postalCode: String,
    country: String
  },
  location: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  openingHours: String,
  approvalStatus: String,
  createdAt: Date
}

// Toilet Collection
{
  _id: ObjectId,
  business: ObjectId (ref: Business),
  name: String,
  fee: Number,
  features: {
    isAccessible: Boolean,
    hasBabyChangingStation: Boolean
  },
  status: String,
  averageRatings: {
    cleanliness: Number,
    overall: Number
  },
  reviewCount: Number
}

// Usage Collection
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  businessId: ObjectId (ref: Business),
  toiletId: ObjectId (ref: Toilet),
  startTime: Date,
  personCount: Number,
  genderPreference: String,
  accessCode: String (unique),
  status: String,
  totalFee: Number,
  paymentStatus: String,
  stripePaymentId: String
}

// Review Collection
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  toiletId: ObjectId (ref: Toilet),
  businessId: ObjectId (ref: Business),
  rating: Number,
  cleanliness: Number,
  comment: String,
  createdAt: Date
}
```

### 4.3 Indexleme Stratejisi

```javascript
// Business Collection
db.business.createIndex({ owner: 1 })
db.business.createIndex({ "location": "2dsphere" })
db.business.createIndex({ approvalStatus: 1 })

// Toilet Collection
db.toilet.createIndex({ business: 1 })
db.toilet.createIndex({ "business": 1, "status": 1 })

// Usage Collection
db.usage.createIndex({ userId: 1 })
db.usage.createIndex({ businessId: 1 })
db.usage.createIndex({ status: 1 })
db.usage.createIndex({ accessCode: 1 })

// Review Collection
db.review.createIndex({ toiletId: 1 })
db.review.createIndex({ userId: 1 })
```

---

## 5. Entegrasyon Mimarisi

### 5.1 Stripe Entegrasyonu

```
[Client] 
  ↓
[Stripe.js] (Token oluştur)
  ↓
[Backend] (Payment Intent oluş tur)
  ↓
[Stripe API] (Ödeme işle)
  ↓
[Webhook] (Ödeme sonucu)
  ↓
[MongoDB] (Usage kaydını güncelle)
```

### 5.2 Email Sistemi (SendGrid)

```
[Event] (Rezervasyon, İptal, Hatırlatıcı)
  ↓
[Queue] (Bull/Redis)
  ↓
[Worker] (İş parçacığı)
  ↓
[SendGrid API] (Email gönder)
  ↓
[Recipient] (Kullanıcı)
```

### 5.3 Harita Sistemi (Leaflet + OpenStreetMap)

```
[Client Map Component]
  ↓
[Leaflet.js]
  ↓
[OpenStreetMap Tiles]
  ↓
[Backend Geolocation API]
  ↓
[MongoDB Geospatial Query]
  ↓
[Marker Render]
```

---

## 6. Güvenlik Mimarisi

### 6.1 Kimlik Doğrulama Flow

```
[Login Request]
  ↓
[Email/Şifre Doğrula]
  ↓
[JWT Token Oluştur]
  ↓
[Refresh Token Kaydet]
  ↓
[Client'a Token Gönder]
  ↓
[Subsequent Requests - Authorization Header]
```

### 6.2 HTTPS & Encryption

```
Client ←─────── HTTPS/TLS 1.2+ ───────→ Server
  ↓
Sensitive Data (şifre, ödeme) bcrypt/AES-256 ile şifrele
```

### 6.3 Rate Limiting

```
[Request] → [Check Rate Limit] → [Allowed/Blocked]
Max: 100 requests/minute/IP
```

---

## 7. Caching Stratejisi

### 7.1 Redis Cache

```
Session Cache: JWT tokens
TTL: 24 hours

Query Cache: Business listings, Toilet details
TTL: 1 hour

User Profile Cache
TTL: 30 minutes
```

### 7.2 Client-side Cache

```
HTTP Cache Headers:
- Cache-Control: max-age=3600
- ETag support
- Local Storage: Session tokens
```

---

## 8. Error Handling Mimarisi

### 8.1 Error Hierarchy

```
Error
├── ValidationError (400)
├── AuthenticationError (401)
├── AuthorizationError (403)
├── NotFoundError (404)
├── ConflictError (409)
├── InternalServerError (500)
└── ExternalServiceError (502/503)
```

### 8.2 Error Response Format

```json
{
  "error": true,
  "code": "ERR_CODE",
  "message": "User friendly message",
  "details": "Technical details",
  "timestamp": "2025-09-22T10:30:00Z"
}
```

---

## 9. Logging & Monitoring

### 9.1 Logging Levels

```
ERROR → Kritik hata
WARN → Uyarı (deprecated API)
INFO → Normal operasyon
DEBUG → Geliştirici bilgisi
```

### 9.2 Monitoring Metrikleri

```
- API response times
- Database query times
- Error rates
- User activity
- Payment success rates
- Server CPU/Memory usage
```

---

## 10. Deployment Mimarisi

### 10.1 CI/CD Pipeline

```
[GitHub Push]
  ↓
[GitHub Actions]
  ↓
[Lint & Unit Tests]
  ↓
[Build Docker Image]
  ↓
[Push to Registry]
  ↓
[Deploy to Production]
  ↓
[Health Checks]
```

### 10.2 Infrastructure as Code (IaC)

```
Docker Compose:
- Frontend Container
- Backend Container
- MongoDB Container
- Redis Container
- Nginx (Reverse Proxy)
```

---

## 11. Ölçeklenebilirlik Stratejisi

### 11.1 Horizontal Scaling

```
[Load Balancer]
  ├── [API Server 1]
  ├── [API Server 2]
  └── [API Server 3]
```

### 11.2 Database Sharding

```
Replica Set:
- Primary (Read/Write)
- Secondary 1 (Read)
- Secondary 2 (Read)
```

---

## 12. Disaster Recovery

### 12.1 Backup Strategy

```
Database:
- Daily full backup
- Hourly incremental backup
- 30 days retention

Code:
- GitHub (version control)
- Automated deployment rollback
```

### 12.2 Business Continuity

```
RTO (Recovery Time Objective): 4 saatler
RPO (Recovery Point Objective): 1 saat
```

---

**Mimari Güncellemeler**: [Değişiklik Geçmişi]
**Son Güncelleme**: Eylül 2025