# Server Scripts

Utility scripts for database operations and testing.

## Available Scripts

### 1. `test-user-auth.js`
Test user authentication (login/register) for any role.

**Usage:**
```bash
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
```

### 2. `create-user.js`
Create user accounts with any role (user, owner, admin).

**Usage:**
```bash
node scripts/create-user.js <username> <email> <password> <role> [isActive]
```

**Examples:**
```bash
# Create owner account
node scripts/create-user.js owner test@mail.com Owner1234 owner true

# Create admin account (use with caution!)
node scripts/create-user.js admin admin@mail.com Admin1234 admin true
```

**Note:** Admin accounts should only be created by system administrators.

### 3. `update-toilet-fees.js`
Update all toilet fees to 1.00 EUR in the database.

**Usage:**
```bash
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

## Clean Code Principles

- **DRY**: All scripts use helper functions from `src/utils/authHelpers.js`
- **Single Responsibility**: Each script has one clear purpose
- **Reusability**: Helper functions can be used in controllers and scripts

