# 🔗 API URL Yapılandırması

## 📍 Backend URL'leri

### Development (Local)
```
http://localhost:8000
```

### Production (Railway)
Backend'inizi Railway'de deploy ettiyseniz:
```
https://your-app-name.railway.app
```

## ⚙️ Nasıl Ayarlanır?

### Yöntem 1: app.config.js (Önerilen)

`mobile/app.config.js` dosyasında şu satırları güncelleyin:

```javascript
const apiUrls = {
  development: 'http://localhost:8000',  // ← Local için
  staging: 'https://your-staging.railway.app',  // ← Staging (varsa)
  production: 'https://your-production.railway.app',  // ← Railway URL'iniz
};
```

**Örnek:**
```javascript
const apiUrls = {
  development: 'http://localhost:8000',
  staging: 'https://wcfinder-staging.railway.app',
  production: 'https://wcfinder-backend.railway.app',
};
```

### Yöntem 2: .env Dosyası

`mobile/.env` dosyası oluşturun:

```bash
# Development için
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_ENV=development

# Production için (Railway URL'inizi buraya yazın)
# EXPO_PUBLIC_API_URL=https://your-app.railway.app
# EXPO_PUBLIC_ENV=production
```

## 🔄 Nasıl Çalışır?

1. `app.config.js` → `extra.apiUrl` değerini set eder
2. `src/config/api.ts` → `Constants.expoConfig.extra.apiUrl` değerini okur
3. Tüm API çağrıları bu URL'i kullanır

## ✅ Kontrol

Backend URL'inin doğru çalıştığını kontrol edin:

```bash
# Terminal'de test edin
curl http://localhost:8000/api/business

# Veya browser'da açın
http://localhost:8000/api/business
```

Başarılı response alırsanız URL doğru! ✅

## 📝 Önemli Notlar

1. **Development'ta**: `http://localhost:8000` kullanın
2. **Production'da**: Railway URL'inizi kullanın
3. **URL formatı**: `/api` suffix'i otomatik eklenir (gerekirse)
4. **Değişiklik sonrası**: Metro bundler'ı yeniden başlatın (`npm start -- --clear`)

