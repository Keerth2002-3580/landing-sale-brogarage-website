/**
 * Seeder: dbSeeder.js
 * MVC Layer: Seeder (Database initializer)
 * Responsibility: Seeds the database with initial data when it is empty.
 * Called once on server startup. Should not run if data already exists.
 */

const User = require('../models/User');
const Land = require('../models/Land');
const Agent = require('../models/Agent');
const Payment = require('../models/Payment');

const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) return; // Already seeded

    console.log('No users found. Seeding initial database data...');

    // ── 1. Seed Users ───────────────────────────────────────────────────────
    const admin = await User.create({
      name: 'Admin Manager',
      email: 'admin@lankaland.com',
      password: 'Admin@1234',
      role: 'admin',
      phone: '+94771234567',
    });

    const agentUser = await User.create({
      name: 'Keerthanan Kirubananthan',
      email: 'agent@landmarket.com',
      password: 'password123',
      role: 'agent',
      phone: '+94743426403',
    });

    const regularUser = await User.create({
      name: 'Sanduni Perera',
      email: 'user@landmarket.com',
      password: 'password123',
      role: 'user',
      phone: '+94777654321',
    });

    console.log('✓ Seeded users: admin, agent, user');

    // ── 2. Seed Agent profile ────────────────────────────────────────────────
    await Agent.create({
      userId: agentUser._id,
      verified: true,
      subscriptionPlan: 'premium',
      companyName: 'Lanka Land & Real Estate',
      bio: 'Over 10 years of experience helping clients find the perfect land plots across Sri Lanka.',
      listingsCount: 3,
    });

    console.log('✓ Seeded Agent profile for agent@landmarket.com');

    // ── 3. Seed Payments ─────────────────────────────────────────────────────
    await Payment.create([
      { userId: agentUser._id, amount: 2500, type: 'agent_subscription', status: 'completed' },
      { userId: agentUser._id, amount: 1000, type: 'featured_ad',        status: 'completed' },
    ]);

    console.log('✓ Seeded initial payment records');

    // ── 4. Seed Land listings ────────────────────────────────────────────────
    const landsData = [
      {
        title: 'Prime Residential Land in Kottawa',
        description: 'A beautiful rectangular plot of land situated in a peaceful, secure residential neighbourhood in Kottawa. Just 5 minutes to the highway interchange, close to supermarkets, schools, and hospitals.',
        price: 1500000,
        location: 'Kottawa',
        address: '45/2, High Level Road, Kottawa, Colombo',
        coordinates: { lat: 6.8402, lng: 79.9654 },
        size: 15,
        sizeUnit: 'perch',
        category: 'residential',
        images: ['kottawa-land.jpg'],
        owner: agentUser._id,
        status: 'approved',
        isFeatured: true,
        views: 125,
      },
      {
        title: 'Commercial Land Facing Galle Road, Colombo 03',
        description: 'Premium bare land of 25 perches facing Galle Road in the heart of Colombo 03. Perfect for a high-rise office building, retail showroom, or luxury apartments.',
        price: 12000000,
        location: 'Colombo 03',
        address: 'Galle Road, Kollupitiya, Colombo 03',
        coordinates: { lat: 6.9142, lng: 79.8496 },
        size: 25,
        sizeUnit: 'perch',
        category: 'commercial',
        images: ['colombo-commercial.jpg'],
        owner: agentUser._id,
        status: 'approved',
        isFeatured: true,
        views: 310,
      },
      {
        title: '5-Acre Organic Tea Estate in Kandy',
        description: 'Beautiful agricultural land on a mountain slope in Kandy. Cultivated with premium organic green tea and spices.',
        price: 18000000,
        location: 'Kandy',
        address: 'Udispattuwa Road, Kandy',
        coordinates: { lat: 7.2906, lng: 80.6337 },
        size: 5,
        sizeUnit: 'acre',
        category: 'agriculture',
        images: ['kandy-tea.jpg'],
        owner: agentUser._id,
        status: 'approved',
        isFeatured: false,
        views: 94,
      },
      {
        title: 'Residential Plot near Negombo Beach',
        description: 'A 10-perch plot located within walking distance of the Negombo beach park. Close to top seafood restaurants, hotels, and 20 minutes to the international airport.',
        price: 1800000,
        location: 'Negombo',
        address: 'Lewis Place, Negombo',
        coordinates: { lat: 7.2111, lng: 79.8386 },
        size: 10,
        sizeUnit: 'perch',
        category: 'residential',
        images: ['negombo-beach.jpg'],
        owner: regularUser._id,
        status: 'approved',
        isFeatured: false,
        views: 65,
      },
    ];

    await Land.create(landsData);
    console.log('✓ Seeded 4 sample approved land listings');
    console.log('✅ Database seeding complete.');

  } catch (err) {
    console.error('❌ Error seeding database:', err.message);
  }
};

module.exports = seedDatabase;
