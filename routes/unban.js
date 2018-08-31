const express = require('express');
const router = express.Router();
const _ = require('lodash');
const kue = require('kue');
require('dotenv').config();
const functions = require('../processors/functions.js');

router.post('/', function(req, res, next) {
  const queue = req.queue;
  const debug = req.debug;

  const job = queue.create((debug ? 'discordUnbanTest' : 'discordUnban'), {
    title: req.body.username,
    discordId: functions.decrypt(req.body.discord_id),
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