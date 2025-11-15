# Owner Sistemi Analizi ve Postman JSON Örnekleri

## 🔍 Mevcut Durum Analizi

### ✅ Doğru Olanlar:
1. **User Model:** `role` field'ı var: `'user'`, `'owner'`, `'admin'`
2. **Business Model:** `owner` field'ı var ve User'a referans veriyor (required: true)
3. **Owner Endpoint'leri:** 
   - `/business/my-business` - Owner kendi işletmesini görebilir
   - `/business/my-stats` - Owner kendi istatistiklerini görebilir
4. **Permission Middleware:** `isOwnerOrAdmin` middleware'i var

### ❌ Mantık Hataları:

#### 1. **GÜVENLİK AÇIĞI: Register Endpoint'inde Role Kontrolü Yok**
```javascript
// SERVER/src/controller/auth.js - register fonksiyonu
register: async (req, res) => {
    const userData = { ...req.body };
    userData.password = passwordEncrypt(password);
    const user = await User.create(userData); // ❌ role kontrolü yok!
}
```
**Sorun:** Herhangi biri register olurken `role: 'owner'` veya `role: 'admin'` gönderebilir.

**Çözüm:** Register endpoint'inde role'ü her zaman `'user'` olarak set et:
```javascript
register: async (req, res) => {
    const userData = { ...req.body };
    userData.password = passwordEncrypt(password);
    userData.role = 'user'; // ✅ Sadece 'user' role'ü ile kayıt olabilsin
    const user = await User.create(userData);
}
```

#### 2. **Owner'ın Business Oluşturma Yetkisi Yok**
- Business oluşturma sadece admin tarafından yapılabiliyor: `router.post('/', isAdmin, create)`
- Owner'ın kendi business'ını oluşturması için bir endpoint yok
- Owner'lar muhtemelen admin tarafından oluşturulmalı ve business'ları da admin tarafından atanmalı

**Çözüm Seçenekleri:**
- **Seçenek A:** Owner'lar admin tarafından oluşturulur ve business'ları admin tarafından atanır (ÖNERİLEN)
- **Seçenek B:** Owner'ın kendi business'ını oluşturması için özel bir endpoint ekle: `/business/my-business` POST

#### 3. **Owner'ın Business'ı Yoksa Ne Olacak?**
- `myBusiness` endpoint'i 404 döndürüyor
- Frontend'de bu durum handle edilmeli

---

## 📝 Postman JSON Örnekleri

### 1. **Owner User Oluşturma (Admin Tarafından)**

**Endpoint:** `POST /users`  
**Headers:** 
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "username": "cafe_owner_1",
  "email": "cafeowner1@example.com",
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
    "_id": "507f1f77bcf86cd799439011",
    "username": "cafe_owner_1",
    "email": "cafeowner1@example.com",
    "role": "owner",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 2. **Business Oluşturma (Admin Tarafından - Owner ile Bağlantılı)**

**Endpoint:** `POST /business`  
**Headers:** 
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "owner": "507f1f77bcf86cd799439011",
  "businessName": "Starbucks Bonn Center",
  "businessType": "Cafe",
  "address": {
    "street": "Friedrichstraße 15",
    "city": "Bonn",
    "postalCode": "53111",
    "country": "Germany"
  },
  "location": {
    "type": "Point",
    "coordinates": [7.0982, 50.7374]
  },
  "openingHours": "Mon-Fri 07:00-20:00; Sat-Sun 08:00-18:00",
  "approvalStatus": "approved"
}
```

**Not:** 
- `owner`: Owner user'ın `_id`'si (yukarıdaki adımda oluşturulan)
- `coordinates`: [longitude, latitude] formatında
- `approvalStatus`: `"pending"`, `"approved"`, veya `"rejected"` olabilir

**Response:**
```json
{
  "error": false,
  "result": {
    "_id": "507f1f77bcf86cd799439012",
    "owner": "507f1f77bcf86cd799439011",
    "businessName": "Starbucks Bonn Center",
    "businessType": "Cafe",
    "address": {
      "street": "Friedrichstraße 15",
      "city": "Bonn",
      "postalCode": "53111",
      "country": "Germany"
    },
    "location": {
      "type": "Point",
      "coordinates": [7.0982, 50.7374]
    },
    "openingHours": "Mon-Fri 07:00-20:00; Sat-Sun 08:00-18:00",
    "approvalStatus": "approved",
    "createdAt": "2024-01-15T10:35:00.000Z",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

---

### 3. **Owner Login**

**Endpoint:** `POST /auth/login`  
**Headers:** 
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "username": "cafe_owner_1",
  "password": "Owner123!"
}
```

**veya email ile:**
```json
{
  "email": "cafeowner1@example.com",
  "password": "Owner123!"
}
```

**Response:**
```json
{
  "error": false,
  "bearer": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "cafe_owner_1",
    "email": "cafeowner1@example.com",
    "role": "owner",
    "isActive": true
  }
}
```

---

### 4. **Owner'ın Kendi Business'ını Görüntüleme**

**Endpoint:** `GET /business/my-business`  
**Headers:** 
```
Authorization: Bearer {owner_access_token}
```

**Response:**
```json
{
  "error": false,
  "result": {
    "_id": "507f1f77bcf86cd799439012",
    "owner": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "cafe_owner_1",
      "email": "cafeowner1@example.com"
    },
    "businessName": "Starbucks Bonn Center",
    "businessType": "Cafe",
    "address": {
      "street": "Friedrichstraße 15",
      "city": "Bonn",
      "postalCode": "53111",
      "country": "Germany"
    },
    "location": {
      "type": "Point",
      "coordinates": [7.0982, 50.7374]
    },
    "openingHours": "Mon-Fri 07:00-20:00; Sat-Sun 08:00-18:00",
    "approvalStatus": "approved",
    "createdAt": "2024-01-15T10:35:00.000Z",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

---

### 5. **Owner'ın İstatistiklerini Görüntüleme**

**Endpoint:** `GET /business/my-stats`  
**Headers:** 
```
Authorization: Bearer {owner_access_token}
```

**Response:**
```json
{
  "error": false,
  "result": {
    "business": {
      "name": "Starbucks Bonn Center",
      "type": "Cafe",
      "address": {
        "street": "Friedrichstraße 15",
        "city": "Bonn",
        "postalCode": "53111",
        "country": "Germany"
      },
      "approvalStatus": "approved"
    },
    "toilets": {
      "total": 2,
      "available": 1,
      "inUse": 1,
      "outOfOrder": 0,
      "list": [
        {
          "id": "507f1f77bcf86cd799439013",
          "name": "Men's Toilet",
          "fee": 1.5,
          "status": "available",
          "averageRating": 4.5,
          "reviewCount": 12
        },
        {
          "id": "507f1f77bcf86cd799439014",
          "name": "Women's Toilet",
          "fee": 1.5,
          "status": "in_use",
          "averageRating": 4.7,
          "reviewCount": 15
        }
      ]
    },
    "usage": {
      "total": 150,
      "completed": 145,
      "pending": 5,
      "recent": 30,
      "byDay": [
        {
          "_id": "2024-01-15",
          "count": 5,
          "revenue": 7.5
        },
        {
          "_id": "2024-01-14",
          "count": 8,
          "revenue": 12.0
        }
      ]
    },
    "revenue": {
      "total": 225.0,
      "average": 1.5,
      "currency": "EUR"
    },
    "ratings": {
      "average": 4.6,
      "totalReviews": 27,
      "breakdown": {
        "cleanliness": 4.5
      }
    },
    "lastUpdated": "2024-01-15T10:40:00.000Z"
  }
}
```

---

## 🔧 Önerilen Düzeltmeler

### 1. Register Endpoint'ine Role Kontrolü Ekleyin

**Dosya:** `SERVER/src/controller/auth.js`

```javascript
register: async (req, res) => {
    const { username, email, password } = req.body;

    const isUserExist = await User.findOne({ $or: [{ username }, { email }] });

    if (isUserExist) {
        res.errorStatusCode = 409;
        throw new Error("Already used username or email.");
    }

    // ✅ GÜVENLİK: Sadece 'user' role'ü ile kayıt olabilsin
    const userData = { ...req.body };
    userData.password = passwordEncrypt(password);
    userData.role = 'user'; // Role'ü override et - güvenlik için
    
    const user = await User.create(userData);
    
    // ... rest of the code
}
```

### 2. Owner'ın Business Oluşturma Endpoint'i (Opsiyonel)

Eğer owner'ların kendi business'larını oluşturmasını istiyorsanız:

**Dosya:** `SERVER/src/routes/business.js`

```javascript
// Owner kendi business'ını oluşturabilir
router.post('/my-business', isOwnerOrAdmin, createMyBusiness);
```

**Dosya:** `SERVER/src/controller/business.js`

```javascript
createMyBusiness: async (req, res) => {
    // Owner'ın zaten bir business'ı var mı kontrol et
    const existingBusiness = await Business.findOne({ owner: req.user._id });
    
    if (existingBusiness) {
        res.errorStatusCode = 409;
        throw new Error("You already have a registered business.");
    }
    
    // Business oluştur ve owner'ı otomatik set et
    req.body.owner = req.user._id;
    req.body.approvalStatus = 'pending'; // Onay bekliyor
    
    const result = await Business.create(req.body);
    
    res.status(201).send({
        error: false,
        result
    });
}
```

---

## 📋 Özet: Owner Oluşturma Workflow'u

### Senaryo 1: Admin Tarafından Owner Oluşturma (ÖNERİLEN)

1. **Admin, Owner User Oluşturur:**
   ```
   POST /users
   { "username": "owner1", "email": "owner1@example.com", "password": "Pass123!", "role": "owner" }
   ```

2. **Admin, Business Oluşturur ve Owner'a Atar:**
   ```
   POST /business
   { "owner": "{owner_user_id}", "businessName": "...", ... }
   ```

3. **Owner Login Olur:**
   ```
   POST /auth/login
   { "username": "owner1", "password": "Pass123!" }
   ```

4. **Owner Kendi Profilini Görüntüler:**
   ```
   GET /business/my-business
   GET /business/my-stats
   ```

### Senaryo 2: Owner Kendi Business'ını Oluşturur (Yukarıdaki düzeltme ile)

1. **Normal User Register Olur:**
   ```
   POST /auth/register
   { "username": "user1", "email": "user1@example.com", "password": "Pass123!" }
   ```

2. **Admin, User'ı Owner Yapar:**
   ```
   PATCH /users/{user_id}
   { "role": "owner" }
   ```

3. **Owner, Kendi Business'ını Oluşturur:**
   ```
   POST /business/my-business
   { "businessName": "...", ... }
   ```

---

## ✅ Test Senaryoları

1. ✅ Owner login olabilir
2. ✅ Owner sadece kendi business'ını görebilir
3. ✅ Owner sadece kendi istatistiklerini görebilir
4. ✅ Normal user owner business'ını göremez (my-business endpoint'ine erişemez)
5. ✅ Admin tüm business'ları görebilir ve yönetebilir

