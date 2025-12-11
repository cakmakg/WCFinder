# 🔧 Railway Backend Düzeltme Rehberi

## ❌ Hata
```
JWT_SECRET is required but not set
```

## ✅ Çözüm: Railway'de Environment Variables Ekleme

### Adım 1: Railway Dashboard'a Gidin

1. [Railway.app](https://railway.app) → Projenize gidin
2. Backend servisinize tıklayın
3. **"Variables"** sekmesine gidin

### Adım 2: Gerekli Environment Variables'ları Ekleyin

Railway'de **"New Variable"** butonuna tıklayıp aşağıdakileri ekleyin:

#### 🔴 KRİTİK (Mutlaka Gerekli)

```env
# 1. MongoDB Connection String
MONGODB=mongodb+srv://username:password@cluster.mongodb.net/wcfinder?retryWrites=true&w=majority

# 2. JWT Secrets (en az 32 karakter)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
ACCESS_KEY=your-super-secret-access-key-minimum-32-characters-long
REFRESH_KEY=your-super-secret-refresh-key-minimum-32-characters-long

# 3. Environment
NODE_ENV=production
HOST=0.0.0.0
PORT=8000
```

#### 🟡 Production İçin Gerekli

```env
# 4. CORS (Frontend URL'iniz)
CORS_ORIGIN=https://your-frontend-url.railway.app

# 5. Stripe (Production keys)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# 6. PayPal (Production credentials)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# 7. Trust Proxy
TRUST_PROXY=true
```

## 🔑 JWT Secret Oluşturma

Güvenli bir JWT secret oluşturmak için:

### Yöntem 1: Node.js ile
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Yöntem 2: Online Tool
- [RandomKeygen](https://randomkeygen.com/) → "CodeIgniter Encryption Keys" kullanın
- En az 32 karakter seçin

### Yöntem 3: Manuel
En az 32 karakter uzunluğunda rastgele bir string oluşturun:
```
my-super-secret-jwt-key-2024-production-min-32-chars
```

## 📝 Örnek Railway Variables

Railway dashboard'da şöyle görünmeli:

| Variable Name | Value |
|--------------|-------|
| `MONGODB` | `mongodb+srv://user:pass@cluster.mongodb.net/wcfinder?...` |
| `JWT_SECRET` | `your-32-char-secret-key-here` |
| `ACCESS_KEY` | `your-32-char-access-key-here` |
| `REFRESH_KEY` | `your-32-char-refresh-key-here` |
| `NODE_ENV` | `production` |
| `HOST` | `0.0.0.0` |
| `PORT` | `8000` |
| `CORS_ORIGIN` | `https://your-frontend.railway.app` |

## ⚠️ Önemli Notlar

1. **MONGODB Connection String:**
   - MongoDB Atlas'tan alın
   - `<username>` ve `<password>` kısımlarını gerçek değerlerle değiştirin
   - Tırnak işareti (`"`) kullanmayın

2. **JWT Secrets:**
   - En az 32 karakter olmalı
   - Güvenli ve rastgele olmalı
   - Production'da farklı değerler kullanın

3. **CORS_ORIGIN:**
   - Frontend URL'inizi yazın
   - Wildcard (`*`) kullanmayın (güvenlik riski)

4. **Değişiklik Sonrası:**
   - Railway otomatik olarak yeniden deploy eder
   - Logları kontrol edin

## ✅ Kontrol

Deployment başarılı olduktan sonra:

```bash
# Health check
curl https://your-backend-url.railway.app/

# API test
curl https://your-backend-url.railway.app/api/business
```

Başarılı response alırsanız backend çalışıyor! ✅

## 🚨 Hala Çalışmıyorsa

1. Railway Logs'u kontrol edin
2. Tüm environment variable'ların doğru eklendiğinden emin olun
3. MongoDB connection string'in doğru olduğunu kontrol edin
4. JWT secrets'ın en az 32 karakter olduğunu kontrol edin

