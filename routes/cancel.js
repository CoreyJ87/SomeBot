const express = require('express');
const router = express.Router();
require('dotenv').config();
const functions = require('../processors/functions.js');

router.post('/', function(req, res, next) {
  const queue = req.queue;
  const debug = req.debug;

  const job = queue.create((debug ? 'discordCancelTest' : 'discordCancel'), {
    title: req.body.username,
    discordId: functions.decrypt(req.body.discord_id),
    username: (req.body.username),
    userProducts: req.body.user_products,
  }).removeOnComplete(false).save(function(err) {
    if (!err) {
      console.log(job.id);
      res.json({
        success: true
      });
    } else {
      console.log(err);
      res.send(err);
    }
  });
});

module.exports = router;