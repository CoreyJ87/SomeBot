const express = require('express');
const router = express.Router();
const _ = require('lodash');
const kue = require('kue');
const functions = require('../processors/functions.js');
require('dotenv').config();
const defaultRoleId = process.env.DEFAULT_ROLE_ID;
const premiumRoleId = process.env.PREMIUM_ROLE_ID;


//This is a map for the product id on the rotogrinders side. Matched with the role ID on the discord side.
var roles = {
  '72': '456868636712501278'

}

router.post('/', function(req, res, next) {
  var isBanned = false;
  var queue = req.queue;

  if (!_.isEmpty(req.body.groups)) {
    _.forEach(req.body.groups, function(group) {
      if (group.name == "banned") {
        isBanned = true;
      }
    });
  }

  var job = queue.create('discordPurchase', {
    title: req.body.username,
    discordId: functions.decrypt(req.body.discord_id),
    username: req.body.username,
    userProducts: req.body.user_products,
    banned: isBanned,
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