const express = require('express');
const router = express.Router();
const _ = require('lodash');
const crypto = require('crypto');
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
  var defaultAdded = false;
  var premiumAdded = false;
  var isPremium = false;
  var count = 0;

  var discordId = decrypt(req.body.discord_id); // Corey test userid"457228013562494977"
  var userProducts = req.body.user_products;

  var client = req.client;
  var guild = client.guilds.get(req.guildID);
  var member = guild.members.get(discordId);
  var defaultRoleData = guild.roles.find("id", defaultRoleId);
  var premiumRoleData = guild.roles.find("id", premiumRoleId);

  if (_.isEmpty(discordId) || _.isEmpty(member) || _.isEmpty(userProducts) || _.isEmpty(defaultRoleData)) {
    res.status(err.status || 500);
    res.render('error');
  } else {

    _.forEach(userProducts, function(singleProduct) {
      console.log(singleProduct);
      if (singleProduct['product'].product_type_id == 1 && singleProduct['status'] != 2 && singleProduct['status'] != 22) {
        isPremium = true;
      }
    });

    if (member.nickname != req.body.username) {
      member.setNickname(req.body.username).then(function(response) {
        console.log("Changed Nickname")
      }).catch(function(err) {
        console.log(err)
      });
    }
    if (!member.roles.has(process.env.DEFAULT_ROLE_ID)) {
      member.addRole(defaultRoleData).then(function(response) {
          defaultAdded = true;
          member.send(req.textResponses.addDefault);
        })
        .catch(function(e) {
          console.log(e);
          res.json({
            success: false
          })
        });
    }
    if (isPremium && !member.roles.has(process.env.PREMIUM_ROLE_ID)) {
      member.addRole(premiumRoleData).then(function(response) {
        console.log("Add premium role response:" + response);
        member.send(req.textResponses.addPremium);
        premiumAdded = true;
      }).catch(function(e) {
        console.log(e);
        res.json({
          success: false
        });
      });
      //Uncomment when multi-premium channel is enabled.
      /*_.forEach(userProducts, function(singleProduct) {
        console.log(singleProduct)
        console.log("Passed in Role Id:" + singleProduct['product_id']);
        console.log("Coresponding Role:" + roles[singleProduct['product_id']]);
        var roleData = guild.roles.find("id", roles[Id]);
        member.addRole(roleData);
      });*/
    }
    if ((isPremium && premiumAdded) || defaultAdded) {
      res.json({
        success: true
      })
    } else {
      res.json({
        success: false
      })
    }
  }
});

function decrypt(text) {
  var decipher = crypto.createDecipher(algorithm, password)
  var dec = decipher.update(text, 'hex', 'utf8')
  dec += decipher.final('utf8');
  return dec;
}

module.exports = router;