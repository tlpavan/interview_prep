/**
 * Database Configuration
 * Uses MongoDB in production and falls back to JSON only in development/test
 */

import mongoose from "mongoose";
import { env } from "./env.js";

let dbConnected = false;
let connectionError = null;

export async function connectDatabase() {
  const mongoUri = env.DATABASE_URL;
  const isProduction = env.NODE_ENV === "production";

  if (!mongoUri) {
    if (isProduction) {
      throw new Error("DATABASE_URL is required in production");
    }
    console.log("No DATABASE_URL configured, using JSON file fallback");
    return false;
  }

  try {
    await mongoose.connect(mongoUri, {
      bufferCommands: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 0,
      maxIdleTimeMS: 30000,
      autoIndex: env.NODE_ENV !== "production"
    });

    dbConnected = true;
    connectionError = null;
    console.log("Connected to MongoDB successfully");
    return true;
  } catch (error) {
    connectionError = error;
    console.error("MongoDB connection failed:", error.message);
    if (isProduction) {
      throw error;
    }
    console.log("Falling back to JSON file storage");
    dbConnected = false;
    return false;
  }
}

export function isDatabaseConnected() {
  return dbConnected;
}

export function getConnectionError() {
  return connectionError;
}

export async function disconnectDatabase() {
  if (dbConnected) {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    dbConnected = false;
  }
}

mongoose.connection.on("error", error => {
  console.error("MongoDB connection error:", error);
  dbConnected = false;
  connectionError = error;
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
  dbConnected = false;
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected");
  dbConnected = true;
});

process.on("SIGINT", async () => {
  if (dbConnected) {
    await mongoose.disconnect();
    process.exit(0);
  }
});
