import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './utils/db.js';
import { User } from './models/User.js';
import { seedDatabase } from './seed/seedRunner.js';

import authRoutes from './routes/authRoutes.js';
import planRoutes from './routes/planRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import demoRoutes from './routes/demoRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & utility middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/demo', demoRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    product: 'Campus 2.0',
    thesis: 'People say yes. Plans still fall apart. Campus 2.0 owns the plan until it happens.',
    timestamp: new Date().toISOString(),
  });
});

// Central error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[server error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

async function startServer() {
  try {
    await connectDB();

    // Auto-seed if database is empty so prototype is immediately alive
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[server] Database empty. Running initial campus seed...');
      await seedDatabase();
    } else {
      console.log(`[server] Database ready with ${userCount} campus student profiles.`);
    }

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`⚡ Campus 2.0 REST API running on http://localhost:${PORT}`);
      console.log(`🎓 Seeded for MANIT Bhopal · Product Verse 2026`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('[server] Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
