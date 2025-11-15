// createOwner.js
// MongoDB Compass'ta owner oluşturmak için kullanılabilir
// Kullanım: node createOwner.js

require('dotenv').config();
const { mongoose } = require('./SERVER/src/config/dbConnection');
const User = require('./SERVER/src/models/user');
const Business = require('./SERVER/src/models/business');
const passwordEncrypt = require('./SERVER/src/helper/passwordEncrypt');

async function createOwner() {
    try {
        await mongoose.connection.once('open', () => {
            console.log('✅ MongoDB bağlantısı başarılı');
        });

        // 1. Owner User Oluştur
        const owner = await User.create({
            username: "citypark_hotel_owner",
            email: "owner@cityparkhotel-bonn.de",
            password: passwordEncrypt("Owner123!"), // Otomatik hash'lenir
            role: "owner",
            isActive: true
        });
        
        console.log('\n✅ Owner User Oluşturuldu:');
        console.log('   _id:', owner._id.toString());
        console.log('   username:', owner.username);
        console.log('   email:', owner.email);
        console.log('   role:', owner.role);
        
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
        
        console.log('\n✅ Business Oluşturuldu:');
        console.log('   _id:', business._id.toString());
        console.log('   businessName:', business.businessName);
        console.log('   owner:', business.owner.toString());
        
        console.log('\n📋 MongoDB Compass için JSON:');
        console.log('\n--- USER ---');
        console.log(JSON.stringify({
            _id: owner._id.toString(),
            username: owner.username,
            email: owner.email,
            password: owner.password, // Hash'lenmiş
            role: owner.role,
            isActive: owner.isActive,
            createdAt: owner.createdAt,
            updatedAt: owner.updatedAt
        }, null, 2));
        
        console.log('\n--- BUSINESS ---');
        console.log(JSON.stringify({
            _id: business._id.toString(),
            owner: business.owner.toString(),
            businessName: business.businessName,
            businessType: business.businessType,
            address: business.address,
            location: business.location,
            openingHours: business.openingHours,
            approvalStatus: business.approvalStatus,
            createdAt: business.createdAt,
            updatedAt: business.updatedAt
        }, null, 2));
        
        console.log('\n✅ İşlem tamamlandı!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Hata:', error.message);
        if (error.code === 11000) {
            console.error('⚠️  Bu email veya username zaten kullanılıyor!');
        }
        process.exit(1);
    }
}

// MongoDB bağlantısını kontrol et
if (mongoose.connection.readyState === 1) {
    createOwner();
} else {
    mongoose.connection.once('open', () => {
        createOwner();
    });
}

