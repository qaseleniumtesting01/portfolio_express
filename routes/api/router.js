const path = require("path");
const express = require("express");
const createMailer = require("../../utils/create-mailer");
const crypto = require("crypto");
const geoip = require("geoip-lite");
const MIN = 1000 * 60;

// router wrapper
function wrapper(redis, dbStats, dbMail, auth, mgmtRoute) {
  const sendMail = createMailer(
    {
      name: "Gabriel Ladzaretti - Auto",
      address: auth.email,
    },
    auth
  );

  const router = express.Router();
  router.get("/", (req, res) => {
    if (!req.cookies.userID) {
      const userID = crypto.randomBytes(16).toString("hex");
      res.cookie("userID", userID, {
        expires: new Date(Date.now() + MIN * 10),
      });
      // Update Stats list
      let ip = req.ip;
      if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7);
      }
      const geo = geoip.lookup(ip);
      const time = new Date()
        .toLocaleString("he-IL", {
          timeZone: "Asia/Jerusalem",
        })
        .replace(", ", " | ");
      const entry = `${geo.country} | ${geo.city} | ${time}`;
      redis.RPUSH(dbStats, entry);
    }
    res.sendFile(path.join(__dirname, "/../../", "public", "index.html"));
  });

  // Contact Me Form handler
  router.post("/", async (req, res) => {
    const msg = JSON.stringify(req.body);
    redis.RPUSH("mail", msg);
    try {
      sendMail(
        `${process.env.MAIL_RECIPIENT}`,
        "New Message",
        `
      name: ${req.body.name}
      email: ${req.body.email}
      phone: ${req.body.phone}
      message: ${req.body.message}`
      );
    } catch (error) {
      console.log("form submission error");
      console.log(error);
    }
    res.sendStatus(200);
  });

  // Show mgmt
  router.get(`/${mgmtRoute}/`, (req, res) => {
    redis.LRANGE(dbStats, 0, -1, (err, items) => {
      if (err) throw err;
      res.render("home");
    });
  });

  // Get Stats
  router.get(`/${mgmtRoute}/stats`, (req, res) => {
    redis.LRANGE(dbStats, 0, -1, (err, items) => {
      if (err) throw err;
      res.render("stats", {
        len: items.length,
        items,
      });
    });
  });

  // Reset Mail list
  router.get(`/${mgmtRoute}/stats/reset`, (req, res) => {
    redis.DEL(dbStats, (err, data) => {
      if (err) throw err;
      res.render("reset", {
        msg: "Reset Done! Stats list deleted",
      });
    });
  });

  // Get Mail backup
  router.get(`/${mgmtRoute}/emails`, (req, res) => {
    redis.LRANGE(dbMail, 0, -1, (err, items) => {
      if (err) throw err;
      res.render("emails", {
        len: items.length,
        objs: items.map((str) => JSON.parse(str)),
      });
    });
  });

  // Reset Mail list
  router.get(`/${mgmtRoute}/emails/reset`, (req, res) => {
    redis.DEL(dbMail, (err, data) => {
      if (err) throw err;
      res.render("reset", {
        msg: "Reset Done! Mail backup deleted",
      });
    });
  });

  return router;
}

module.exports = wrapper;
