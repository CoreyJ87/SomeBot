const express = require('express');
const router = express.Router();
const _ = require('lodash');
const functions = require('../processors/functions.js');
require('dotenv').config();

router.post('/', function(req, res, next) {
  let isBanned = false;
  const queue = req.queue;
  const debug = req.debug;

  if (!_.isEmpty(req.body.groups)) {
    _.forEach(req.body.groups, function(group) {
      if (group.name == "banned") {
        isBanned = true;
      }
    });
  }

  let job = queue.create((debug ? 'discordLinkTest' : 'discordLink'), {
    title: req.body.username,
    discordId: functions.decrypt(req.body.discord_id),
    username: req.body.username,
    userProducts: req.body.user_products,
    banned: isBanned,
    purchase: true,
  }).removeOnComplete(false).attempts(5).save(function(err) {
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