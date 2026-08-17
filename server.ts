import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import { adminAnalyticsRouter } from './server/api/adminAnalytics.js';
import { adminAuthRouter } from './server/api/adminAuth.js';
import { adminOrdersRouter } from './server/api/adminOrders.js';
import { adminSellersRouter } from './server/api/adminSellers.js';
import { adminSlotsRouter } from './server/api/adminSlots.js';
import { preordersRouter } from './server/api/preorders.js';
import { productsRouter } from './server/api/products.js';
import { uploadRouter } from './server/api/upload.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(cors({
    origin: true,
    credentials: true,
  }));
  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // API Health Check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'UP Festive Foods MVP API',
      timestamp: new Date().toISOString(),
    });
  });

  // Public Auth Configuration
  app.get('/api/config/auth', (req: Request, res: Response) => {
    res.json({
      clerkPublishableKey:
        process.env.VITE_CLERK_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
        'pk_test_bmVhdC13aGFsZS00NjUwLmNsZXJrLmFjY291bnRzLmRldiQ',
    });
  });

  // Mount API Routers
  app.use('/api', productsRouter);
  app.use('/api', preordersRouter);
  app.use('/api', uploadRouter);
  app.use('/api', adminAuthRouter);
  app.use('/api', adminOrdersRouter);
  app.use('/api', adminSellersRouter);
  app.use('/api', adminSlotsRouter);
  app.use('/api', adminAnalyticsRouter);

  // Error handling middleware for API
  app.use('/api/*', (req: Request, res: Response) => {
    res.status(404).json({ error: `API route ${req.method} ${req.originalUrl} not found.` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[UP Festive Foods] Server started successfully on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[UP Festive Foods] Failed to start server:', err);
});
