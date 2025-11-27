import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import notFound from '../middlewares/notFound.js';
import errorHandler from '../middlewares/errorHandler.js';
import jsonErrorHandler from '../middlewares/jsonErrorHandler.js'; // Add this
import apiV1Routes from "../routes/index.js"
import { setupSwagger } from '../swagger.js';

const app = express();

// Security middleware first
app.use(helmet());

// CORS configuration
app.use(cors({ 
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true 
}));

// Compression
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // limit each IP
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
    code: 'RATE_LIMITED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing with size limits
app.use(express.json({ 
  limit: process.env.MAX_JSON_SIZE || '10mb' 
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: process.env.MAX_URL_ENCODED_SIZE || '10mb' 
}));

// JSON error handler - MUST be after express.json()
app.use(jsonErrorHandler);

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ⚡ Swagger UI
setupSwagger(app);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mount All version 1 Api's
app.use('/api/', apiV1Routes);

// 404 handler - must be after routes
app.use(notFound);

// Global error handler - must be last
app.use(errorHandler);

export default app;