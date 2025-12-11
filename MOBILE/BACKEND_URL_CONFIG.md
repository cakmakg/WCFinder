# 🔗 Backend URL Yapılandırması

## 📍 Backend URL'leri

### Development (Local)
```
http://localhost:8000
```

### Production (Railway)
Backend'inizi Railway'de deploy ettiyseniz, Railway size bir URL verir:
```
https://your-app-name.railway.app
```

## ⚙️ Yapılandırma

### Yöntem 1: app.config.js (Önerilen)

`mobile/app.config.js` dosyasını düzenleyin:

```javascript
export default ({ config }) => {
  const env = process.env.EXPO_PUBLIC_ENV || 'development';
  
  const apiUrls = {
    development: 'http://localhost:8000',  // ← Local development
    staging: 'https://your-staging.railway.app',  // ← Staging (varsa)
    production: 'https://your-production.railway.app',  // ← Production Railway URL
  };

  const apiUrl = apiUrls[env] || apiUrls.development;

  return {
    ...config,
    extra: {
      apiUrl,  // ← Bu URL kullanılacak
      env,
    },
  };
};
```

### Yöntem 2: .env Dosyası

`mobile/.env` dosyası oluşturun:

```bash
# Development
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_ENV=development

# Production (Railway URL'inizi buraya yazın)
# EXPO_PUBLIC_API_URL=https://your-app.railway.app
# EXPO_PUBLIC_ENV=production
```

## 🔍 Backend URL'inizi Nasıl Bulursunuz?

### Railway'de Deploy Edildiyse:

1. Railway dashboard'a gidin
2. Backend servisinize tıklayın
3. "Settings" → "Domains" bölümüne bakın
4. Veya "Deployments" → En son deployment'ın URL'ine bakın

Örnek Railway URL formatı:
```
https://wcfinder-backend-production.up.railway.app
```

### Local Development:

Backend'i local'de çalıştırıyorsanız:
```bash
cd SERVER
npm start
# Server http://localhost:8000 adresinde çalışacak
```

## ✅ Kontrol

Backend URL'inin doğru çalıştığını kontrol edin:

```bash
# Terminal'de test edin
curl http://localhost:8000/api/business

# Veya browser'da açın
http://localhost:8000/api/business
```

Başarılı response alırsanız URL doğru! ✅

## 🚨 Önemli Notlar

1. **Development'ta**: `http://localhost:8000` kullanın
2. **Production'da**: Railway URL'inizi kullanın
3. **CORS**: Backend'de CORS ayarlarının mobil uygulama için açık olduğundan emin olun
4. **HTTPS**: Production'da mutlaka HTTPS kullanın

## 📝 Örnek Yapılandırma

### Development (.env)
```
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_ENV=development
```

### Production (.env)
```
EXPO_PUBLIC_API_URL=https://wcfinder-backend-production.up.railway.app
EXPO_PUBLIC_ENV=production
```

