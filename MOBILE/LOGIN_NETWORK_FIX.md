# 🔧 Login Network Hatası - Çözüm

## ❌ Sorun
```
Network Error
baseURL: "http://localhost:8000/api"
```

**Neden?** Telefonda `localhost:8000` çalışmaz! Telefon kendi localhost'una bakar, bilgisayarın localhost'una değil.

## ✅ Çözüm 1: Railway Backend URL Kullan (Önerilen)

Eğer backend'iniz Railway'de çalışıyorsa:

### Adım 1: app.config.js'i Güncelle

`mobile/app.config.js` dosyasında development URL'ini Railway URL'inizle değiştirin:

```javascript
const apiUrls = {
  development: 'https://your-backend.railway.app',  // ← Railway URL'iniz
  production: 'https://your-backend.railway.app',   // ← Railway URL'iniz
};
```

### Adım 2: Metro Bundler'ı Yeniden Başlat

```bash
cd mobile
# Metro bundler'ı durdurun (Ctrl+C)
npm start -- --clear
```

## ✅ Çözüm 2: Bilgisayarın IP Adresini Kullan (Local Development)

Eğer backend'iniz local'de çalışıyorsa:

### Adım 1: Bilgisayarınızın IP Adresini Bulun

Windows:
```bash
ipconfig
```
"IPv4 Address" satırını bulun (örn: `192.168.1.100`)

### Adım 2: app.config.js'i Güncelle

```javascript
const apiUrls = {
  development: 'http://192.168.1.100:8000',  // ← Bilgisayarınızın IP'si
  production: 'https://your-backend.railway.app',
};
```

### Adım 3: Backend'in Tüm IP'lere Açık Olduğundan Emin Olun

Backend'iniz şu şekilde başlatılmalı:
```bash
# SERVER klasöründe
HOST=0.0.0.0 PORT=8000 npm start
```

Veya `SERVER/.env` dosyasında:
```
HOST=0.0.0.0
PORT=8000
```

### Adım 4: Firewall Kontrolü

Windows Firewall 8000 portunu engelliyor olabilir:
- Windows Settings → Firewall → "Allow an app through firewall"
- Node.js'i bulun ve "Private" işaretleyin

## 🚀 Hızlı Çözüm (Railway Backend Varsa)

1. `mobile/app.config.js` dosyasını açın
2. Development URL'ini Railway URL'inizle değiştirin
3. Metro bundler'ı yeniden başlatın: `npm start -- --clear`

## ✅ Test

1. Uygulamayı yeniden yükleyin (Expo Go'da shake → Reload)
2. Login yapmayı deneyin
3. Console'da artık `localhost` yerine Railway URL'inizi görmelisiniz

## 📝 Notlar

- **Railway Backend:** En kolay çözüm, her zaman çalışır
- **Local IP:** Sadece aynı WiFi'de çalışır
- **localhost:** Sadece emulator'de çalışır, fiziksel cihazda çalışmaz

