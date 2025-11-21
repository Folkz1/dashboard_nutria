import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import analyticsRoutes from './routes/analytics.js';
import usersRoutes from './routes/users.js';
import conversationsRoutes from './routes/conversations.js';
import alertsRoutes from './routes/alerts.js';
import publicRoutes from './routes/public.js';
import wrappedRoutes from './routes/wrapped.js';

// Services
import { startRealtimeUpdates } from './services/realtime.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/wrapped', wrappedRoutes);

// Serve static files from frontend build
const frontendDistPath = path.join(__dirname, 'frontend', 'dist');
app.use(express.static(frontendDistPath, {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// Serve index.html for all non-API routes (SPA support)
app.get('*', (req, res) => {
  // Skip API routes and health check
  if (req.path.startsWith('/api/') || req.path === '/health') {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  
  // Send index.html for all other routes (SPA)
  const indexPath = path.join(frontendDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(500).send('Error loading application');
    }
  });
});

// WebSocket connection
wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  
  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
  });
});

// Start realtime updates
startRealtimeUpdates(wss);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 NutrIA Dashboard running on port ${PORT}`);
  console.log(`📊 WebSocket server ready`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
});
