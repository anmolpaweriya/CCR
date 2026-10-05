import express from 'express';
import cors from 'cors';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { User } from './models/User.js';
import { seedDatabase } from './seed/seedData.js';

const app = express();

// Middleware
app.use(
  cors({
    origin: [ENV.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CCR API',
    timestamp: new Date().toISOString(),
    demoMode: ENV.DEMO_PAYMENT_MODE,
  });
});

// API Routes
app.use('/api', routes);

// Global Error Handler
app.use(errorHandler);

// Start server
const start = async () => {
  await connectDB();

  // Auto-seed if database is empty
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('⚡ Empty database detected. Auto-seeding initial community data...');
    await seedDatabase();
  }

  app.listen(ENV.PORT, () => {
    console.log(`🚀 CCR Server running on port ${ENV.PORT}`);
    console.log(`🔗 API Base: http://localhost:${ENV.PORT}/api`);
    console.log(`💚 Community Economy: Cash & Goodwill Credits Active`);
  });
};

start();
