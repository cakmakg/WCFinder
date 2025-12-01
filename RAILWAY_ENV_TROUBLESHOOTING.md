# Railway Environment Variable Troubleshooting

## 🚨 Hata: "Geçersiz connection string formatı"

Bu hata, MongoDB connection string'inin başında/sonunda boşluk veya yanlış format olduğunu gösterir.

---

## ✅ Çözüm

### 1. Railway'de Environment Variable Kontrolü

1. Railway Dashboard → Backend Service → Variables
2. `MONGODB` variable'ını bulun
3. "Edit" butonuna tıklayın
4. **Değeri kontrol edin:**

   **❌ YANLIŞ:**
   ```
   "mongodb+srv://user:pass@cluster.mongodb.net/db"
   ```
   (Tırnak işareti var)

   **❌ YANLIŞ:**
   ```
      mongodb+srv://user:pass@cluster.mongodb.net/db
   ```
   (Başında boşluk var)

   **✅ DOĞRU:**
   ```
   mongodb+srv://user:pass@cluster.mongodb.net/db
   ```
   (Temiz, tırnak yok, boşluk yok)

5. Eğer tırnak veya boşluk varsa, kaldırın
6. "Save" butonuna tıklayın

### 2. Local .env Dosyası Kontrolü

Eğer local'de test ediyorsanız, `SERVER/.env` dosyasını kontrol edin:

```bash
# SERVER/.env dosyasını açın
# MONGODB satırını kontrol edin
```

**❌ YANLIŞ:**
```env
MONGODB="mongodb+srv://user:pass@cluster.mongodb.net/db"
MONGODB=  mongodb+srv://user:pass@cluster.mongodb.net/db
MONGODB=mongodb+srv://user:pass@cluster.mongodb.net/db  
```

**✅ DOĞRU:**
```env
MONGODB=mongodb+srv://user:pass@cluster.mongodb.net/db
```

**Önemli:**
- `.env` dosyasında tırnak işareti (`"`) kullanmayın
- `=` işaretinden sonra boşluk olmamalı
- Satır sonunda boşluk olmamalı

### 3. Debug: Connection String'i Kontrol Et

Kod artık otomatik olarak trim() yapıyor, ama yine de kontrol edin:

```javascript
// Geçici olarak index.js'e ekleyin (test için)
console.log('MONGODB value:', JSON.stringify(process.env.MONGODB));
console.log('First char code:', process.env.MONGODB?.charCodeAt(0));
```

---

## 🔍 Yaygın Hatalar

### Hata 1: Tırnak İşareti

**Sorun:**
```env
MONGODB="mongodb+srv://..."
```

**Çözüm:**
```env
MONGODB=mongodb+srv://...
```

### Hata 2: Başında/Sonunda Boşluk

**Sorun:**
```env
MONGODB=  mongodb+srv://...
MONGODB=mongodb+srv://...  
```

**Çözüm:**
```env
MONGODB=mongodb+srv://...
```

### Hata 3: Copy-Paste Hatası

**Sorun:** MongoDB Atlas'tan kopyalarken ekstra karakterler

**Çözüm:**
1. Connection string'i temiz bir text editor'e yapıştırın
2. Tırnak, boşluk, satır sonu karakterlerini kontrol edin
3. Sadece connection string'i kopyalayın

---

## ✅ Doğru Format Örnekleri

### MongoDB Atlas
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/wcfinder?retryWrites=true&w=majority
```

### Local MongoDB
```
mongodb://localhost:27017/wcfinder
```

### Özel Karakterler İçin URL Encoding

Eğer password'ünüzde özel karakterler varsa:

**Örnek:** Password: `p@ss#w0rd`

**Yanlış:**
```
mongodb+srv://user:p@ss#w0rd@cluster.mongodb.net/db
```

**Doğru (URL Encoded):**
```
mongodb+srv://user:p%40ss%23w0rd@cluster.mongodb.net/db
```

**URL Encoding Tablosu:**
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`
- `?` → `%3F`

---

## 🧪 Test

Connection string'i test etmek için:

```bash
# SERVER klasöründe
node -e "console.log(process.env.MONGODB?.trim().startsWith('mongodb'))"
```

Veya:

```bash
# .env dosyasını yükleyip test edin
cd SERVER
node -e "require('dotenv').config(); console.log('MONGODB:', process.env.MONGODB?.trim());"
```

---

## 📝 Checklist

- [ ] Railway'de `MONGODB` variable'ı var
- [ ] Connection string tırnak içinde değil
- [ ] Başında/sonunda boşluk yok
- [ ] `mongodb://` veya `mongodb+srv://` ile başlıyor
- [ ] Username ve password doğru
- [ ] Özel karakterler URL encoded (gerekirse)
- [ ] Railway'de variable güncellendikten sonra service restart edildi

---

**Son Güncelleme**: Aralık 2024

