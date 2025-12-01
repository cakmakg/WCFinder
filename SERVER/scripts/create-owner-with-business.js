// create-owner-with-business.js
// Owner user ve Business oluşturma script'i (birlikte)
// Kullanım: node scripts/create-owner-with-business.js

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { mongoose, dbConnection } = require('../src/config/dbConnection');
const User = require('../src/models/user');
const Business = require('../src/models/business');
const passwordEncrypt = require('../src/helper/passwordEncrypt');

// Database connection
dbConnection();

async function createOwnerWithBusiness() {
    try {
        console.log('🔍 Connecting to MongoDB...');
        
        // 1. Owner User Oluştur
        const existingOwner = await User.findOne({
            $or: [
                { username: 'citypark_hotel_owner' },
                { email: 'owner@cityparkhotel-bonn.de' }
            ]
        });
        
        if (existingOwner) {
            console.log('⚠️ Owner user already exists!');
            console.log('📋 Existing owner:', {
                username: existingOwner.username,
                email: existingOwner.email,
                role: existingOwner.role
            });
            
            // Role'ü güncelle
            if (existingOwner.role !== 'owner') {
                existingOwner.role = 'owner';
                await existingOwner.save();
                console.log('✅ Owner role updated!');
            }
            
            await mongoose.connection.close();
            process.exit(0);
        }
        
        const owner = await User.create({
            username: 'citypark_hotel_owner',
            email: 'owner@cityparkhotel-bonn.de',
            password: passwordEncrypt('Owner123!'),
            role: 'owner',
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
            businessName: 'Citypark Hotel Bonn',
            businessType: 'Hotel',
            address: {
                street: 'Kaiserplatz 3',
                city: 'Bonn',
                postalCode: '53113',
                country: 'Germany'
            },
            location: {
                type: 'Point',
                coordinates: [7.112, 50.734]
            },
            openingHours: '24/7',
            approvalStatus: 'approved'
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
            password: owner.password,
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
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Hata:', error.message);
        if (error.code === 11000) {
            console.error('⚠️  Bu email veya username zaten kullanılıyor!');
        }
        await mongoose.connection.close();
        process.exit(1);
    }
}

// MongoDB bağlantısını kontrol et
if (mongoose.connection.readyState === 1) {
    createOwnerWithBusiness();
} else {
    mongoose.connection.once('open', () => {
        createOwnerWithBusiness();
    });
}

