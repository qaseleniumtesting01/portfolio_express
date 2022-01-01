const path = require("path");
const http = require("http");
const url = require("url");
const express = require("express");
const redis = require("redis");
const exphbs = require("express-handlebars");
const cookieParser = require("cookie-parser");
const createMailer = require("./utils/create-mailer");

// Global consts
const REDISTOGO_URL = process.env.REDISTOGO_URL;
const REDIS_DATA_SET = "data";
const REDIS_MAIL_LIST = "mail";
const ANALYTICS = process.env.ANALYTICS;
const MIN = 1000 * 60;
const HOUR = MIN * 60;
const TIMEOUT = MIN * 10;
const PORT = process.env.PORT || 5000;

// const TIMEOUT = 10 * 1000;
const routerWrapper = require("./routes/router");

// Init app
const app = express();

// when server is behind a proxy
app.enable("trust proxy");

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
});

client.on("error", (err) => {
  console.log("Error " + err);
});

// Init handlebars
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main",
    helpers: {
      analytics: ANALYTICS,
    },
  })
);
app.set("view engine", "handlebars");

// Init Middleware
app.use(express.json());
app.use(cookieParser());

// Redirect http to https requests
if (process.env.NODE_ENV === "production")
  app.use((req, res, next) => {
    if (req.header("x-forwarded-proto") !== "https") {
      res.redirect(`https://${req.header("host")}${req.url}`);
    } else {
      next();
    }
  });

// Use heroku env variables as nodemailer options
if (process.env.NODE_ENV !== "production") require("dotenv").config();
const auth = {
  email: process.env.MAIL_USER,
  password: process.env.MAIL_PASS,
};

const sendMail = createMailer(
  {
    name: "Gabriel Ladzaretti - Auto",
    address: auth.email,
  },
  auth
);

// Ping self
const pingSelf = () => {
  const options = {
    host: process.env.HOST,
    port: 80,
    path: "/",
  };
  http.get(options, (res) => {
    res
      .on("data", (chunk) => {
        try {
          console.log("HEROKU RESPONSE: " + chunk);
        } catch (err) {
          console.log(err.message);
        }
      })
      .on("error", function (err) {
        console.log("Error: " + err.message);
      });
  });
};

if (process.env.NODE_ENV === "production") {
  setInterval(pingSelf, MIN * 20);
}

// Mail daily report
const getDailyReport = () => {
  redis.GET(REDIS_MAIL_LIST, (err, data) => {
    sendMail(
      `${process.env.MAIL_RECIPIENT}`,
      "Daily Report",
      `Total Visitors:${data}`
    );
  });
};
setInterval(getDailyReport, HOUR * 24);

// Set router
app.use(
  "/",
  routerWrapper(client, REDIS_DATA_SET, REDIS_MAIL_LIST, auth, ANALYTICS)
);

// Set Static folder
app.use(express.static(path.join(__dirname, "public")));
app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
