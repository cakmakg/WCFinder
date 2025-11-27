/**
 * Update Toilet Fees Migration Script
 * 
 * Updates all toilet fees to 1.00 EUR
 * This script updates existing toilets in the database
 * 
 * Usage:
 *   node scripts/update-toilet-fees.js
 *   node scripts/update-toilet-fees.js --dry-run  (preview only, no changes)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Toilet = require('../src/models/toilet');

// Database connection
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

const updateToiletFees = async (dryRun = false) => {
    if (!await connectDB()) {
        process.exit(1);
    }

    try {
        console.log('\n🔍 Finding all toilets...');
        
        // Find all toilets
        const toilets = await Toilet.find({});
        console.log(`   Found ${toilets.length} toilets\n`);

        if (toilets.length === 0) {
            console.log('ℹ️  No toilets found in database');
            await mongoose.connection.close();
            return;
        }

        // Group by current fee value
        const feeGroups = {};
        toilets.forEach(toilet => {
            const fee = toilet.fee || 0;
            if (!feeGroups[fee]) {
                feeGroups[fee] = [];
            }
            feeGroups[fee].push(toilet);
        });

        console.log('📊 Current fee distribution:');
        Object.keys(feeGroups).sort((a, b) => parseFloat(a) - parseFloat(b)).forEach(fee => {
            console.log(`   €${parseFloat(fee).toFixed(2)}: ${feeGroups[fee].length} toilets`);
        });

        // Count toilets that need updating (not already 1.00)
        const toiletsToUpdate = toilets.filter(t => (t.fee || 0) !== 1.00);
        console.log(`\n🔄 Toilets to update: ${toiletsToUpdate.length}`);

        if (toiletsToUpdate.length === 0) {
            console.log('✅ All toilets already have fee = 1.00 EUR');
            await mongoose.connection.close();
            return;
        }

        if (dryRun) {
            console.log('\n🔍 DRY RUN MODE - No changes will be made\n');
            console.log('Toilets that would be updated:');
            toiletsToUpdate.forEach((toilet, index) => {
                console.log(`   ${index + 1}. ${toilet.name} (ID: ${toilet._id}) - Current: €${(toilet.fee || 0).toFixed(2)} → New: €1.00`);
            });
            console.log('\n⚠️  This was a dry run. Run without --dry-run to apply changes.');
        } else {
            console.log('\n🔄 Updating toilet fees to 1.00 EUR...\n');
            
            // Update all toilets to fee = 1.00
            const result = await Toilet.updateMany(
                { fee: { $ne: 1.00 } }, // Update all where fee is not 1.00
                { $set: { fee: 1.00 } }
            );

            console.log(`✅ Updated ${result.modifiedCount} toilets`);
            console.log(`   Matched: ${result.matchedCount} toilets`);
            
            // Verify the update
            const updatedToilets = await Toilet.find({ fee: { $ne: 1.00 } });
            if (updatedToilets.length === 0) {
                console.log('✅ All toilets now have fee = 1.00 EUR');
            } else {
                console.log(`⚠️  Warning: ${updatedToilets.length} toilets still don't have fee = 1.00`);
            }
        }

        await mongoose.connection.close();
        console.log('\n✅ Migration completed!');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error.stack);
        await mongoose.connection.close();
        throw error;
    }
};

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');

    if (dryRun) {
        console.log('🔍 Running in DRY RUN mode (no changes will be made)\n');
    }

    updateToiletFees(dryRun)
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = { updateToiletFees };

