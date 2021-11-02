const path = require("path");
const express = require("express");
const createMailer = require("../../js/create-mailer");
const crypto = require("crypto");
const MIN = 1000 * 60;

// router wrapper
function wrapper(redisClient, setName, cntVar, auth) {
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
      redisClient.ZADD(setName, Date.now(), userID);
      redisClient.INCR(cntVar);
    }
    res.sendFile(path.join(__dirname, "/../../", "public", "index.html"));
  });

  // Contact Me Form handler
  router.post("/", async (req, res) => {
    const msg = JSON.stringify(req.body);
    redisClient.RPUSH("mail", msg);
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

  // Get total visitor (session based)
  router.get(`/${process.env.ANALYTICS}`, (req, res) => {
    redisClient.GET(cntVar, (err, data) => {
      res.json({
        visitors: data,
      });
    });
  });

  // Reset counter
  router.get(`/${process.env.ANALYTICS}/reset`, (req, res) => {
    redisClient.SET(cntVar, 0, (err, data) => {
      console.log("counter reset");
    });
    res.json({
      msg: "counter reset",
    });
  });

  return router;
}

module.exports = wrapper;
