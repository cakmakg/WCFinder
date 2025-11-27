// Script to fix payment model indexes
// Run this once to remove the old unique index on usageId

require('dotenv').config();
const mongoose = require('mongoose');

async function fixIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('payments');

    // Get current indexes
    const indexes = await collection.indexes();
    console.log('📋 Current indexes:', indexes);

    // Drop the old unique index on usageId if it exists
    try {
      await collection.dropIndex('usageId_1');
      console.log('✅ Dropped old unique index on usageId');
    } catch (err) {
      if (err.code === 27) {
        console.log('ℹ️  Index usageId_1 does not exist, skipping...');
      } else {
        throw err;
      }
    }

    // Create new non-unique index on usageId
    await collection.createIndex({ usageId: 1 }, { sparse: true });
    console.log('✅ Created new sparse index on usageId');

    // Drop existing paymentIntentId index if it exists (to recreate as unique)
    try {
      await collection.dropIndex('paymentIntentId_1');
      console.log('✅ Dropped existing paymentIntentId index');
    } catch (err) {
      if (err.code === 27) {
        console.log('ℹ️  Index paymentIntentId_1 does not exist, skipping...');
      } else {
        console.log('⚠️  Could not drop paymentIntentId_1:', err.message);
      }
    }

    // Drop existing paypalOrderId index if it exists (to recreate as unique)
    try {
      await collection.dropIndex('paypalOrderId_1');
      console.log('✅ Dropped existing paypalOrderId index');
    } catch (err) {
      if (err.code === 27) {
        console.log('ℹ️  Index paypalOrderId_1 does not exist, skipping...');
      } else {
        console.log('⚠️  Could not drop paypalOrderId_1:', err.message);
      }
    }

    // Create unique indexes on paymentIntentId and paypalOrderId
    try {
      await collection.createIndex({ paymentIntentId: 1 }, { unique: true, sparse: true });
      console.log('✅ Created unique sparse index on paymentIntentId');
    } catch (err) {
      if (err.code === 85) {
        console.log('ℹ️  Index on paymentIntentId already exists');
      } else {
        console.log('⚠️  Could not create paymentIntentId index:', err.message);
      }
    }

    try {
      await collection.createIndex({ paypalOrderId: 1 }, { unique: true, sparse: true });
      console.log('✅ Created unique sparse index on paypalOrderId');
    } catch (err) {
      if (err.code === 85) {
        console.log('ℹ️  Index on paypalOrderId already exists');
      } else {
        console.log('⚠️  Could not create paypalOrderId index:', err.message);
      }
    }

    // Show final indexes
    const finalIndexes = await collection.indexes();
    console.log('📋 Final indexes:', finalIndexes);

    console.log('✅ Index fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
    process.exit(1);
  }
}

fixIndexes();

