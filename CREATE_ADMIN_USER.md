# Admin Kullanıcısı Oluşturma Rehberi

## ⚠️ ÖNEMLİ NOT

`/auth/register` endpoint'i **güvenlik nedeniyle** her zaman `role: 'user'` olarak ayarlar. Admin kullanıcısı oluşturmak için **MongoDB Compass** kullanmanız gerekiyor.

---

## ✅ Yöntem 1: MongoDB Compass (ÖNERİLEN)

### Adım 1: Şifreyi Hash'le

Admin şifresini hash'lemek için Node.js kullanın:

```javascript
// hashPassword.js
const crypto = require('crypto');

function passwordEncrypt(password) {
    return crypto.pbkdf2Sync(password, 'saltKey', 100000, 64, 'sha512').toString('hex');
}

const password = 'admin123?'; // Admin şifreniz
const hashedPassword = passwordEncrypt(password);
console.log('Hashed Password:', hashedPassword);
```

**Veya terminal'de:**
```bash
node -e "const crypto = require('crypto'); console.log(crypto.pbkdf2Sync('admin123?', 'saltKey', 100000, 64, 'sha512').toString('hex'));"
```

### Adım 2: MongoDB Compass'ta Oluştur

1. **MongoDB Compass'ı açın**
2. **`users` collection'ını seçin**
3. **"ADD DATA" → "Insert Document" tıklayın**
4. **Aşağıdaki JSON'u yapıştırın:**

```json
{
  "username": "admin",
  "email": "admin@wcfinder.com",
  "password": "HASH_LENMIŞ_ŞİFRE_BURAYA",
  "role": "admin",
  "isActive": true,
  "createdAt": new Date(),
  "updatedAt": new Date()
}
```

**Örnek (şifre: `admin123?`):**
```json
{
  "username": "admin",
  "email": "admin@wcfinder.com",
  "password": "15519645588be7b4e88e78ccffcee527d31190e03b8454ffeb58bf9e1474ac89",
  "role": "admin",
  "isActive": true,
  "createdAt": new Date(),
  "updatedAt": new Date()
}
```

---

## ✅ Yöntem 2: Postman (2 Adım)

### Adım 1: Normal User Oluştur

**POST** `/auth/register`

```json
{
  "username": "admin",
  "email": "admin@wcfinder.com",
  "password": "admin123?"
}
```

**Not:** Bu kullanıcı `role: 'user'` olarak oluşturulacak.

### Adım 2: MongoDB Compass'ta Role'ü Güncelle

1. MongoDB Compass'ta `users` collection'ını açın
2. Oluşturduğunuz kullanıcıyı bulun (`username: "admin"`)
3. Düzenleme moduna geçin
4. `role` field'ını `"admin"` olarak değiştirin
5. Save'e tıklayın

---

## ✅ Yöntem 3: Node.js Script (Otomatik)

`createAdmin.js` dosyası oluşturun:

```javascript
// createAdmin.js
require('dotenv').config();
const { mongoose } = require('./SERVER/src/config/dbConnection');
const User = require('./SERVER/src/models/user');
const passwordEncrypt = require('./SERVER/src/helper/passwordEncrypt');

async function createAdmin() {
    try {
        console.log('🔍 Connecting to MongoDB...');
        
        // Admin kullanıcısı var mı kontrol et
        const existingAdmin = await User.findOne({ 
            $or: [
                { username: 'admin' },
                { email: 'admin@wcfinder.com' }
            ]
        });
        
        if (existingAdmin) {
            console.log('⚠️ Admin user already exists!');
            console.log('📋 Existing admin:', {
                username: existingAdmin.username,
                email: existingAdmin.email,
                role: existingAdmin.role
            });
            
            // Role'ü güncelle
            if (existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
                await existingAdmin.save();
                console.log('✅ Admin role updated!');
            }
            
            process.exit(0);
        }
        
        // Yeni admin oluştur
        const admin = await User.create({
            username: 'admin',
            email: 'admin@wcfinder.com',
            password: passwordEncrypt('admin123?'),
            role: 'admin',
            isActive: true
        });
        
        console.log('✅ Admin user created successfully!');
        console.log('📋 Admin details:', {
            _id: admin._id,
            username: admin.username,
            email: admin.email,
            role: admin.role
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// MongoDB bağlantısını kontrol et
if (mongoose.connection.readyState === 1) {
    createAdmin();
} else {
    mongoose.connection.once('open', () => {
        createAdmin();
    });
}
```

**Çalıştırma:**
```bash
node createAdmin.js
```

---

## 📋 Postman JSON (MongoDB Compass için)

MongoDB Compass'ta kullanmak için hazır JSON:

```json
{
  "username": "admin",
  "email": "admin@wcfinder.com",
  "password": "15519645588be7b4e88e78ccffcee527d31190e03b8454ffeb58bf9e1474ac89",
  "role": "admin",
  "isActive": true
}
```

**Şifre:** `admin123?` (hash'lenmiş hali yukarıda)

---

## 🔐 Güvenlik Notları

1. ✅ Admin şifresi güçlü olmalı (min. 8 karakter, büyük/küçük harf, sayı, özel karakter)
2. ✅ İlk admin oluşturulduktan sonra, diğer admin'ler sadece mevcut admin tarafından oluşturulabilir
3. ✅ Production'da admin email'i gerçek bir email olmalı
4. ✅ Admin şifresini asla commit etmeyin

---

## ✅ Doğrulama

Admin kullanıcısı oluşturulduktan sonra:

1. **Login yapın:**
   ```json
   POST /auth/login
   {
     "username": "admin",
     "password": "admin123?"
   }
   ```

2. **Response'da kontrol edin:**
   ```json
   {
     "user": {
       "role": "admin",
       "isAdmin": true
     }
   }
   ```

3. **Admin Panel'e erişin:**
   - Frontend'de avatar'a tıklayın
   - "Admin Panel" seçeneğini görün
   - `/admin` sayfasına gidin

---

## 🚀 Hızlı Başlangıç

**En hızlı yöntem:**

1. Şifreyi hash'le (yukarıdaki Node.js komutu ile)
2. MongoDB Compass'ta `users` collection'ına yukarıdaki JSON'u ekle
3. Login yap ve test et!

**Tamam! 🎉**

