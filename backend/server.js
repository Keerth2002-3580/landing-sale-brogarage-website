const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./config/db');
const http = require('http');
const socketio = require('socket.io');
const passport = require('./config/passport');

// Load environment variables
// (dotenv config moved to top)

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Attach socket.io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(userId.toString());
      console.log(`User ${userId} joined their private room`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

// Passport OAuth Middleware
app.use(passport.initialize());

// Serve static uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/lands', require('./routes/landRoutes'));
app.use('/api/agents', require('./routes/agentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));

// Simple health check endpoint & database admin force-seeder
app.get('/api/health', async (req, res) => {
  try {
    const User = require('./models/User');
    let admin = await User.findOne({ email: 'admin@lankaland.com' });
    let created = false;
    if (!admin) {
      admin = await User.create({
        name: 'Admin Manager',
        email: 'admin@lankaland.com',
        password: 'Admin@1234',
        role: 'admin',
        phone: '+94771234567',
      });
      console.log('Force seeded admin user: admin@lankaland.com');
      created = true;
    }
    res.status(200).json({ success: true, message: 'Server is healthy', adminExists: true, newlyCreated: created });
  } catch (err) {
    console.error('Health check admin seed error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Server Error',
  });
});

// Database Auto-Seeding
const seedDatabase = async () => {
  try {
    const User = require('./models/User');
    const Land = require('./models/Land');
    const Agent = require('./models/Agent');
    const Payment = require('./models/Payment');

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('No users found. Seeding initial database data...');

      // 1. Create Users
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

      console.log('Seeded users: admin@landmarket.com, agent@landmarket.com, user@landmarket.com');

      // 2. Create Agent record
      const agent = await Agent.create({
        userId: agentUser._id,
        verified: true,
        subscriptionPlan: 'premium',
        companyName: 'Lanka Land & Real Estate',
        bio: 'Over 10 years of experience helping clients find the perfect land plots across Sri Lanka.',
        listingsCount: 3,
      });
      console.log('Seeded Agent profile for agent@landmarket.com');

      // 3. Create mock payments
      await Payment.create([
        { userId: agentUser._id, amount: 2500, type: 'agent_subscription', status: 'completed' },
        { userId: agentUser._id, amount: 1000, type: 'featured_ad', status: 'completed' },
      ]);
      console.log('Seeded initial payment records');

      // 4. Create Approved sample lands
      const landsData = [
        {
          title: 'Prime Residential Land in Kottawa',
          description: 'A beautiful rectangular plot of land situated in a peaceful, secure residential neighbourhood in Kottawa. Just 5 minutes to the highway interchange, close to supermarkets, schools, and hospitals. Highly suitable for building your dream home. Clear deeds, water, and electricity connections are already available.',
          price: 1500000, // per perch
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
          description: 'Premium bare land of 25 perches facing Galle Road in the heart of Colombo 03 (Kollupitiya). Perfect for a high-rise office building, retail showroom, corporate headquarters, or luxury apartments. Surrounded by business centers, top restaurants, and luxury hotels. Excellent commercial value and exposure.',
          price: 12000000, // per perch
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
          description: 'Beautiful agricultural land situated on a mountain slope in Kandy, currently cultivated with premium organic green tea and spices (cinnamon, pepper). Panoramic view of the mountain ranges, with clear running water springs inside the land. Good road access, electricity, and basic worker quarters. Perfect investment for agro-tourism or farming.',
          price: 18000000, // total price
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
          description: 'A 10-perch plot of land located within walking distance of the Negombo beach park. Situated in a tourists-friendly locality. Highly suitable for a holiday villa, guesthouse, or residential home. Close to top seafood restaurants, hotels, and only 20 minutes to the international airport.',
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
      console.log('Seeded 4 sample approved land listings');
    }
  } catch (err) {
    console.error('Error seeding database:', err.message);
  }
};

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  await seedDatabase();
});
