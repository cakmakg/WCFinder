# Railway 502 Hatası Çözümü

## 🚨 Hata: 502 Bad Gateway

502 hatası, Railway'de frontend service'inin çalışmadığını veya yanlış yapılandırıldığını gösterir.

**Hata Mesajı:**
```
"connection refused"
"upstreamErrors": [{"error":"connection refused"}]
```

---

## ✅ Çözüm Adımları

### 1. Railway'de Frontend Service Ayarlarını Kontrol Edin

1. Railway Dashboard → Frontend Service → Settings
2. **Root Directory** kontrol edin:
   - ✅ `CLIENT` olmalı
   - ❌ Boş veya yanlış klasör olmamalı

3. **Build Command** kontrol edin:
   - ✅ `npm install && npm run build`
   - ❌ Farklı bir komut olmamalı

4. **Start Command** kontrol edin:
   - ✅ `npm start` (güncellenmiş)
   - ❌ Eski: `npx serve -s dist -l $PORT` (çalışmayabilir)

### 2. Package.json Start Script Kontrolü

`CLIENT/package.json` dosyasında `start` script'i olmalı:

```json
{
  "scripts": {
    "start": "serve -s dist -l ${PORT:-3000}"
  }
}
```

### 3. Serve Paketi Kontrolü

`CLIENT/package.json` dosyasında `serve` paketi **dependencies**'de olmalı:

```json
{
  "dependencies": {
    "serve": "^14.2.1"
  }
}
```

### 4. Build Klasörü Kontrolü

Railway Logs'da build'in başarılı olduğundan emin olun:

```
✓ built in X.XXs
```

`dist/` klasörü oluşmalı.

### 5. Railway Service'i Yeniden Deploy Edin

1. Railway Dashboard → Frontend Service
2. "Deployments" sekmesine gidin
3. "Redeploy" butonuna tıklayın

Veya:
- Settings'te bir değişiklik yapın (örneğin Start Command'ı tekrar kaydedin)
- Otomatik olarak yeniden deploy olur

---

## 🔍 Debug Adımları

### 1. Railway Logs Kontrolü

Railway Dashboard → Frontend Service → Logs

**Arayın:**
- ✅ `✓ built in X.XXs` (build başarılı)
- ✅ `Serving!` veya `Listening on port XXXX` (serve çalışıyor)
- ❌ `Error: Cannot find module 'serve'` (serve paketi eksik)
- ❌ `Error: ENOENT: no such file or directory, stat 'dist'` (dist klasörü yok)

### 2. Build Logs Kontrolü

Build sırasında şunları arayın:

```
✓ built in X.XXs
dist/index.html
dist/assets/...
```

### 3. Start Command Logs Kontrolü

Start command çalıştığında şunu görmelisiniz:

```
Serving!
  - Local:    http://localhost:XXXX
  - Network:  http://0.0.0.0:XXXX
```

---

## 🐛 Yaygın Hatalar ve Çözümleri

### Hata 1: "Cannot find module 'serve'"

**Neden:** `serve` paketi dependencies'de değil veya build sırasında yüklenmemiş

**Çözüm:**
1. `CLIENT/package.json`'da `serve` paketinin `dependencies`'de olduğundan emin olun
2. Railway'de yeniden deploy edin

### Hata 2: "ENOENT: no such file or directory, stat 'dist'"

**Neden:** Build başarısız olmuş veya `dist` klasörü oluşmamış

**Çözüm:**
1. Build logs'u kontrol edin
2. Build hatalarını düzeltin
3. Yeniden deploy edin

### Hata 3: "Port already in use"

**Neden:** PORT environment variable yanlış veya çakışma var

**Çözüm:**
1. Railway otomatik olarak PORT atar, manuel ayarlamayın
2. Start command'da `${PORT:-3000}` kullanın (fallback)

### Hata 4: "Connection refused"

**Neden:** Service çalışmıyor veya yanlış port'ta dinliyor

**Çözüm:**
1. Start command'ı kontrol edin (`npm start`)
2. Logs'da "Serving!" mesajını arayın
3. Service'i restart edin

---

## ✅ Doğru Yapılandırma

### CLIENT/package.json

```json
{
  "scripts": {
    "start": "serve -s dist -l ${PORT:-3000}"
  },
  "dependencies": {
    "serve": "^14.2.1"
  }
}
```

### CLIENT/railway.json

```json
{
  "build": {
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm start"
  }
}
```

### Railway Settings

- **Root Directory:** `CLIENT`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

---

## 🧪 Test

Deploy sonrası:

1. Railway Logs'da şunu arayın:
   ```
   Serving!
   ```

2. Tarayıcıda URL'i açın:
   ```
   https://your-frontend-url.railway.app
   ```

3. 200 OK yanıtı almalısınız (502 değil)

---

## 📝 Checklist

- [ ] `CLIENT/package.json`'da `start` script var
- [ ] `serve` paketi `dependencies`'de
- [ ] `CLIENT/railway.json` doğru yapılandırılmış
- [ ] Railway'de Root Directory: `CLIENT`
- [ ] Railway'de Start Command: `npm start`
- [ ] Build başarılı (logs'da görünüyor)
- [ ] Service çalışıyor (logs'da "Serving!" görünüyor)
- [ ] 502 hatası çözüldü

---

**Son Güncelleme**: Aralık 2024

