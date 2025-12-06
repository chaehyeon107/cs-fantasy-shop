const { createClient } = require("redis");
const { REDIS_URL } = require("./env");

const redisClient = createClient({ url: REDIS_URL });

redisClient.on("error", (err) => {
  console.error("❌ Redis Error:", err);
});

async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("✅ Connected to Redis");
  }
}

module.exports = { redisClient, connectRedis };
