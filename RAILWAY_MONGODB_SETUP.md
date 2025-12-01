# Railway MongoDB Connection String Setup

## 🚨 Hata: "Invalid scheme, expected connection string to start with mongodb:// or mongodb+srv://"

Bu hata, Railway'de `MONGODB` environment variable'ının eksik veya yanlış formatlandığını gösterir.

---

## ✅ Çözüm Adımları

### 1. MongoDB Atlas Connection String Alın

1. [MongoDB Atlas](https://cloud.mongodb.com) hesabınıza gidin
2. "Connect" butonuna tıklayın
3. "Connect your application" seçin
4. Connection string'i kopyalayın

**Format:**
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<database>?retryWrites=true&w=majority
```

### 2. Railway'de Environment Variable Ekleyin

1. Railway dashboard'a gidin
2. Backend service'inize tıklayın
3. "Variables" sekmesine gidin
4. "New Variable" butonuna tıklayın
5. Şu bilgileri girin:

   **Variable Name:**
   ```
   MONGODB
   ```

   **Variable Value:**
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/wcfinder?retryWrites=true&w=majority
   ```

   **ÖNEMLİ:** 
   - `<username>` ve `<password>` kısımlarını gerçek değerlerle değiştirin
   - `<database>` kısmını `wcfinder` olarak değiştirin (veya istediğiniz database adı)
   - Tırnak işareti (`"`) kullanmayın!

6. "Add" butonuna tıklayın

### 3. MongoDB Atlas Network Access Ayarları

Railway'in IP adreslerine erişim izni verin:

1. MongoDB Atlas dashboard'da "Network Access" sekmesine gidin
2. "Add IP Address" butonuna tıklayın
3. "Allow Access from Anywhere" seçin (veya `0.0.0.0/0` girin)
4. "Confirm" butonuna tıklayın

**Not:** Production için daha güvenli olması için Railway'in IP aralığını öğrenip sadece onu ekleyebilirsiniz, ama başlangıç için `0.0.0.0/0` yeterli.

### 4. Railway Service'i Yeniden Deploy Edin

1. Railway dashboard'da service'inize gidin
2. "Deployments" sekmesine gidin
3. "Redeploy" butonuna tıklayın

Veya otomatik olarak environment variable değişikliği sonrası yeniden deploy olur.

---

## 🔍 Doğrulama

### 1. Railway Logs Kontrolü

Railway dashboard'da "Logs" sekmesine gidin ve şu mesajı arayın:

```
✅ MongoDB bağlantısı başarılı!
📊 Database: wcfinder
```

### 2. Test Endpoint

Backend URL'inize istek atın:

```bash
curl https://your-backend-url.railway.app/
```

Başarılı yanıt almalısınız.

---

## 🐛 Yaygın Hatalar ve Çözümleri

### Hata 1: "Invalid scheme"

**Neden:** Connection string yanlış format veya eksik

**Çözüm:**
- `MONGODB` variable'ının değerini kontrol edin
- `mongodb+srv://` veya `mongodb://` ile başladığından emin olun
- Tırnak işareti kullanmayın

### Hata 2: "Authentication failed"

**Neden:** Username veya password yanlış

**Çözüm:**
- MongoDB Atlas'ta Database User oluşturduğunuzdan emin olun
- Username ve password'ü doğru yazdığınızdan emin olun
- Özel karakterler varsa URL encode edin (örn: `@` → `%40`)

### Hata 3: "Connection timeout"

**Neden:** Network Access ayarları yanlış

**Çözüm:**
- MongoDB Atlas Network Access'te `0.0.0.0/0` ekleyin
- Veya Railway'in IP adreslerini ekleyin

### Hata 4: "Database name not found"

**Neden:** Database adı yanlış veya yok

**Çözüm:**
- Connection string'deki database adını kontrol edin
- MongoDB Atlas'ta database'in var olduğundan emin olun
- İlk bağlantıda database otomatik oluşturulur, ama adı doğru olmalı

---

## 📝 Örnek Connection String Formatları

### MongoDB Atlas (Recommended)
```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/wcfinder?retryWrites=true&w=majority
```

### Local MongoDB (Development)
```
mongodb://localhost:27017/wcfinder
```

### MongoDB Atlas (with options)
```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/wcfinder?retryWrites=true&w=majority&appName=WCFinder
```

---

## 🔐 Güvenlik Notları

1. **Password'de Özel Karakterler:**
   - Eğer password'ünüzde `@`, `#`, `%` gibi karakterler varsa URL encode edin
   - Örnek: `p@ssw0rd` → `p%40ssw0rd`

2. **Environment Variable Güvenliği:**
   - Railway'de environment variable'lar şifrelenmiş olarak saklanır
   - Logs'larda görünmez (güvenli)

3. **Database User:**
   - Production için sadece gerekli yetkilere sahip bir user oluşturun
   - Admin user kullanmayın

---

## ✅ Checklist

- [ ] MongoDB Atlas cluster oluşturuldu
- [ ] Database user oluşturuldu (username/password)
- [ ] Network Access ayarlandı (`0.0.0.0/0`)
- [ ] Connection string kopyalandı
- [ ] Railway'de `MONGODB` variable eklendi
- [ ] Connection string doğru format (`mongodb+srv://...`)
- [ ] Username ve password doğru
- [ ] Database adı doğru (`wcfinder`)
- [ ] Service yeniden deploy edildi
- [ ] Logs'da "MongoDB bağlantısı başarılı!" mesajı görünüyor

---

**Son Güncelleme**: Aralık 2024

