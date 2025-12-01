// update-owner-role.js
// Owner user'ın role'ünü 'owner' olarak günceller
// Kullanım: node scripts/update-owner-role.js [username] [email]

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { mongoose, dbConnection } = require('../src/config/dbConnection');
const User = require('../src/models/user');

// Database connection
dbConnection();

async function updateOwnerRole(username, email) {
    try {
        console.log('🔍 Connecting to MongoDB...');
        
        // Username veya email ile user'ı bul
        const query = {};
        if (username) {
            query.username = username;
        }
        if (email) {
            query.email = email;
        }
        
        if (!username && !email) {
            // Default: citypark_hotel_owner
            query.$or = [
                { username: 'citypark_hotel_owner' },
                { email: 'owner@cityparkhotel-bonn.de' }
            ];
        }
        
        const user = await User.findOne(query);
        
        if (!user) {
            console.error('❌ User not found!');
            console.error('   Searched for:', { username, email });
            await mongoose.connection.close();
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
        
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    const username = args[0];
    const email = args[1];
    
    updateOwnerRole(username, email);
}

module.exports = { updateOwnerRole };

