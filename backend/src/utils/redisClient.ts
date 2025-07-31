import { createClient } from "redis";

// Create Redis client with URL from .env
const redis = createClient({
  url: process.env.REDIS_URL,
});

// Log connection errors
redis.on("error", (err) => console.error("❌ Redis error:", err));

(async () => {
  try {
    await redis.connect();
    console.log("✅ Redis connected successfully");
  } catch (err) {
    console.error("❌ Redis connection failed:", err);
  }
})();

export default redis;
