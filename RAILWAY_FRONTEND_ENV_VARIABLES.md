# Railway Frontend Environment Variables - Düzeltilmiş Liste

## ✅ Doğru Environment Variables

Railway Frontend Service'in Variables sekmesinde şu değişkenler olmalı:

```env
# Backend API URL (trailing slash OLMAMALI)
VITE_BASE_URL=https://wcfinder-production.up.railway.app

# Stripe Payment (Production veya Test Key)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SHC5lLM6OjXoMNC03BHFxohclZLSusTp2l7tTk4fh834wewqdhoRQfLCNU3ocCnACiVrcN5I7pIblLG3x2Zu7bP00DptTbgNP

# PayPal Payment (Client ID - EKSİK!)
VITE_PAYPAL_CLIENT_ID=your-paypal-client-id-here

# API Base URL (SEO için - Opsiyonel ama önerilen)
VITE_API_BASE_URL=https://wcfinder-production.up.railway.app/api
```

## ❌ SİLİNMESİ GEREKENLER (Firebase - Bu projede kullanılmıyor)

```env
# Bu değişkenler SİLİNMELİ:
VITE_apiKey="AIzaSyB2ELZGgLAEtkkR4wuXyzY6xyczsAmec-A"
VITE_appId="1:549598544559:web:d1c54c30d2b368356e8a5a"
VITE_authDomain="movie-app-1e3b9.firebaseapp.com"
VITE_projectId="movie-app-1e3b9"
VITE_storageBucket="movie-app-1e3b9.firebasestorage.app"
```

## 🔧 Railway'de Yapılacaklar

### 1. Gereksiz Firebase Değişkenlerini Sil

Railway Dashboard → Frontend Service → Variables sekmesinde:
- `VITE_apiKey` → **SİL**
- `VITE_appId` → **SİL**
- `VITE_authDomain` → **SİL**
- `VITE_projectId` → **SİL**
- `VITE_storageBucket` → **SİL**

### 2. Eksik Değişkenleri Ekle

**VITE_PAYPAL_CLIENT_ID** ekleyin:
1. PayPal Developer Dashboard'dan Client ID'yi alın
2. Railway → Frontend Service → Variables → Add Variable
3. Key: `VITE_PAYPAL_CLIENT_ID`
4. Value: PayPal Client ID'niz (örn: `AeA1QIZXiflr1_-...`)

**VITE_API_BASE_URL** ekleyin (Opsiyonel ama önerilen):
1. Railway → Frontend Service → Variables → Add Variable
2. Key: `VITE_API_BASE_URL`
3. Value: `https://wcfinder-production.up.railway.app/api`

### 3. Tırnak İşareti Kontrolü

⚠️ **ÖNEMLİ**: Railway'de environment variable değerlerinde **tırnak işareti kullanmayın**!

**YANLIŞ:**
```
VITE_BASE_URL="https://wcfinder-production.up.railway.app"
```

**DOĞRU:**
```
VITE_BASE_URL=https://wcfinder-production.up.railway.app
```

Railway otomatik olarak string olarak işler, tırnak işareti eklemeyin.

## 📋 Final Environment Variables Listesi

Railway Frontend Service'te şu değişkenler olmalı:

| Key | Value | Durum |
|-----|-------|-------|
| `VITE_BASE_URL` | `https://wcfinder-production.up.railway.app` | ✅ VAR |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_51SHC5l...` | ✅ VAR |
| `VITE_PAYPAL_CLIENT_ID` | PayPal Client ID | ❌ EKSİK - EKLE |
| `VITE_API_BASE_URL` | `https://wcfinder-production.up.railway.app/api` | ⚠️ Opsiyonel - Önerilen |

## 🔍 Kontrol

Değişikliklerden sonra:
1. Frontend service'i **redeploy** edin
2. Browser console'da kontrol edin:
   ```javascript
   console.log('VITE_BASE_URL:', import.meta.env.VITE_BASE_URL);
   console.log('VITE_STRIPE_PUBLISHABLE_KEY:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'SET' : 'MISSING');
   console.log('VITE_PAYPAL_CLIENT_ID:', import.meta.env.VITE_PAYPAL_CLIENT_ID ? 'SET' : 'MISSING');
   ```

## ⚠️ Önemli Notlar

1. **Tırnak İşareti**: Railway'de environment variable değerlerinde tırnak işareti kullanmayın
2. **Trailing Slash**: `VITE_BASE_URL`'de sonunda `/` olmamalı
3. **Rebuild Gerekli**: Environment variable değişikliklerinden sonra frontend'i yeniden build etmeniz gerekir
4. **PayPal Key Format**: PayPal Client ID `A` ile başlamalı ve en az 20 karakter olmalı

