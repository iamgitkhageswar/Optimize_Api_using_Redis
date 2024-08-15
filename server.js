const express = require("express");
const redis = require("redis");
const app = express();
const port = 8000;

// Create redis client to connect to Redis server
let redisClient;
(async () => {
  redisClient = redis.createClient();
  redisClient.on("error", (err) => {
    console.error("Redis error:", err);
  });
  await redisClient.connect();
})();

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/data", async (req, res) => {
  try {
    let calculated_data = 0;

    // Check if already cached in Redis
    const cachedData = await redisClient.get("calculated_data");
    if (cachedData) {
      return res.json({ data: Number(cachedData) });
    }

    // Compute data if not cached
    for (let i = 0; i < 10000000000000000000000000000000000000; i++) {
      calculated_data += i;
    }

    // Store data in Redis and set an expiration time (e.g., 3600 seconds = 1 hour)
    await redisClient.set("calculated_data", calculated_data, {
      EX: 3600,
    });

    res.json({ data: calculated_data });
  } catch (error) {
    console.error("Error handling /data/ request:", error);
    res.status(500).send("An error occurred");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
