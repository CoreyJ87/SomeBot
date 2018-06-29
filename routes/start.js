require('dotenv').config()
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const algorithm = process.env.ALGORITHM;
const password = process.env.ENCRYPTION_PASS;
const cluster = require('cluster');
const _ = require('lodash');
router.get('/', function(req, res, next) {

  var client = req.client;
  //only send this msg to ppl that havent linked their account

  if (isMasterProcess()) {
    client.on('guildMemberAdd', member => {
      console.log("Member details:" + member.roles.has("456874019732324353"));
      //if the joining member has the default roles
      if (!member.roles.has("456874019732324353")) {
        const id = member.id;
        var encryptedId = encrypt(id);
        member.send(req.textResponses.welcomeMessage + encryptedId);
      }
    });
  }
  console.log("IsMasterProcess:" + isMasterProcess());
  res.send('Bot has been started');
});

function encrypt(text) {
  var cipher = crypto.createCipher(algorithm, password)
  var crypted = cipher.update(text, 'utf8', 'hex')
  crypted += cipher.final('hex');
  return crypted;
}

function isMasterProcess() {
  if (_.has(process.env, 'NODE APP INSTANCE')) {
    return _.get(process.env, 'NODE APP INSTANCE') === '0';
  } else if (_.has(process.env, 'NODE_APP_INSTANCE')) {
    return _.get(process.env, 'NODE_APP_INSTANCE') === '0';
  } else {
    return cluster.isMaster;
  }
}

module.exports = router;