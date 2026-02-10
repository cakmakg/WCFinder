# Server Scripts

Utility scripts for database operations and testing.

> **Note:** All scripts should be run from the `SERVER` directory: `cd SERVER && node scripts/script-name.js`

---

## Available Scripts

### 1. `create-admin.js`
Create admin user account (first admin user for the system).

**Usage:**
```bash
cd SERVER
node scripts/create-admin.js
```

**Features:**
- Creates admin user: `admin` / `admin@wcfinder.com` / `admin123?`
- Checks if admin already exists
- Updates role to admin if user exists but role is different

**Note:** For security, change the default password after first login!

---

### 2. `create-user.js`
Create user accounts with any role (user, owner, admin).

**Usage:**
```bash
cd SERVER
node scripts/create-user.js <username> <email> <password> <role> [isActive]
```

**Examples:**
```bash
# Create owner account
node scripts/create-user.js owner test@mail.com Owner1234 owner true

# Create admin account (use with caution!)
node scripts/create-user.js admin admin@mail.com Admin1234 admin true

# Create regular user
node scripts/create-user.js user user@mail.com User1234 user true
```

**Note:** Admin accounts should only be created by system administrators.

---

### 3. `create-owner-with-business.js`
Create owner user and business together (demo data).

**Usage:**
```bash
cd SERVER
node scripts/create-owner-with-business.js
```

**Features:**
- Creates owner user: `citypark_hotel_owner`
- Creates associated business: `Citypark Hotel Bonn`
- Useful for testing and demo purposes

---

### 4. `update-owner-role.js`
Update existing user's role to 'owner'.

**Usage:**
```bash
cd SERVER
node scripts/update-owner-role.js [username] [email]
```

**Examples:**
```bash
# Update by username
node scripts/update-owner-role.js citypark_hotel_owner

# Update by email
node scripts/update-owner-role.js "" owner@cityparkhotel-bonn.de

# Default (updates citypark_hotel_owner)
node scripts/update-owner-role.js
```

---

### 5. `test-user-auth.js`
Test user authentication (login/register) for any role.

**Usage:**
```bash
cd SERVER
# Test login
node scripts/test-user-auth.js login <email> <password> [role]

# List users by role
node scripts/test-user-auth.js list [role]
```

**Examples:**
```bash
# Test owner login
node scripts/test-user-auth.js login beuelriversidecafe@mail.com Owner1234 owner

# List all owners
node scripts/test-user-auth.js list owner

# List all users
node scripts/test-user-auth.js list
```

---

### 6. `update-toilet-fees.js`
Update all toilet fees to 1.00 EUR in the database.

**Usage:**
```bash
cd SERVER
# Preview changes (dry run)
node scripts/update-toilet-fees.js --dry-run

# Apply changes
node scripts/update-toilet-fees.js
```

**Examples:**
```bash
# First, preview what will be changed
node scripts/update-toilet-fees.js --dry-run

# Then apply the changes
node scripts/update-toilet-fees.js
```

**Note:** This script updates all existing toilets in the database. Use `--dry-run` first to preview changes.

---

### 7. `fix-payment-indexes.js`
Fix MongoDB indexes for payment collection.

**Usage:**
```bash
cd SERVER
node scripts/fix-payment-indexes.js
```

---

## Clean Code Principles

- **DRY**: All scripts use helper functions from `src/utils/authHelpers.js`
- **Single Responsibility**: Each script has one clear purpose
- **Reusability**: Helper functions can be used in controllers and scripts
- **Consistent Structure**: All scripts follow the same pattern for database connection and error handling

---

## Environment Variables

All scripts require `.env` file in the `SERVER` directory with:
- `MONGODB` or `MONGODB_URI` - MongoDB connection string

---

## Migration Notes

Previously, some scripts were in the root directory. They have been moved to `SERVER/scripts/` for better organization:

- ❌ `createAdmin.js` → ✅ `SERVER/scripts/create-admin.js`
- ❌ `createOwner.js` → ✅ `SERVER/scripts/create-owner-with-business.js`
- ❌ `updateOwnerRole.js` → ✅ `SERVER/scripts/update-owner-role.js`

Please update your documentation and scripts accordingly.

