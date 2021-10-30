const path = require("path");
const express = require("express");
const redis = require("redis");
const REDIS_PORT = process.env.PORT || 6397;
const REDIS_URL = process.env.REDISGO_URL;
const REDIS_SET_NAME = "userip";
const REDIS_CNT = "counter";
// const TIMEOUT = 1000 * 60 * 10;
const TIMEOUT = 10 * 1000;
const routerWrapper = require("./routes/api/router");
// Global consts
const HOUR_S = 3600;
const PORT = process.env.PORT || 5000;

// Init app
const app = express();
// when server is behind a proxy
// app.enable("trust proxy");

// Init Redis
const client = REDIS_URL ? redis.createClient(REDIS_URL) : redis.createClient();

client.on("connect", () => {
  console.log("redis: connected successfully");
  // Check for existance of a redis counter
  client.EXISTS(REDIS_CNT, (err, found) => {
    if (err) throw err;
    if (!found)
      client.SET(REDIS_CNT, 0, (err, data) =>
        console.log("REDIS counter created")
      );
  });
  // remove all keys with age greater then TIMEOUT
  setInterval(() => {
    const now = Date.now();
    client.ZREMRANGEBYSCORE(REDIS_SET_NAME, 0, now - TIMEOUT);
  }, TIMEOUT);
});

client.on("error", (err) => {
  console.log("Error " + err);
});

// Set router
app.use("/", routerWrapper(client, REDIS_SET_NAME, REDIS_CNT));

// Set Static folder
app.use(express.static(path.join(__dirname, "public")));
app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
