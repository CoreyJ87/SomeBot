require('dotenv').config()
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const algorithm = process.env.ALGORITHM;
const password = process.env.ENCRYPTION_PASS;

router.get('/', function(req, res, next) {

  var client = req.client;
  //only send this msg to ppl that havent linked their account
  client.on('guildMemberAdd', member => {
    console.log("Member details:" + member.roles.has("456874019732324353"));
    //if the joining member has the default roles
    if (!member.roles.has("456874019732324353")) {
      const id = member.id;
      var encryptedId = encrypt(id)
      member.send('Hi, welcome to the Rotogrinders discord server! To chat and receive access to any premium channels you will need to link your account to your Rotogrinders account. To link your account, please follow this link. https://rotogrinders.com/partners/discord?id=' + encryptedId);
    }
  });
  res.send('Bot has been started');
});

function encrypt(text) {
  var cipher = crypto.createCipher(algorithm, password)
  var crypted = cipher.update(text, 'utf8', 'hex')
  crypted += cipher.final('hex');
  return crypted;
}


module.exports = router;