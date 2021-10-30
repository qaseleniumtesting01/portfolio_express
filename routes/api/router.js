const path = require("path");
const express = require("express");
const nodemailer = require("nodemailer");

async function mail(msg) {
  // create reusable transporter object using the default SMTP transport
  let smtpTransport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // use SSL
    auth: {
      user: "form.ladzaretti@gmail.com",
      pass: "YX3DIMR6dZVCpC71YX3DIahI8AYJY",
    },
  });

  // send mail with defined transport object
  let info = await smtpTransport.sendMail({
    from: '"Gabriel Ladzaretti" <form.ladzaretti@gmail.com>',
    to: "gabriel.ladzaretti@gmail.com",
    subject: "New Message",
    text: msg,
  });

  console.log("Message sent: %s", info.messageId);
}

function wrapper(redis, sortedSet, cnt) {
  const router = express.Router();
  router.get("/", (req, res) => {
    const userIp = req.ip === "::1" ? "127.0.0.1" : req.ip;
    redis.ZSCORE(sortedSet, userIp, (err, found) => {
      if (!found) {
        redis.ZADD(sortedSet, Date.now(), userIp);
        redis.INCR(cnt);
      }
    });

    res.sendFile(path.join(__dirname, "/../../", "public", "index.html"));
  });

  router.get("/cnt", (req, res) => {
    redis.GET(cnt, (err, data) => {
      res.json({
        visitors: data,
      });
    });
  });

  router.post("/", async (req, res) => {
    const msg = JSON.stringify(req.body);
    redis.RPUSH("mail", msg);
    mail(msg);
    res.sendStatus(200);
  });
  return router;
}

module.exports = wrapper;
