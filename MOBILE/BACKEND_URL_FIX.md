# 🔧 Backend URL Düzeltmesi - Çözüm

## ❌ Sorun

Mobil uygulama yanlış backend URL'ine istek atıyor:

**Mobil uygulama:**
```
https://wcfinder-backend.railway.app/api/auth/login → 404 Not Found
```

**Web uygulaması (çalışıyor):**
```
https://wcfinder-production.up.railway.app/api/auth/login → ✅ Çalışıyor
```

## ✅ Çözüm: Backend URL'ini Güncelle

Mobil uygulamadaki backend URL'ini web uygulaması ile aynı yapın.

### Adım 1: app.config.js Güncelle

`mobile/app.config.js` dosyasında backend URL'ini güncelledim:

```javascript
const apiUrls = {
  development: 'https://wcfinder-production.up.railway.app',  // ← Web ile aynı
  production: 'https://wcfinder-production.up.railway.app',     // ← Web ile aynı
};
```

### Adım 2: Metro Bundler'ı Yeniden Başlat

```bash
cd mobile
# Metro bundler'ı durdurun (Ctrl+C)
npm start -- --clear
```

### Adım 3: Uygulamayı Yeniden Yükleyin

- Expo Go'da telefonu sallayın (shake gesture)
- "Reload" seçin
- VEYA QR kodu tekrar tarayın

## 🔍 Kontrol

Login yaptıktan sonra console'da şu URL'i görmelisiniz:

```
baseURL: "https://wcfinder-production.up.railway.app/api"
fullURL: "https://wcfinder-production.up.railway.app/api/auth/login"
```

Artık 404 hatası almamalısınız! ✅

## 📝 Notlar

1. **Web ve mobil aynı backend'i kullanmalı** - Farklı backend'ler kullanmayın
2. **URL formatı:** `https://wcfinder-production.up.railway.app` (sonunda `/api` yok)
3. **API path:** `/api` otomatik ekleniyor (`api.ts` dosyasında)

## ✅ Test

1. Metro bundler'ı yeniden başlatın
2. Uygulamayı yeniden yükleyin
3. Login yapmayı deneyin
4. Artık çalışmalı! ✅

