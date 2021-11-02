const path = require("path");
const url = require("url");
const express = require("express");
const redis = require("redis");
const cookieParser = require("cookie-parser");
const mailer = require("./js/mailer");
const REDISTOGO_URL = process.env.REDISTOGO_URL;

// Global consts
const REDIS_SET_NAME = "users";
const REDIS_CNT = "counter";
const MIN = 1000 * 60;
const HOUR = MIN * 60;
const TIMEOUT = MIN * 10;
const PORT = process.env.PORT || 5000;

// const TIMEOUT = 10 * 1000;
const routerWrapper = require("./routes/api/router");

// Init app
const app = express();

// when server is behind a proxy
// app.enable("trust proxy");

// Init Redis
let client;
if (REDISTOGO_URL) {
  let rtg = url.parse(REDISTOGO_URL);
  client = redis.createClient(rtg.port, rtg.hostname);
  client.auth(rtg.auth.split(":")[1]);
} else {
  client = redis.createClient();
}
client.on("connect", () => {
  console.log("REDIS: connected successfully");
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
app.use(cookieParser());

// Use heroku env variables
const auth = {
  email: process.env.MAIL_USER,
  password: process.env.MAIL_PASS,
};

// redirect http to https requests
app.use((req, res, next) => {
  if (req.header("x-forwarded-proto") !== "https") {
    res.redirect(`https://${req.header("host")}${req.url}`);
  } else {
    next();
  }
});

// Set router
app.use("/", routerWrapper(client, REDIS_SET_NAME, REDIS_CNT, auth));

// Set Static folder
app.use(express.static(path.join(__dirname, "public")));
app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));

setInterval(() => {
  redis.GET(REDIS_CNT, (err, data) => {
    mailer(
      `${process.env.SEND_TO_MAIL}`,
      "Daily Report",
      `Total Visitors:${data}`,
      auth
    );
  });
}, HOUR * 24);
