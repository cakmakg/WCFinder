// updateOwnerRole.js
// Owner user'ın role'ünü 'owner' olarak günceller
// Kullanım: node updateOwnerRole.js

require('dotenv').config();
const { mongoose } = require('./SERVER/src/config/dbConnection');
const User = require('./SERVER/src/models/user');

async function updateOwnerRole() {
    try {
        console.log('🔍 Connecting to MongoDB...');
        
        // Username veya email ile user'ı bul
        const user = await User.findOne({
            $or: [
                { username: "citypark_hotel_owner" },
                { email: "owner@cityparkhotel-bonn.de" }
            ]
        });
        
        if (!user) {
            console.error('❌ User not found!');
            process.exit(1);
        }
        
        console.log('📋 Current user:', {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        });
        
        // Role'ü güncelle
        user.role = 'owner';
        await user.save();
        
        console.log('✅ User role updated successfully!');
        console.log('📋 Updated user:', {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// MongoDB bağlantısını kontrol et
if (mongoose.connection.readyState === 1) {
    updateOwnerRole();
} else {
    mongoose.connection.once('open', () => {
        updateOwnerRole();
    });
}

