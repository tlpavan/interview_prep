/**
 * Database Configuration
 * Handles MongoDB connection with fallback to JSON for development
 */

import mongoose from "mongoose";
import { env } from "./env.js";

let dbConnected = false;
let connectionError = null;

/**
 * Connect to MongoDB
 */
export async function connectDatabase() {
  const mongoUri = env.DATABASE_URL;

  if (!mongoUri) {
    console.log("📝 No DATABASE_URL configured, using JSON file fallback");
    return false;
  }

  try {
    await mongoose.connect(mongoUri, {
      // Mongoose 6+ uses these options by default
      bufferCommands: true, // Buffer commands until connection is established
      bufferMaxEntries: 0, // Don't buffer more than this
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
      socketTimeoutMS: 45000, // Close sockets after 45s
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 0,
      maxIdleTimeMS: 30000, // Close unused connections after 30s
      autoIndex: env.NODE_ENV !== 'production' // Build indexes automatically in dev
    });

    dbConnected = true;
    console.log("✅ Connected to MongoDB successfully");
    return true;
  } catch (error) {
    connectionError = error;
    console.error("❌ MongoDB connection failed:", error.message);
    console.log("📝 Falling back to JSON file storage");
    dbConnected = false;
    return false;
  }
}

/**
 * Check if MongoDB is connected
 */
export function isDatabaseConnected() {
  return dbConnected;
}

/**
 * Get connection error if any
 */
export function getConnectionError() {
  return connectionError;
}

/**
 * Disconnect from database (for graceful shutdown)
 */
export async function disconnectDatabase() {
  if (dbConnected) {
    await mongoose.disconnect();
    console.log("📤 Disconnected from MongoDB");
    dbConnected = false;
  }
}

// Handle connection events
mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error);
  dbConnected = false;
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
  dbConnected = false;
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected");
  dbConnected = true;
});

// Handle process shutdown
process.on("SIGINT", async () => {
  if (dbConnected) {
    await mongoose.disconnect();
    process.exit(0);
  }
});