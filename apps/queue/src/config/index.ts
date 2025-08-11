import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

// Simple configuration object
export const config = {
  server: {
    port: Number(process.env.PORT) || 3001,
    host: process.env.HOST || "localhost",
    nodeEnv: process.env.NODE_ENV || "development",
  },
  
  database: {
    mongoUri: process.env.MONGODB_URI || "",
    redis: {
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      db: Number(process.env.REDIS_DB) || 0,
    },
  },
  
  notification: {
    maxRetries: Number(process.env.NOTIFICATION_MAX_RETRIES) || 3,
    defaultPriority: Number(process.env.NOTIFICATION_DEFAULT_PRIORITY) || 5,
    queueCleanup: {
      completed: Number(process.env.QUEUE_CLEANUP_COMPLETED) || 100,
      failed: Number(process.env.QUEUE_CLEANUP_FAILED) || 50,
    },
  },

  transport: {
    jwt: {
      secret: process.env.TRANSPORT_JWT_SECRET || "",
    },
  },
};


// Simple validation
if (!config.database.mongoUri) {
  console.error("❌ MONGODB_URI is required");
  process.exit(1);
}

if (!config.transport.jwt.secret) {
  console.error("❌ TRANSPORT_JWT_SECRET is required");
  process.exit(1);
}

// Helper functions
export const isProduction = () => config.server.nodeEnv === "production";
export const isDevelopment = () => config.server.nodeEnv === "development";
