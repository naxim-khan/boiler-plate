import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL as string, {
  maxRetriesPerRequest: null,      
  enableReadyCheck: true,
  reconnectOnError: (err) => {
    const target = "READONLY";
    if (err.message.includes(target)) return true;
    return false;
  },
});

redis.on("connect", () => {
  console.log("🟢 Redis connected");
});

redis.on("error", (err) => {
  console.error("🔴 Redis error:", err);
});

export default redis;
