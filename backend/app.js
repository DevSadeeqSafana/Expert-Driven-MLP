import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './models/index.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import expertRoutes from './routes/expertRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dynamic logging middleware for testing
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/experts', expertRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);

// Endpoint for client-side logging/errors
app.post('/api/logs', (req, res) => {
  const { level, message, details, timestamp, device } = req.body;
  const time = timestamp ? new Date(timestamp).toLocaleTimeString() : new Date().toLocaleTimeString();
  const border = '='.repeat(50);
  
  console.log(`\n${border}`);
  console.log(`[CLIENT ${level?.toUpperCase() || 'LOG'}] at ${time}`);
  if (message) console.log(`Message: ${message}`);
  if (device) console.log(`Device: ${device.platform || 'unknown'} (OS: ${device.osVersion || 'unknown'})`);
  if (details) {
    console.log('Details:', JSON.stringify(details, null, 2));
  }
  console.log(`${border}\n`);
  
  res.status(200).json({ success: true });
});

// Base route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Expert-Driven Mobile Learning Platform API!',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database Synchronization & Server Startup
const startServer = async () => {
  try {
    // Authenticate database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync database models (creates tables only if they don't exist, safe for existing data)
    await sequelize.sync({ force: false });
    console.log('Database schema synchronized successfully.');

    // Seed default administrator account if none exists
    await seedAdminUser();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database or start server:', error);
    process.exit(1);
  }
};

// Seed administrative user for testing routes
import bcrypt from 'bcryptjs';
import { User } from './models/index.js';

const seedAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ where: { role: 'admin' } });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      await User.create({
        fullname: 'Platform Administrator',
        email: 'admin@mlp.com',
        password: hashedPassword,
        role: 'admin',
        is_verified: true
      });
      console.log('Default administrator user seeded (admin@mlp.com / admin123)');
    }
  } catch (error) {
    console.error('Failed to seed admin user:', error);
  }
};

startServer();
