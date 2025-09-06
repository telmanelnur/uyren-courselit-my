import Redis from "ioredis";

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is not defined in environment variables");
}

export const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  connectTimeout: 10000,
  commandTimeout: 5000,
});
