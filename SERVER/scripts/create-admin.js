// create-admin.js
// Admin kullanıcısı oluşturma script'i
// Kullanım: node scripts/create-admin.js

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { mongoose, dbConnection } = require('../src/config/dbConnection');
const User = require('../src/models/user');
const passwordEncrypt = require('../src/helper/passwordEncrypt');

// Database connection
dbConnection();

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
            } else {
                console.log('✅ Admin role is already correct!');
            }
            
            await mongoose.connection.close();
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
        
        console.log('\n📝 MongoDB Compass JSON:');
        console.log(JSON.stringify({
            username: admin.username,
            email: admin.email,
            password: admin.password,
            role: admin.role,
            isActive: admin.isActive
        }, null, 2));
        
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.connection.close();
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

