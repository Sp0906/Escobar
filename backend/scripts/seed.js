/**
 * Seed Script — creates admin user + 3 sample jersey templates
 *
 * Usage:
 *   node scripts/seed.js           # seed
 *   node scripts/seed.js --clear   # wipe all collections first, then seed
 *
 * Requires: .env with MONGO_URI, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME
 * Note: Jersey images are set to placeholder URLs since we can't upload to
 *       Cloudinary in seed. Replace imageUrl / cloudinaryId after uploading
 *       real images through the Admin panel.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Jersey = require('../models/Jersey');
const ReadyMadeDesign = require('../models/ReadyMadeDesign');

const PLACEHOLDER_IMG = 'https://placehold.co/600x600/1a1a2e/e94560?text=Jersey+Template';
const READYMADE_IMG   = 'https://placehold.co/600x600/16213e/e94560?text=Ready+Made';

const sampleJerseys = [
  {
    name: 'Classic Football Jersey',
    description: 'Clean, classic football template perfect for customization',
    category: 'football',
    basePrice: 599,
    imageUrl: PLACEHOLDER_IMG,
    cloudinaryId: 'seed/football-classic',
    isActive: true,
  },
  {
    name: 'Cricket Test Jersey',
    description: 'Traditional cricket jersey with clean lines',
    category: 'cricket',
    basePrice: 699,
    imageUrl: PLACEHOLDER_IMG,
    cloudinaryId: 'seed/cricket-test',
    isActive: true,
  },
  {
    name: 'Basketball Street',
    description: 'Sleek basketball jersey with modern design',
    category: 'basketball',
    basePrice: 549,
    imageUrl: PLACEHOLDER_IMG,
    cloudinaryId: 'seed/basketball-street',
    isActive: true,
  },
];

const sampleReadyMade = [
  {
    name: 'Team Alpha Kit',
    description: 'Pre-designed team kit in red and black',
    category: 'football',
    price: 799,
    imageUrl: READYMADE_IMG,
    cloudinaryId: 'seed/ready-alpha',
    isActive: true,
  },
  {
    name: 'Champions Cricket Set',
    description: 'Professional-grade cricket jersey with team branding',
    category: 'cricket',
    price: 899,
    imageUrl: READYMADE_IMG,
    cloudinaryId: 'seed/ready-champions',
    isActive: true,
  },
];

async function seed() {
  const clear = process.argv.includes('--clear');

  console.log('\n🌱  Escobar Seed Script\n');

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅  MongoDB connected:', process.env.MONGO_URI);

  if (clear) {
    await Promise.all([
      User.deleteMany({}),
      Jersey.deleteMany({}),
      ReadyMadeDesign.deleteMany({}),
    ]);
    console.log('🗑️   Cleared: Users, Jerseys, ReadyMadeDesigns');
  }

  // ── Admin user ──────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@escobar.com';
  const existing = await User.findOne({ email: adminEmail });

  if (existing) {
    console.log(`ℹ️   Admin already exists: ${adminEmail}`);
  } else {
    const admin = await User.create({
      name: process.env.ADMIN_NAME || 'Admin',
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'admin',
      phone: '9000000000',
    });
    console.log(`✅  Admin created: ${admin.email}  (role: ${admin.role})`);
  }

  // ── Sample jerseys ──────────────────────────────────────
  const adminUser = await User.findOne({ email: adminEmail });
  let jerseyCount = 0;
  for (const j of sampleJerseys) {
    const exists = await Jersey.findOne({ cloudinaryId: j.cloudinaryId });
    if (!exists) {
      await Jersey.create({ ...j, uploadedBy: adminUser._id });
      jerseyCount++;
    }
  }
  console.log(`✅  Jersey templates seeded: ${jerseyCount} new`);

  // ── Ready-made designs ──────────────────────────────────
  let rmCount = 0;
  for (const d of sampleReadyMade) {
    const exists = await ReadyMadeDesign.findOne({ cloudinaryId: d.cloudinaryId });
    if (!exists) {
      await ReadyMadeDesign.create({ ...d, uploadedBy: adminUser._id });
      rmCount++;
    }
  }
  console.log(`✅  Ready-made designs seeded: ${rmCount} new`);

  console.log('\n──────────────────────────────────────');
  console.log('  Seed complete. Login credentials:');
  console.log(`  Email   : ${adminEmail}`);
  console.log(`  Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
  console.log('──────────────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
