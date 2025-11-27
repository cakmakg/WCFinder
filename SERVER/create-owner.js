/**
 * Create User Account Script (Any Role)
 * 
 * Utility script to create user accounts with any role
 * DRY: Uses helper functions from authHelpers
 * 
 * Usage:
 *   node scripts/create-user.js <username> <email> <password> <role> [isActive]
 *   node scripts/create-user.js owner test@mail.com Owner1234 owner true
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/user');
const Token = require('../src/models/token');
const passwordEncrypt = require('../src/helper/passwordEncrypt');
const { normalizeEmail, normalizeUsername, createEmailRegex } = require('../src/utils/authHelpers');

// Database connection (DRY)
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

const createUser = async (userData) => {
    const { username, email, password, role = 'user', isActive = true } = userData;

    if (!await connectDB()) {
        process.exit(1);
    }

    try {
        console.log('\n🔐 Creating User Account...');
        console.log('  Username:', username);
        console.log('  Email:', email);
        console.log('  Password:', password ? '***' : 'MISSING');
        console.log('  Role:', role);
        console.log('  isActive:', isActive);

        // ✅ Normalize (DRY: helper functions)
        const normalizedEmail = normalizeEmail(email);
        const normalizedUsername = normalizeUsername(username);

        // Validate role
        const allowedRoles = ['user', 'owner', 'admin'];
        if (!allowedRoles.includes(role)) {
            throw new Error(`Invalid role. Allowed: ${allowedRoles.join(', ')}`);
        }

        // ✅ Duplicate check (DRY: helper functions)
        const emailRegex = createEmailRegex(email);
        const existingUser = await User.findOne({
            $or: [
                { username: normalizedUsername },
                { email: emailRegex }
            ]
        });

        if (existingUser) {
            console.log('\n⚠️  User already exists:');
            console.log('  ID:', existingUser._id);
            console.log('  Username:', existingUser.username);
            console.log('  Email:', existingUser.email);
            console.log('  Role:', existingUser.role);
            console.log('  isActive:', existingUser.isActive);

            // Update if needed
            let updated = false;
            if (existingUser.role !== role) {
                existingUser.role = role;
                updated = true;
                console.log('  🔄 Updating role to:', role);
            }
            if (existingUser.isActive !== isActive) {
                existingUser.isActive = isActive;
                updated = true;
                console.log('  🔄 Updating isActive to:', isActive);
            }
            
            const encryptedPassword = passwordEncrypt(password);
            if (existingUser.password !== encryptedPassword) {
                existingUser.password = encryptedPassword;
                updated = true;
                console.log('  🔄 Updating password');
            }

            if (updated) {
                await existingUser.save();
                console.log('  ✅ User updated');
            }

            await mongoose.connection.close();
            console.log('\n✅ User account is ready!');
            return existingUser;
        }

        // Create new user
        const encryptedPassword = passwordEncrypt(password);
        const user = await User.create({
            username: normalizedUsername,
            email: normalizedEmail,
            password: encryptedPassword,
            role,
            isActive
        });

        console.log('\n✅ User account created:');
        console.log('  ID:', user._id);
        console.log('  Username:', user.username);
        console.log('  Email:', user.email);
        console.log('  Role:', user.role);
        console.log('  isActive:', user.isActive);

        // Create token
        try {
            await Token.create({
                userId: user._id,
                token: passwordEncrypt(user._id + Date.now()),
            });
            console.log('  ✅ Token created');
        } catch (tokenError) {
            // Token may already exist, ignore
        }

        await mongoose.connection.close();
        console.log('\n✅ Account created successfully!');
        return user;

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (error.code === 11000) {
            console.error('  Duplicate key error');
        }
        await mongoose.connection.close();
        throw error;
    }
};

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 4) {
        console.log('Usage: node scripts/create-user.js <username> <email> <password> <role> [isActive]');
        console.log('Example: node scripts/create-user.js owner test@mail.com Owner1234 owner true');
        process.exit(1);
    }

    const [username, email, password, role, isActiveStr] = args;
    const isActive = isActiveStr === 'true' || isActiveStr === undefined;

    createUser({ username, email, password, role, isActive })
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = { createUser };


