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

// Middleware - CORS must be first
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = config.nodeEnv === 'production' 
      ? [
          config.frontendUrl,
          'https://teardrop-gamma.vercel.app',
          'https://teardrop-production.vercel.app',
          'https://teardrop.vercel.app'
        ].filter(Boolean).flat()
      : [
          'http://localhost:3000', 
          'http://localhost:3001', 
          'http://localhost:5173', 
          'http://127.0.0.1:5173', 
          'http://127.0.0.1:3000', 
          'http://127.0.0.1:3001',
          'https://teardrop-gamma.vercel.app'
        ];
    
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.some(allowed => origin.includes(allowed.replace('https://', '')))) {
      console.log('[CORS] Allowed origin:', origin);
      callback(null, true);
    } else {
      console.log('[CORS] ⛔ Blocked origin:', origin);
      console.log('[CORS] Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
}));

// Body parsers - but NOT for file upload routes (multer handles those)
app.use((req, res, next) => {
  if (req.path.includes('/upload')) {
    // Skip body parsing for upload routes - multer will handle it
    return next();
  }
  express.json()(req, res, next);
});
app.use((req, res, next) => {
  if (req.path.includes('/upload')) {
    return next();
  }
  express.urlencoded({ extended: true })(req, res, next);
});

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const origin = req.headers.origin || 'no-origin';
  console.log(`[${timestamp}] ${req.method} ${req.path} - Origin: ${origin}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Trustdrop Chat Backend is running',
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
    name: 'Trustdrop Chat API',
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
  console.log('\n🚀 Trustdrop Chat Backend');
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
  
  // Test Gmail connection for OTP
  testEmailService();
  
  // Start user status monitoring
  StatusService.startMonitoring();
});

// Test email service on startup
async function testEmailService() {
  try {
    const { testEmailConnection } = await import('./src/utils/emailService.js');
    const isConnected = await testEmailConnection();
    if (isConnected) {
      console.log('📧 Gmail OTP Service: ✓ Connected');
      console.log(`   • Email: ${process.env.GMAIL_USER}`);
    } else {
      console.log('⚠️  Gmail OTP Service: Not configured');
      console.log('   • OTP will fallback to console log (development mode)');
    }
  } catch (error) {
    console.log('⚠️  Gmail OTP Service: Not configured');
    console.log('   • See GMAIL_OTP_SETUP.md for setup instructions');
  }
}

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
