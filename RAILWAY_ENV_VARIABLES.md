# 🔧 Railway Backend Environment Variables

## ❌ Hata
```
JWT_SECRET is required but not set
```

## ✅ Çözüm: Railway'de Environment Variables Ekleme

### Adım 1: Railway Dashboard

1. [Railway.app](https://railway.app) → Projenize gidin
2. **Backend servisinize** tıklayın
3. **"Variables"** sekmesine gidin
4. **"New Variable"** butonuna tıklayın

### Adım 2: Gerekli Variables'ları Ekleyin

Aşağıdaki environment variable'ları **sırayla** ekleyin:

#### 🔴 KRİTİK (Mutlaka Gerekli - Backend Çalışmaz)

```env
# 1. MongoDB Connection String
MONGODB=mongodb+srv://username:password@cluster.mongodb.net/wcfinder?retryWrites=true&w=majority

# 2. JWT Secrets (en az 32 karakter her biri)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-here
ACCESS_KEY=your-super-secret-access-key-minimum-32-characters-long-here
REFRESH_KEY=your-super-secret-refresh-key-minimum-32-characters-long-here

# 3. Environment Settings
NODE_ENV=production
HOST=0.0.0.0
PORT=8000
```

#### 🟡 Production İçin Gerekli

```env
# 4. CORS (Frontend URL'iniz - mobil uygulama için gerekli değil ama ekleyin)
CORS_ORIGIN=https://your-frontend-url.railway.app

# 5. Stripe (Production keys - ödeme için)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# 6. PayPal (Production credentials - ödeme için)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# 7. Trust Proxy
TRUST_PROXY=true
```

## 🔑 JWT Secret Oluşturma

Güvenli bir JWT secret oluşturmak için (en az 32 karakter):

### Yöntem 1: Node.js ile (Önerilen)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Bu komut 64 karakterlik güvenli bir string üretir.

### Yöntem 2: Online Tool
- [RandomKeygen](https://randomkeygen.com/) → "CodeIgniter Encryption Keys" kullanın
- En az 32 karakter seçin

### Yöntem 3: Manuel
En az 32 karakter uzunluğunda rastgele bir string:
```
my-super-secret-jwt-key-2024-production-min-32-chars
```

## 📝 Railway'de Nasıl Eklenir?

### Örnek: JWT_SECRET Ekleme

1. Railway Dashboard → Backend Service → Variables
2. **"New Variable"** tıklayın
3. **Name**: `JWT_SECRET`
4. **Value**: `your-64-char-hex-string-from-node-command`
5. **Save** tıklayın

Aynı şekilde `ACCESS_KEY` ve `REFRESH_KEY` için de tekrarlayın.

## ✅ Minimum Gerekli Variables (Backend Çalışması İçin)

Railway'de en az şunlar olmalı:

| Variable Name | Örnek Value | Açıklama |
|--------------|-------------|----------|
| `MONGODB` | `mongodb+srv://...` | MongoDB connection string |
| `JWT_SECRET` | `64-char-hex-string` | JWT secret (en az 32 char) |
| `ACCESS_KEY` | `64-char-hex-string` | Access token secret (en az 32 char) |
| `REFRESH_KEY` | `64-char-hex-string` | Refresh token secret (en az 32 char) |
| `NODE_ENV` | `production` | Environment |
| `HOST` | `0.0.0.0` | Host |
| `PORT` | `8000` | Port (Railway otomatik atar ama belirtin) |

## 🚀 Hızlı Kurulum Script

Terminal'de çalıştırın (JWT secret'ları oluşturur):

```bash
# JWT_SECRET oluştur
echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"

# ACCESS_KEY oluştur
echo "ACCESS_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"

# REFRESH_KEY oluştur
echo "REFRESH_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
```

Çıktıları kopyalayıp Railway'e ekleyin.

## ⚠️ Önemli Notlar

1. **MONGODB Connection String:**
   - MongoDB Atlas'tan alın
   - `<username>` ve `<password>` kısımlarını gerçek değerlerle değiştirin
   - Tırnak işareti (`"`) kullanmayın

2. **JWT Secrets:**
   - Her biri en az 32 karakter olmalı
   - Farklı değerler kullanın (JWT_SECRET, ACCESS_KEY, REFRESH_KEY farklı olmalı)
   - Güvenli ve rastgele olmalı

3. **Değişiklik Sonrası:**
   - Railway otomatik olarak yeniden deploy eder
   - "Deployments" sekmesinden logları kontrol edin

## ✅ Kontrol

Deployment başarılı olduktan sonra:

```bash
# Health check
curl https://your-backend-url.railway.app/

# API test
curl https://your-backend-url.railway.app/api/business
```

Başarılı response alırsanız backend çalışıyor! ✅

## 🔍 Hata Devam Ederse

1. Railway Logs'u kontrol edin (Deployments → Logs)
2. Tüm variable'ların doğru eklendiğinden emin olun
3. Variable isimlerinin büyük/küçük harf duyarlı olduğunu unutmayın
4. JWT secrets'ın en az 32 karakter olduğunu kontrol edin

