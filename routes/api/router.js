const path = require("path");
const express = require("express");
const nodemailer = require("nodemailer");

async function mail(msg, auth) {
  // create reusable transporter object using the default SMTP transport
  let smtpTransport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // use SSL
    auth: {
      user: auth.email,
      pass: auth.password,
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

function wrapper(redisClient, setName, cntVar, auth) {
  const router = express.Router();
  router.get("/", (req, res) => {
    const userIp = req.ip === "::1" ? "127.0.0.1" : req.ip;
    redisClient.ZSCORE(setName, userIp, (err, found) => {
      if (!found) {
        redisClient.ZADD(setName, Date.now(), userIp);
        redisClient.INCR(cntVar);
      }
    });

    res.sendFile(path.join(__dirname, "/../../", "public", "index.html"));
  });

  router.get("/cntVar", (req, res) => {
    redisClient.GET(cntVar, (err, data) => {
      res.json({
        visitors: data,
      });
    });
  });

  router.post("/", async (req, res) => {
    const msg = JSON.stringify(req.body);
    redisClient.RPUSH("mail", msg);
    mail(msg, auth);
    res.sendStatus(200);
  });
  return router;
}

module.exports = wrapper;
