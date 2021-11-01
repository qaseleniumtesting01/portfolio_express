const path = require("path");
const express = require("express");
const sendMail = require("../../js/mailer");

// router wrapper
function wrapper(redisClient, setName, cntVar, auth) {
  const router = express.Router();
  router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/../../", "public", "index.html"));
  });

  // Contact Me Form handler
  router.post("/", async (req, res) => {
    const msg = JSON.stringify(req.body);
    redisClient.RPUSH("mail", msg);
    try {
      sendMail(
        `${process.env.SEND_TO_MAIL}`,
        "New Message",
        `
      name: ${req.body.name}
      email: ${req.body.email}
      phone: ${req.body.phone}
      message: ${req.body.message}`,
        auth
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

  // Register visitor (session based)
  router.post("/reg", (req, res) => {
    redisClient.ZADD(setName, Date.now(), req.body.id);
    redisClient.INCR(cntVar);
    res.sendStatus(200);
  });

  return router;
}

module.exports = wrapper;
