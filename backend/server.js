import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import winston from "winston";

import interviewRoutes from "./routes/interview.routes.js";
import resumeRoutes from "./routes/resume.routes.js";
import careerRoutes from "./routes/career.routes.js";
import authRoutes from "./routes/auth.routes.js";
import emailRoutes from "./controllers/email.controller.js";
import { env } from "./config/env.js";
import { connectDatabase, disconnectDatabase, isDatabaseConnected } from "./config/database.js";

console.log("🔧 Loading server.js with updated routes...");

// Resolve directories for static file serving and Swagger docs
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Console logging setup
const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'interview-prep-backend' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Global error handlers
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});
process.on("uncaughtException", error => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

const app = express();

// Debug test route
app.get('/test123', (req, res) => {
  res.send('TEST ROUTE OK');
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "https://unpkg.com"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  } : false
}));

// CORS configuration
const corsOrigins = env.CORS_ORIGIN ? env.CORS_ORIGIN.split(',') : ['http://localhost:8080', 'http://localhost:3000'];
app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

// Compression
app.use(compression());

// Body parsing with increased limits
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Request logging middleware
app.use((req, _res, next) => {
  logger.debug(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Simple test endpoint (before rate limiting to avoid any interference)
app.get("/api/test/ping", (req, res) => {
  res.json({ ping: "pong"});
});

// Rate limiting per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter rate limiting for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: "API rate limit exceeded, please try again later." }
});

app.use("/api/", generalLimiter);
app.use("/api/interview", apiLimiter);
app.use("/api/resume", apiLimiter);
app.use("/api/career", apiLimiter);

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    persistence: isDatabaseConnected() ? "mongodb" : "json-fallback",
    databaseConnected: isDatabaseConnected()
  });
});

// Debug: direct dashboard route
app.get("/dashboard", (req, res) => {
  console.log("🔥 Dashboard route matched!");
  res.sendFile(path.join(clientRoot, "dashboard.html"));
});

// API routes
app.use("/api/interview", interviewRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/career", careerRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/email", emailRoutes);

// Serve static files
const clientRoot = path.resolve(__dirname, "..");

// Explicit routes for HTML pages to ensure correct serving
const htmlPages = ['dashboard', 'forgot-password', '404', 'docs', 'profile', 'resume', 'technical', 'hr', 'career', 'dsa-practice', 'aptitude-practice', 'prep-library'];
for (const page of htmlPages) {
  app.get(`/${page}`, (req, res) => {
    console.log(`[Route] Serving ${page}.html`);
    res.sendFile(path.join(clientRoot, `${page}.html`));
  });
}

app.use(express.static(clientRoot, {
  maxAge: env.NODE_ENV === 'production' ? '1h' : '0',
  etag: true,
  lastModified: true,
  extensions: ['html'] // Try .html extension for any other routes
}));

// SPA fallback for client-side routing (Express 5 compatible)
// Using regex to avoid path-to-regexp 1.x parsing issues with wildcards
app.get(/^\/(?!api\/).*$/, (_req, res) => {
  // For any route that's not an API or static file, serve index.html
  res.sendFile(path.join(clientRoot, "index.html"));
});

// Error handler
app.use((error, _req, res, _next) => {
  logger.error("Express error:", {
    message: error.message,
    stack: error.stack,
    url: _req.url,
    method: _req.method
  });

  const status = error.status || error.statusCode || 500;
  const message = error.message || "Internal server error";

  // Don't expose internal errors in production
  if (env.NODE_ENV === 'production' && status === 500) {
    res.status(500).json({
      error: "Something went wrong",
      requestId: _req.headers['x-request-id'] || Date.now()
    });
  } else {
    res.status(status).json({
      error: message,
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    });
  }
});

const port = Number(env.PORT) || 5000;

// Connect to database and then start server
const startServer = async () => {
  try {
    // Connect to database (MongoDB or fallback to JSON)
    await connectDatabase();

    const server = app.listen(port, () => {
      logger.info(`🚀 Backend running on port ${port} (${env.NODE_ENV})`);
      if (isDatabaseConnected()) {
        logger.info("📊 Using MongoDB for data persistence");
      } else {
        logger.info("📝 Using JSON file for data persistence");
      }
    });

    return server;
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

const server = await startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: shutting down');
  server.close(() => {
    logger.info('HTTP server closed');
  });
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: shutting down');
  server.close(() => {
    logger.info('HTTP server closed');
  });
  await disconnectDatabase();
  process.exit(0);
});
