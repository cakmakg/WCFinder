// sync.js

"use strict"
/* -------------------------------------------------------
    WCFinder Project - Veritabanı Senkronizasyon Betiği
    (Geliştirme ortamını başlangıç verileriyle doldurur)
------------------------------------------------------- */

// Bu betiği projenizin ana dizininden `node sync.js` komutuyla çalıştırabilirsiniz.

module.exports = async function () {

    console.log('--- Senkronizasyon Başladı ---');

    /* 1. VERİTABANINI TEMİZLE */
    const { mongoose } = require('../config/dbConnection');
    await mongoose.connection.dropDatabase();
    console.log('- Veritabanı başarıyla silindi.');

       const User = require('../models/user');
    const Business = require('../models/business');
    const Toilet = require('../models/toilet');
    const Usage = require('../models/usage');
    const Payment = require('../models/payment');
    const Review = require('../models/review');
    
    /* ------------------------------------------------------- */

    /* 2. KULLANICILARI OLUŞTUR */
    
    // Not: Şifreler, User modelindeki 'set' metodu sayesinde otomatik olarak hash'lenecektir.
    const admin = await User.create({
        username: "admin",
        password: "Password123?", 
        email: "admin@site.com",
        role: "user", // Adminler aynı zamanda birer kullanıcıdır.
        isAdmin: true, // Admin yetkisi bu alanla verilir.
        isActive: true
    });

    const ownerUser = await User.create({
        username: "owner",
        password: "Password123?",
        email: "owner@site.com",
        role: "owner", // Bu kullanıcı bir işletme sahibidir.
        isActive: true
    });

    const normalUser = await User.create({
        username: "user",
        password: "Password123?",
        email: "user@site.com",
        role: "user", // Standart kullanıcı.
        isActive: false
    });
    console.log('- Kullanıcılar oluşturuldu.');
    
    /* ------------------------------------------------------- */

    /* 3. İŞLETMELERİ (BUSINESS) OLUŞTUR */

    const cafeBusiness = await Business.create({
        owner: ownerUser._id,
        businessName: "Harika Kahve Dükkanı",
        businessType: "Cafe", // Modeldeki enum'dan gelen değer
        address: {
            street: "Musterstr. 1",
            city: "Bonn",
            postalCode: "53111",
            country: "Germany"
        },
        location: {
            type: "Point",
            coordinates: [7.10093, 50.7374] // [longitude, latitude]
        },
        openingHours: "08:00-20:00",
        approvalStatus: "approved"
    });

    const hotelBusiness = await Business.create({
        owner: ownerUser._id,
        businessName: "Konforlu Köln Oteli",
        businessType: "Hotel", // Modeldeki enum'dan gelen değer
        address: {
            street: "Domplatz 5",
            city: "Köln",
            postalCode: "50667",
            country: "Germany"
        },
        location: {
            type: "Point",
            coordinates: [6.95831, 50.9413]
        },
        openingHours: "24/7",
        approvalStatus: "approved"
    });
    console.log('- İşletmeler oluşturuldu.');

    /* ------------------------------------------------------- */

    /* 4. TUVALETLERİ (WC) OLUŞTUR */

    const wc1 = await Toilet.create({
        business: cafeBusiness._id,
        name: "Giriş Katı Tuvaleti",
        fee: 0.50,
        status: "available",
        features: {
            gender: "Unisex",
            isAccessible: true,
            hasBabyChangingStation: true
        }
    });

   const wc2 = await Toilet.create({
        business: hotelBusiness._id,
        name: "Lobi Erkek WC",
        fee: 1.00,
        status: "available",
        features: {
            gender: "Male",
            isAccessible: false,
            hasBabyChangingStation: false
        }
    });

    const wc3 = await Toilet.create({
        business: hotelBusiness._id,
        name: "Lobi Kadın WC",
        fee: 1.00,
        status: "out_of_order", // Örnek olarak arızalı bir tuvalet
        features: {
            gender: "Female",
            isAccessible: true,
            hasBabyChangingStation: true
        }
    });
    console.log('- Tuvaletler oluşturuldu.');

    /* ------------------------------------------------------- */

    /* 5. ÖRNEK BİR KULLANIM VE ÖDEME İŞLEMİ OLUŞTUR */

    // 'normalUser', 'wc1' tuvaletini kullanıyor.
    const usage1 = await Usage.create({
        userId: normalUser._id,
        toiletId: wc1._id,
        totalFee: 2,
        status: "completed"
    });

    // Bu kullanıma ait ödeme kaydı.
    await Payment.create({
        usage: usage1._id,
        user: normalUser._id,
        amount: 2,
        currency: "EUR",
        status: "succeeded",
        transactionId: "pi_" + require('crypto').randomBytes(12).toString('hex') // Rastgele bir işlem ID'si
    });
    console.log('- Örnek kullanım ve ödeme işlemi oluşturuldu.');

    /* ------------------------------------------------------- */

    /* 6. YORUMLARI (REVIEW) OLUŞTUR */

    // 'normalUser', tamamladığı 'usage1' işlemi için 'wc1'e yorum yapıyor.
    // Not: Review modeli, bu yorum kaydedildikten sonra wc1'in ortalama puanını otomatik güncelleyecektir.
    await Review.create({
        userId: normalUser._id,
        toiletId: wc1._id,
        usage: usage1._id, // Yorumu gerçek bir kullanıma bağlıyoruz.
        ratings: {
            cleanliness: 5,
            accessibility: 5,
            overall: 5
        },
        comment: "Çok temiz ve erişilebilir olması harika. Bebek bakım masası da büyük bir artı!"
    });

    // Örnek bir başka yorum (her yorumun bir usage'a bağlı olması gerekmez)
    await Review.create({
        userId: admin._id,
        toiletId: wc2._id,
        ratings: {
            cleanliness: 3,
            accessibility: 1,
            overall: 2
        },
        comment: "Temizliği fena değil ama engelli erişimi olmaması büyük bir eksiklik."
    });
    console.log('- Yorumlar oluşturuldu.');
    
    /* ------------------------------------------------------- */

    console.log('--- Senkronizasyon Başarıyla Tamamlandı ---');
}