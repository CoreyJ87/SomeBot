const express = require('express');
const router = express.Router();
const _ = require('lodash');
const kue = require('kue');
require('dotenv').config();
const defaultRoleId = process.env.DEFAULT_ROLE_ID;
const premiumRoleId = process.env.PREMIUM_ROLE_ID;
const functions = require('../processors/functions.js');


//This is a map for the product id on the rotogrinders side. Matched with the role ID on the discord side.
var roles = {
  '72': '456868636712501278'
}

//TOTO:Change nickname

router.post('/', function(req, res, next) {
  var queue = req.queue;
  var job = queue.create('discordCancel', {
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