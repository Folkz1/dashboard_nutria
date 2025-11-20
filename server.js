import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';

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

// Routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/wrapped', wrappedRoutes);

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
  console.log(`🚀 NutrIA Dashboard API running on port ${PORT}`);
  console.log(`📊 WebSocket server ready`);
});
