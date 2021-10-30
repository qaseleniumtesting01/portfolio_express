const path = require("path");
const express = require("express");

function wrapper(redis, set, cnt) {
  const router = express.Router();
  router.get("/", (req, res) => {
    const userIp = req.ip === "::1" ? "127.0.0.1" : req.ip;
    redis.sismember(set, userIp, (err, found) => {
      if (!found) {
        redis.sadd(set, userIp);
        redis.incr(cnt);
      }
    });

    res.sendFile(path.join(__dirname, "/../../", "public", "index.html"));
  });
  return router;
}

module.exports = wrapper;
