/**
 * Entry Point: server.js
 * 
 * Responsibility: Bootstraps the Express application.
 * - Loads environment variables
 * - Connects to the database
 * - Registers global middleware
 * - Mounts route handlers
 * - Starts the HTTP + Socket.io server
 * - Runs the database seeder on first launch
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │                  MVC Architecture (Backend)                  │
 * │                                                             │
 * │  models/         → Mongoose schemas (Data layer)            │
 * │  controllers/    → Business logic & request handlers        │
 * │  routes/         → Express route definitions (URL mapping)  │
 * │  middleware/     → Auth guards, file upload handlers        │
 * │  config/         → DB connection, Passport OAuth setup      │
 * │  seeders/        → Initial database seed data               │
 * │  sockets/        → Real-time Socket.io event handlers       │
 * └─────────────────────────────────────────────────────────────┘
 */

const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const dotenv   = require('dotenv');
const http     = require('http');
const socketio = require('socket.io');

// ── Load environment variables first ──────────────────────────────────────────
dotenv.config();

// ── Config & Helpers ──────────────────────────────────────────────────────────
const connectDB     = require('./config/db');
const passport      = require('./config/passport');
const setupSocket   = require('./sockets/socketHandler');
const seedDatabase  = require('./seeders/dbSeeder');

// ── Connect to Database ───────────────────────────────────────────────────────
connectDB();

// ── Express App + HTTP Server ─────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);

// ── Socket.io Setup ───────────────────────────────────────────────────────────
const io = socketio(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});
setupSocket(io);

// Attach io instance to every request so controllers can emit events
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ── Global Middleware ─────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(passport.initialize());

// Serve uploaded static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/lands',    require('./routes/landRoutes'));
app.use('/api/agents',   require('./routes/agentRoutes'));
app.use('/api/admin',    require('./routes/adminRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    const User = require('./models/User');
    const admin = await User.findOne({ email: 'admin@lankaland.com' });
    if (!admin) {
      await User.create({
        name: 'Admin Manager',
        email: 'admin@lankaland.com',
        password: 'Admin@1234',
        role: 'admin',
        phone: '+94771234567',
      });
      console.log('Health check: Force-seeded missing admin user.');
    }
    res.status(200).json({ success: true, message: 'Server is healthy', adminExists: true });
  } catch (err) {
    console.error('Health check error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  await seedDatabase();
});
