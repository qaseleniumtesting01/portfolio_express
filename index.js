const path = require("path");
const url = require("url");
const express = require("express");
const redis = require("redis");
const REDIS_PORT = process.env.PORT || 6397;
const REDISTOGO_URL = process.env.REDISGO_URL;
const REDIS_SET_NAME = "userip";
const REDIS_CNT = "counter";
const TIMEOUT = 1000 * 60 * 10;
// const TIMEOUT = 10 * 1000;
const routerWrapper = require("./routes/api/router");
// Global consts
const HOUR_S = 3600;
const PORT = process.env.PORT || 5000;

// Init app
const app = express();
// when server is behind a proxy
// app.enable("trust proxy");

// Init Redis
let client;
if (REDISTOGO_URL) {
  let rtg = new url.URL(process.env.REDISTOGO_URL);
  console.log("rtg: " + rtg);

  client = redis.createClient(rtg.port, rtg.hostname);
  client.auth(rtg.auth.split(":")[1]);
} else {
  console.log("connected to redis locally");
  client = redis.createClient();
}
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

app.use(express.json());
// Set router
app.use("/", routerWrapper(client, REDIS_SET_NAME, REDIS_CNT));

// Set Static folder
app.use(express.static(path.join(__dirname, "public")));
app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
