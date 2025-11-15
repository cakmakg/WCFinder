# MongoDB Compass - Owner User Oluşturma Rehberi

## 📋 Verilen Business Verisi

```json
{
  "owner": {
    "$oid": "6909d1f8a36e3638e2e52f04"
  },
  "businessName": "Citypark Hotel Bonn",
  "businessType": "Hotel",
  "address": {
    "street": "Kaiserplatz 3",
    "city": "Bonn",
    "postalCode": "53113",
    "country": "Germany"
  },
  "location": {
    "type": "Point",
    "coordinates": [7.112, 50.734]
  },
  "openingHours": "24/7",
  "approvalStatus": "approved"
}
```

**Not:** Bu business'ın owner'ı `6909d1f8a36e3638e2e52f04` ObjectId'sine sahip bir user olmalı.

---

## 🎯 Yöntem 1: MongoDB Compass'ta Direkt Insert (Manuel Password Hash)

### ⚠️ ÖNEMLİ: Password Hash Hesaplama

Password hash'leme için `pbkdf2Sync` kullanılıyor. MongoDB Compass'ta direkt insert yapmak için password'ü önce hash'lemeniz gerekiyor.

**En Kolay Yol:** Terminal'de Node.js script çalıştırın:

```javascript
// passwordHash.js - Terminal'de çalıştırın
const { pbkdf2Sync } = require('crypto');
const keyCode = process.env.SECRET_KEY || 'your-secret-key'; // .env'deki SECRET_KEY
const loopCount = 1000;
const charCount = 32;
const encType = 'sha512';

function passwordEncrypt(password) {
    return pbkdf2Sync(password, keyCode, loopCount, charCount, encType).toString('hex');
}

// Örnek: "Owner123!" şifresini hash'le
console.log('Hashed Password:', passwordEncrypt('Owner123!'));
```

**Çalıştırma:**
```bash
cd SERVER
node -e "const {pbkdf2Sync} = require('crypto'); const keyCode = process.env.SECRET_KEY || 'your-secret-key'; console.log(pbkdf2Sync('Owner123!', keyCode, 1000, 32, 'sha512').toString('hex'));"
```

### MongoDB Compass'ta Insert

1. **`users` collection'ını seçin**
2. **"INSERT DOCUMENT" butonuna tıklayın**
3. **Aşağıdaki JSON'ı yapıştırın:**

```json
{
  "_id": ObjectId("6909d1f8a36e3638e2e52f04"),
  "username": "citypark_hotel_owner",
  "email": "owner@cityparkhotel-bonn.de",
  "password": "HASH_LENMIŞ_ŞİFRE_BURAYA",
  "role": "owner",
  "isActive": true,
  "createdAt": ISODate("2024-01-15T10:00:00.000Z"),
  "updatedAt": ISODate("2024-01-15T10:00:00.000Z")
}
```

**Örnek (Password: "Owner123!" için hash'lenmiş):**
```json
{
  "_id": ObjectId("6909d1f8a36e3638e2e52f04"),
  "username": "citypark_hotel_owner",
  "email": "owner@cityparkhotel-bonn.de",
  "password": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
  "role": "owner",
  "isActive": true,
  "createdAt": ISODate("2024-01-15T10:00:00.000Z"),
  "updatedAt": ISODate("2024-01-15T10:00:00.000Z")
}
```

**Not:** 
- `_id` değerini business'taki `owner.$oid` ile aynı yapın: `6909d1f8a36e3638e2e52f04`
- `password` field'ına hash'lenmiş değeri yapıştırın
- `createdAt` ve `updatedAt` MongoDB otomatik ekler, manuel eklemek isterseniz ISODate kullanın

---

## 🎯 Yöntem 2: Postman/API ile Oluşturma (ÖNERİLEN - Daha Güvenli)

### Adım 1: Admin Token Alın

```json
POST /auth/login
{
  "username": "admin",
  "password": "Password123?"
}
```

Response'dan `accessToken`'ı alın.

### Adım 2: Owner User Oluşturun

```json
POST /users
Headers:
  Authorization: Bearer {admin_access_token}
  Content-Type: application/json

Body:
{
  "username": "citypark_hotel_owner",
  "email": "owner@cityparkhotel-bonn.de",
  "password": "Owner123!",
  "role": "owner",
  "isActive": true
}
```

**Response:**
```json
{
  "error": false,
  "result": {
    "_id": "6909d1f8a36e3638e2e52f04",
    "username": "citypark_hotel_owner",
    "email": "owner@cityparkhotel-bonn.de",
    "role": "owner",
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**ÖNEMLİ:** Response'dan gelen `_id` değerini alın ve business'taki `owner` field'ını bu `_id` ile güncelleyin.

### Adım 3: Business'taki Owner Field'ını Güncelleyin

MongoDB Compass'ta `business` collection'ında:

1. Business'ı bulun: `businessName: "Citypark Hotel Bonn"`
2. **UPDATE** butonuna tıklayın
3. `owner` field'ını güncelleyin:

```json
{
  "owner": ObjectId("6909d1f8a36e3638e2e52f04")
}
```

**veya tüm business'ı güncelleyin:**

```json
{
  "owner": ObjectId("6909d1f8a36e3638e2e52f04"),
  "businessName": "Citypark Hotel Bonn",
  "businessType": "Hotel",
  "address": {
    "street": "Kaiserplatz 3",
    "city": "Bonn",
    "postalCode": "53113",
    "country": "Germany"
  },
  "location": {
    "type": "Point",
    "coordinates": [7.112, 50.734]
  },
  "openingHours": "24/7",
  "approvalStatus": "approved"
}
```

---

## 🎯 Yöntem 3: Node.js Script ile Oluşturma (En Kolay)

Bir script oluşturun:

```javascript
// createOwner.js
require('dotenv').config();
const { mongoose } = require('./SERVER/src/config/dbConnection');
const User = require('./SERVER/src/models/user');
const Business = require('./SERVER/src/models/business');
const passwordEncrypt = require('./SERVER/src/helper/passwordEncrypt');

async function createOwner() {
    try {
        // 1. Owner User Oluştur
        const owner = await User.create({
            username: "citypark_hotel_owner",
            email: "owner@cityparkhotel-bonn.de",
            password: passwordEncrypt("Owner123!"), // Otomatik hash'lenir
            role: "owner",
            isActive: true
        });
        
        console.log('✅ Owner User Oluşturuldu:', owner._id);
        
        // 2. Business Oluştur ve Owner'a Bağla
        const business = await Business.create({
            owner: owner._id,
            businessName: "Citypark Hotel Bonn",
            businessType: "Hotel",
            address: {
                street: "Kaiserplatz 3",
                city: "Bonn",
                postalCode: "53113",
                country: "Germany"
            },
            location: {
                type: "Point",
                coordinates: [7.112, 50.734]
            },
            openingHours: "24/7",
            approvalStatus: "approved"
        });
        
        console.log('✅ Business Oluşturuldu:', business._id);
        console.log('✅ Owner ID:', owner._id.toString());
        console.log('✅ Business Owner ID:', business.owner.toString());
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Hata:', error);
        process.exit(1);
    }
}

createOwner();
```

**Çalıştırma:**
```bash
node createOwner.js
```

---

## 📝 MongoDB Compass'ta Tam JSON Örneği

### User Collection (users)

```json
{
  "_id": ObjectId("6909d1f8a36e3638e2e52f04"),
  "username": "citypark_hotel_owner",
  "email": "owner@cityparkhotel-bonn.de",
  "password": "HASH_LENMIŞ_ŞİFRE",
  "role": "owner",
  "isActive": true,
  "createdAt": ISODate("2024-01-15T10:00:00.000Z"),
  "updatedAt": ISODate("2024-01-15T10:00:00.000Z")
}
```

### Business Collection (business)

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "owner": ObjectId("6909d1f8a36e3638e2e52f04"),
  "businessName": "Citypark Hotel Bonn",
  "businessType": "Hotel",
  "address": {
    "street": "Kaiserplatz 3",
    "city": "Bonn",
    "postalCode": "53113",
    "country": "Germany"
  },
  "location": {
    "type": "Point",
    "coordinates": [7.112, 50.734]
  },
  "openingHours": "24/7",
  "approvalStatus": "approved",
  "createdAt": ISODate("2024-01-15T10:05:00.000Z"),
  "updatedAt": ISODate("2024-01-15T10:05:00.000Z")
}
```

---

## ✅ Doğrulama

### 1. Owner Login Test

```json
POST /auth/login
{
  "username": "citypark_hotel_owner",
  "password": "Owner123!"
}
```

### 2. Owner'ın Business'ını Görüntüleme

```
GET /business/my-business
Authorization: Bearer {owner_token}
```

### 3. MongoDB Compass'ta Kontrol

- `users` collection'ında `role: "owner"` olan user'ı bulun
- `business` collection'ında `owner` field'ının bu user'ın `_id`'sine referans verdiğini kontrol edin

---

## 🔧 Hızlı Password Hash Script

Terminal'de çalıştırın (SERVER dizininde):

```bash
cd SERVER
node -e "
const {pbkdf2Sync} = require('crypto');
require('dotenv').config();
const keyCode = process.env.SECRET_KEY;
const password = 'Owner123!';
const hash = pbkdf2Sync(password, keyCode, 1000, 32, 'sha512').toString('hex');
console.log('Password:', password);
console.log('Hash:', hash);
"
```

Bu hash değerini MongoDB Compass'ta `password` field'ına yapıştırın.

