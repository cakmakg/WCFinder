# Railway Environment Variables Setup - Detaylı Rehber

## 📍 Nereye Eklenecek?

Railway'de **2 ayrı service** var:
1. **Backend Service** (SERVER klasörü)
2. **Frontend Service** (CLIENT klasörü)

Her birinin kendi **Variables** sekmesi var. Doğru service'te doğru variable'ları eklemelisiniz.

---

## 🔧 Backend Service - Environment Variables

### Nereye Eklenecek?

1. Railway Dashboard → **Backend Service** (SERVER klasörü olan)
2. **"Variables"** sekmesine tıklayın
3. **"New Variable"** butonuna tıklayın

### Backend Variables Listesi

#### 1. MongoDB Connection String

**Name:**
```
MONGODB
```

**Value:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/wcfinderdb?retryWrites=true&w=majority
```

**ÖNEMLİ:**
- `<username>` ve `<password>` kısımlarını MongoDB Atlas'taki gerçek değerlerle değiştirin
- Tırnak işareti (`"`) kullanmayın
- Başında/sonunda boşluk olmamalı

**Örnek:**
```
mongodb+srv://cakmak4834_db_user:cakmak4834@cluster0.mlfz84m.mongodb.net/wcfinderdb?retryWrites=true&w=majority
```

---

#### 2. Server Port

**Name:**
```
PORT
```

**Value:**
```
8000
```

**Not:** Railway otomatik PORT atar, ama belirtmek iyi.

---

#### 3. Node Environment

**Name:**
```
NODE_ENV
```

**Value:**
```
production
```

---

#### 4. Host

**Name:**
```
HOST
```

**Value:**
```
0.0.0.0
```

---

#### 5. JWT Access Key

**Name:**
```
ACCESS_KEY
```

**Value:**
```
your-super-secret-access-key-minimum-32-characters-long-random-string
```

**ÖNEMLİ:**
- Minimum 32 karakter olmalı
- Güçlü, random bir string oluşturun
- Örnek: `aB3$kL9#mN2@pQ7&rT5*wX1!yZ4%vU8`

**Random String Oluşturma:**
```bash
# Linux/Mac
openssl rand -base64 32

# Veya online: https://randomkeygen.com
```

---

#### 6. JWT Refresh Key

**Name:**
```
REFRESH_KEY
```

**Value:**
```
your-super-secret-refresh-key-minimum-32-characters-long-random-string
```

**ÖNEMLİ:**
- ACCESS_KEY'den farklı olmalı
- Minimum 32 karakter

---

#### 7. CORS Origin

**Name:**
```
CORS_ORIGIN
```

**Value:**
```
https://your-frontend-url.railway.app
```

**ÖNEMLİ:**
- Frontend deploy edildikten sonra güncellenecek
- Frontend URL'ini buraya yazın
- Örnek: `https://wcfinder-production.up.railway.app`

---

#### 8. Stripe Secret Key

**Name:**
```
STRIPE_SECRET_KEY
```

**Value:**
```
sk_live_YOUR_STRIPE_SECRET_KEY_HERE
```

**ÖNEMLİ:**
- Stripe Dashboard → API Keys → Secret key
- Production key kullanın (test key değil)

---

#### 9. Stripe Webhook Secret

**Name:**
```
STRIPE_WEBHOOK_SECRET
```

**Value:**
```
whsec_YOUR_STRIPE_WEBHOOK_SECRET_HERE
```

**ÖNEMLİ:**
- Stripe Dashboard → Webhooks → Webhook secret
- Production webhook secret

---

#### 10. PayPal Client ID

**Name:**
```
PAYPAL_CLIENT_ID
```

**Value:**
```
YOUR_PAYPAL_CLIENT_ID_HERE
```

---

#### 11. PayPal Client Secret

**Name:**
```
PAYPAL_CLIENT_SECRET
```

**Value:**
```
YOUR_PAYPAL_CLIENT_SECRET_HERE
```

---

#### 12. Trust Proxy

**Name:**
```
TRUST_PROXY
```

**Value:**
```
true
```

---

## 🎨 Frontend Service - Environment Variables

### Nereye Eklenecek?

1. Railway Dashboard → **Frontend Service** (CLIENT klasörü olan)
2. **"Variables"** sekmesine tıklayın
3. **"New Variable"** butonuna tıklayın

### Frontend Variables Listesi

#### 1. API Base URL

**Name:**
```
VITE_API_BASE_URL
```

**Value:**
```
https://your-backend-url.railway.app/api
```

**ÖNEMLİ:**
- Backend URL'inin sonuna `/api` ekleyin
- Örnek: `https://wcfinder-backend.up.railway.app/api`
- `VITE_` prefix'i zorunlu (build zamanında inject edilir)

---

#### 2. Stripe Publishable Key

**Name:**
```
VITE_STRIPE_PUBLISHABLE_KEY
```

**Value:**
```
pk_live_YOUR_STRIPE_PUBLISHABLE_KEY_HERE
```

**ÖNEMLİ:**
- Stripe Dashboard → API Keys → Publishable key
- Production key (test key değil)
- `VITE_` prefix'i zorunlu

---

#### 3. PayPal Client ID

**Name:**
```
VITE_PAYPAL_CLIENT_ID
```

**Value:**
```
YOUR_PAYPAL_CLIENT_ID_HERE
```

**ÖNEMLİ:**
- `VITE_` prefix'i zorunlu
- Backend'deki ile aynı olabilir

---

## 📝 Railway'de Variable Ekleme Adımları (Görsel)

### Adım 1: Service Seçin

```
Railway Dashboard
  → Your Project
  → Backend Service (veya Frontend Service)
  → "Variables" sekmesi
```

### Adım 2: New Variable Butonuna Tıklayın

```
[Variables] sekmesi
  → Sağ üstte "New Variable" butonu
  → Tıklayın
```

### Adım 3: Name ve Value Girin

```
┌─────────────────────────────────┐
│ Name:                           │
│ [MONGODB                    ]   │
│                                 │
│ Value:                          │
│ [mongodb+srv://user:pass@...]  │
│                                 │
│ [Add] [Cancel]                  │
└─────────────────────────────────┘
```

**ÖNEMLİ:**
- **Name:** Büyük/küçük harf duyarlı, tam olarak yazın
- **Value:** Tırnak işareti kullanmayın, boşluk olmamalı

### Adım 4: Add Butonuna Tıklayın

Variable eklendikten sonra:
- Otomatik olarak kaydedilir
- Service otomatik restart olur (veya yeniden deploy)

---

## ✅ Backend Variables Checklist

Backend service'te şunlar olmalı:

- [ ] `MONGODB` - MongoDB connection string
- [ ] `PORT` - 8000
- [ ] `NODE_ENV` - production
- [ ] `HOST` - 0.0.0.0
- [ ] `ACCESS_KEY` - JWT access secret (32+ karakter)
- [ ] `REFRESH_KEY` - JWT refresh secret (32+ karakter)
- [ ] `CORS_ORIGIN` - Frontend URL (deploy sonrası güncellenecek)
- [ ] `STRIPE_SECRET_KEY` - Stripe production secret
- [ ] `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- [ ] `PAYPAL_CLIENT_ID` - PayPal client ID
- [ ] `PAYPAL_CLIENT_SECRET` - PayPal secret
- [ ] `TRUST_PROXY` - true

---

## ✅ Frontend Variables Checklist

Frontend service'te şunlar olmalı:

- [ ] `VITE_API_BASE_URL` - Backend URL + `/api`
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- [ ] `VITE_PAYPAL_CLIENT_ID` - PayPal client ID

**ÖNEMLİ:** Frontend variable'larında `VITE_` prefix'i zorunlu!

---

## 🔍 Variable Kontrolü

### Railway'de Kontrol

1. Variables sekmesine gidin
2. Variable'ları listeleyin
3. Her birinin doğru olduğundan emin olun

### Logs'da Kontrol

**Backend Logs:**
```
✅ MongoDB bağlantısı başarılı!
🚀 Server running at http://0.0.0.0:8000
```

**Frontend Logs:**
```
Serving!
  - Local:    http://localhost:XXXX
```

---

## 🐛 Yaygın Hatalar

### Hata 1: "Variable not found"

**Neden:** Name yanlış yazılmış (büyük/küçük harf)

**Çözüm:**
- Name'i tam olarak yazın: `MONGODB` (büyük harf)
- `mongodb` değil, `MONGODB` olmalı

### Hata 2: "Invalid connection string"

**Neden:** Value'da tırnak veya boşluk var

**Çözüm:**
- Tırnak işareti kullanmayın
- Başında/sonunda boşluk olmamalı

### Hata 3: "VITE_ variable not working"

**Neden:** `VITE_` prefix'i eksik veya variable değişikliği sonrası rebuild yapılmamış

**Çözüm:**
- `VITE_` prefix'i ekleyin
- Variable değişikliği sonrası service'i yeniden deploy edin

---

## 📊 Örnek: Tam Variable Listesi

### Backend Service Variables

```
MONGODB=mongodb+srv://user:pass@cluster.mongodb.net/db?retryWrites=true&w=majority
PORT=8000
NODE_ENV=production
HOST=0.0.0.0
ACCESS_KEY=aB3$kL9#mN2@pQ7&rT5*wX1!yZ4%vU8
REFRESH_KEY=xY9@wV6#uT3$rQ0&pO7*nM4!lK1%jH8
CORS_ORIGIN=https://wcfinder-production.up.railway.app
STRIPE_SECRET_KEY=sk_live_51AbC123...
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef
PAYPAL_CLIENT_ID=AbCdEfGhIjKlMnOpQrStUvWxYz
PAYPAL_CLIENT_SECRET=1234567890abcdefghijklmnopqrstuv
TRUST_PROXY=true
```

### Frontend Service Variables

```
VITE_API_BASE_URL=https://wcfinder-backend.up.railway.app/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51AbC123...
VITE_PAYPAL_CLIENT_ID=AbCdEfGhIjKlMnOpQrStUvWxYz
```

---

## 🎯 Özet

**Nereye Eklenecek?**
- Backend variables → Backend Service → Variables
- Frontend variables → Frontend Service → Variables

**Name Nedir?**
- Variable'ın adı (örn: `MONGODB`, `VITE_API_BASE_URL`)
- Büyük/küçük harf duyarlı

**Value Nedir?**
- Variable'ın değeri (örn: connection string, URL, key)
- Tırnak kullanmayın, boşluk olmamalı

**Nasıl Eklenecek?**
1. Service → Variables → New Variable
2. Name ve Value gir
3. Add

---

**Son Güncelleme**: Aralık 2024

