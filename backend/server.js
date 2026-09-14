import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, getDbStatus } from './config/db.js';
import { FloodGuardDataStore } from './services/telemetrySimulator.js';
import { createStationRoutes } from './routes/stationRoutes.js';
import { createTelemetryRoutes } from './routes/telemetryRoutes.js';
import { createAlertRoutes } from './routes/alertRoutes.js';
import { createLogRoutes } from './routes/logRoutes.js';
import { createAiRoutes } from './routes/aiRoutes.js';
import { authRouter } from './routes/authRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure CORS for Express and Socket.IO
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', '*'];

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Initialize Data Store & Telemetry Simulator with Socket.IO
const dataStore = new FloodGuardDataStore(io);

// Connect Database (Async with safe fallback)
connectDB();

// Mount API Routes
app.use('/api/auth', authRouter);
app.use('/api/stations', createStationRoutes(dataStore));
app.use('/api/telemetry', createTelemetryRoutes(dataStore));
app.use('/api/alerts', createAlertRoutes(dataStore));
app.use('/api/logs', createLogRoutes(dataStore));
app.use('/api/ai', createAiRoutes(dataStore));

// System Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'FloodGuard AI Municipal Backend Engine',
    version: '1.0.0',
    database: getDbStatus(),
    activeStations: dataStore.getStations().length,
    activeScenario: dataStore.scenario,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Socket.IO Real-time Connection Handler
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // Send initial snapshot
  socket.emit('telemetry:init', {
    stations: dataStore.getStations(),
    alerts: dataStore.getAlerts(),
    logs: dataStore.getResponseLogs(),
    scenario: dataStore.scenario
  });

  socket.on('request:snapshot', () => {
    socket.emit('telemetry:init', {
      stations: dataStore.getStations(),
      alerts: dataStore.getAlerts(),
      logs: dataStore.getResponseLogs(),
      scenario: dataStore.scenario
    });
  });

  socket.on('scenario:set', (scenarioName) => {
    dataStore.setScenario(scenarioName);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🌊 FloodGuard AI Municipal Backend Server Active`);
  console.log(`📡 Listening on: http://localhost:${PORT}`);
  console.log(`⚡ WebSocket / Socket.IO Live Stream Initialized`);
  console.log(`====================================================`);
});
