const express = require('express');
const router = express.Router();
const _ = require('lodash');
const crypto = require('crypto');
const kue = require('kue');
const algorithm = process.env.ALGORITHM;
const password = process.env.ENCRYPTION_PASS;
const defaultRoleId = process.env.DEFAULT_ROLE_ID;
const premiumRoleId = process.env.PREMIUM_ROLE_ID;


//This is a map for the product id on the rotogrinders side. Matched with the role ID on the discord side.
var roles = {
  '72': '456868636712501278'

}

//TOTO:Change nickname

router.post('/', function(req, res, next) {

  var queue = req.queue;
  var job = queue.create('discordLink', {
    title: req.body.username,
    discordId: decrypt(req.body.discord_id),
    username: (req.body.username),
    userProducts: req.body.user_products,
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

function decrypt(text) {
  var decipher = crypto.createDecipher(algorithm, password)
  var dec = decipher.update(text, 'hex', 'utf8')
  dec += decipher.final('utf8');
  return dec;
}

module.exports = router;