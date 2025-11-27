/**
 * User Authentication Test Script
 * 
 * Utility script to test user authentication (login/register) for any role
 * DRY: Reusable test utilities
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/user');
const Token = require('../src/models/token');
const passwordEncrypt = require('../src/helper/passwordEncrypt');
const { normalizeEmail, normalizeUsername, createEmailRegex } = require('../src/utils/authHelpers');

// Database connection helper (DRY)
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wcfinder');
        console.log('✅ Database connected');
        return true;
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        return false;
    }
};

// Test user lookup
const testUserLookup = async (email, username = null) => {
    const normalizedEmail = normalizeEmail(email);
    const normalizedUsername = normalizeUsername(username);
    
    console.log('\n🔍 User Lookup Test:');
    console.log('  Email:', email, '→', normalizedEmail);
    if (username) console.log('  Username:', username, '→', normalizedUsername);

    const emailRegex = createEmailRegex(email);
    const query = {
        $or: username 
            ? [{ username: normalizedUsername }, { email: emailRegex }]
            : [{ email: emailRegex }]
    };

    const user = await User.findOne(query);
    
    if (user) {
        console.log('  ✅ User FOUND:');
        console.log('    ID:', user._id);
        console.log('    Username:', user.username);
        console.log('    Email:', user.email);
        console.log('    Role:', user.role);
        console.log('    isActive:', user.isActive);
        return user;
    } else {
        console.log('  ❌ User NOT FOUND');
        return null;
    }
};

// Test password verification
const testPassword = (user, password) => {
    if (!user) {
        console.log('  ❌ Cannot test password: user not found');
        return false;
    }

    const encryptedPassword = passwordEncrypt(password);
    const match = user.password === encryptedPassword;
    
    console.log('\n🔐 Password Verification:');
    console.log('  Match:', match ? '✅ YES' : '❌ NO');
    
    if (!match) {
        console.log('  Stored Hash (first 30):', user.password?.substring(0, 30) + '...');
        console.log('  Computed Hash (first 30):', encryptedPassword.substring(0, 30) + '...');
    }
    
    return match;
};

// Main test function
const testAuth = async (testData) => {
    const { email, username, password, role = 'user', testType = 'login' } = testData;

    console.log(`\n${'='.repeat(50)}`);
    console.log(`🧪 Testing ${testType.toUpperCase()} for ${role.toUpperCase()}`);
    console.log(`${'='.repeat(50)}`);

    if (!await connectDB()) {
        process.exit(1);
    }

    try {
        if (testType === 'login') {
            const user = await testUserLookup(email, username);
            if (user && password) {
                const passwordOk = testPassword(user, password);
                const canLogin = user.isActive && passwordOk && user.role === role;
                
                console.log('\n📋 Login Test Result:');
                console.log('  isActive:', user.isActive ? '✅' : '❌');
                console.log('  Password:', passwordOk ? '✅' : '❌');
                console.log('  Role Match:', user.role === role ? '✅' : `❌ (expected: ${role}, got: ${user.role})`);
                console.log('  Can Login:', canLogin ? '✅ YES' : '❌ NO');
            }
        } else if (testType === 'register') {
            const existingUser = await testUserLookup(email, username);
            if (existingUser) {
                console.log('\n⚠️  User already exists - cannot register');
            } else {
                console.log('\n✅ User does not exist - registration possible');
            }
        } else if (testType === 'list') {
            console.log('\n📋 Listing all users by role:', role);
            const users = await User.find({ role }).select('username email role isActive');
            console.log(`Found ${users.length} ${role}(s):`);
            users.forEach((u, i) => {
                console.log(`  ${i + 1}. ${u.email} (${u.username}) - Active: ${u.isActive}`);
            });
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n✅ Test completed');
    }
};

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0];
    
    if (command === 'login') {
        const email = args[1];
        const password = args[2];
        const role = args[3] || 'user';
        testAuth({ email, password, role, testType: 'login' });
    } else if (command === 'list') {
        const role = args[1] || 'owner';
        testAuth({ role, testType: 'list' });
    } else {
        console.log('Usage:');
        console.log('  node test-user-auth.js login <email> <password> [role]');
        console.log('  node test-user-auth.js list [role]');
    }
}

module.exports = { testAuth, testUserLookup, testPassword, connectDB };

