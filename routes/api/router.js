const path = require("path");
const express = require("express");

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
  return router;
}

module.exports = wrapper;
