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
    to: `${process.env.SEND_TO_MAIL}`,
    subject: "New Message",
    text: `name: ${msg.name}
    email: ${msg.email}
    phone: ${msg.phone}
    message: ${msg.message}`,
  });

  console.log("Message sent: %s", info.messageId);
}

function wrapper(redisClient, setName, cntVar, auth) {
  const router = express.Router();
  router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/../../", "public", "index.html"));
  });

  router.post("/", async (req, res) => {
    const msg = JSON.stringify(req.body);
    redisClient.RPUSH("mail", msg);
    try {
      mail(msg, auth);
    } catch (error) {
      console.log("form submission error");
      console.log(error);
    }
    res.sendStatus(200);
  });

  router.get(`/${process.env.ANALYTICS}`, (req, res) => {
    redisClient.GET(cntVar, (err, data) => {
      res.json({
        visitors: data,
      });
    });
  });

  router.get(`/${process.env.ANALYTICS}/reset`, (req, res) => {
    redisClient.SET(cntVar, 0, (err, data) => {
      console.log("counter reset");
    });
    res.json({
      msg: "counter reset",
    });
  });

  router.post("/reg", (req, res) => {
    redisClient.ZADD(setName, Date.now(), req.body.id);
    redisClient.INCR(cntVar);
    res.sendStatus(200);
  });

  return router;
}

module.exports = wrapper;
