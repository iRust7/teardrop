import express from 'express';
import cors from 'cors';
import { config } from './src/config/database.js';
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler.js';
import { StatusService } from './src/services/statusService.js';

// Routes
import authRoutes from './src/routes/auth.js';
import userRoutes from './src/routes/users.js';
import messageRoutes from './src/routes/messages.js';

const app = express();

// Middleware
app.use(cors({
  origin: config.nodeEnv === 'production' 
    ? config.frontendUrl 
    : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Teardrop Chat Backend is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Teardrop Chat API',
    version: '1.0.0',
    description: 'Real-time chat application backend',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      messages: '/api/messages'
    }
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log('\n🚀 Teardrop Chat Backend');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${config.nodeEnv}`);
  console.log(`✓ Frontend URL: ${config.frontendUrl}`);
  console.log('\n📡 API Endpoints:');
  console.log(`   • Health: http://localhost:${PORT}/health`);
  console.log(`   • Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   • Users: http://localhost:${PORT}/api/users`);
  console.log(`   • Messages: http://localhost:${PORT}/api/messages`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Start user status monitoring
  StatusService.startMonitoring();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  process.exit(0);
});

export default app;
