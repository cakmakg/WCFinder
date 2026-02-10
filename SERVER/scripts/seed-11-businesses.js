// seed-11-businesses.js
// 11 owner + 11 işletme + 11 tuvalet oluşturur; kayıtları MongoDB'ye ekler.
// Kullanım: cd SERVER && node scripts/seed-11-businesses.js

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { mongoose, dbConnection } = require('../src/config/dbConnection');
const User = require('../src/models/user');
const Business = require('../src/models/business');
const Toilet = require('../src/models/toilet');
const passwordEncrypt = require('../src/helper/passwordEncrypt');

const COMMON_PASSWORD = 'Owner123!';

const BUSINESSES = [
  { businessName: 'Citypark Hotel Bonn', businessType: 'Hotel', street: 'Kaiserplatz 3', city: 'Bonn', postalCode: '53113', coords: [7.112, 50.734] },
  { businessName: 'Café Extrablatt', businessType: 'Cafe', street: 'Remigiusstraße 2', city: 'Bonn', postalCode: '53111', coords: [7.098, 50.738] },
  { businessName: 'Restaurant Poseidon', businessType: 'Restaurant', street: 'Vorgebirgsstraße 33', city: 'Bonn', postalCode: '53119', coords: [7.085, 50.732] },
  { businessName: 'Stadt-Café Bonn', businessType: 'Cafe', street: 'Sternstraße 64', city: 'Bonn', postalCode: '53111', coords: [7.102, 50.736] },
  { businessName: 'Dorint Hotel Bonn', businessType: 'Hotel', street: 'Gronau 1', city: 'Bonn', postalCode: '53113', coords: [7.108, 50.731] },
  { businessName: "McDonald's Bonn Zentrum", businessType: 'Restaurant', street: 'Remigiusstraße 16', city: 'Bonn', postalCode: '53111', coords: [7.096, 50.737] },
  { businessName: 'dm Drogerie Bonn', businessType: 'Shop', street: 'Sternstraße 45', city: 'Bonn', postalCode: '53111', coords: [7.100, 50.735] },
  { businessName: 'Shell Tankstelle Bonn', businessType: 'Gas Station', street: 'Vorgebirgsstraße 118', city: 'Bonn', postalCode: '53119', coords: [7.078, 50.728] },
  { businessName: 'Beuel Riverside Café', businessType: 'Cafe', street: 'Rheinufer 2', city: 'Bonn', postalCode: '53225', coords: [7.125, 50.735] },
  { businessName: 'Kameha Grand Bonn', businessType: 'Hotel', street: 'Am Bonner Bogen 1', city: 'Bonn', postalCode: '53227', coords: [7.142, 50.718] },
  { businessName: 'Bäckerei Schmidt', businessType: 'Shop', street: 'Bertha-von-Suttner-Platz 1', city: 'Bonn', postalCode: '53111', coords: [7.095, 50.739] },
];

dbConnection();

async function seed() {
  try {
    console.log('🔍 MongoDB\'ye bağlanılıyor...');

    const hashedPassword = passwordEncrypt(COMMON_PASSWORD);
    let createdOwners = 0, createdBusinesses = 0, createdToilets = 0;

    for (let i = 0; i < BUSINESSES.length; i++) {
      const b = BUSINESSES[i];
      const slug = b.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 20);
      const username = `owner_${slug}_${i + 1}`;
      const email = `owner${i + 1}@wcfinder-bonn.de`;

      let owner = await User.findOne({ $or: [{ username }, { email }] });
      if (!owner) {
        owner = await User.create({
          username,
          email,
          password: hashedPassword,
          firstName: 'Owner',
          lastName: `Owner${String(i + 1).padStart(2, '0')}`,
          role: 'owner',
          isActive: true,
        });
        createdOwners++;
      }

      let business = await Business.findOne({ businessName: b.businessName });
      if (!business) {
        business = await Business.create({
          owner: owner._id,
          businessName: b.businessName,
          businessType: b.businessType,
          address: { street: b.street, city: b.city, postalCode: b.postalCode, country: 'Germany' },
          location: { type: 'Point', coordinates: b.coords },
          openingHours: 'Mo–So 08:00–20:00',
          approvalStatus: 'approved',
        });
        createdBusinesses++;
      }

      const toiletExists = await Toilet.findOne({ business: business._id });
      if (!toiletExists) {
        await Toilet.create({
          business: business._id,
          name: 'Haupttoilette',
          fee: 1,
          features: { isAccessible: i % 3 === 0, hasBabyChangingStation: i % 4 === 0 },
          status: 'available',
        });
        createdToilets++;
      }
    }

    console.log('\n✅ Tamamlandı.');
    console.log('   Yeni owner:', createdOwners);
    console.log('   Yeni işletme:', createdBusinesses);
    console.log('   Yeni tuvalet:', createdToilets);
    console.log('\n📌 Tüm owner şifresi:', COMMON_PASSWORD);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Hata:', err.message);
    if (err.code === 11000) console.error('   (Email veya username zaten kullanılıyor.)');
    await mongoose.connection.close();
    process.exit(1);
  }
}

if (mongoose.connection.readyState === 1) {
  seed();
} else {
  mongoose.connection.once('open', seed);
}
