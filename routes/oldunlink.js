require('dotenv').config()
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const crypto = require('crypto');
const algorithm = process.env.ALGORITHM;
const password = process.env.ENCRYPTION_PASS;


router.post('/', function(req, res, next) {
  var isPremium = false;
  var isCancelled = false;
  var discordId = decrypt(req.body.discord_id); // Corey test userid"457228013562494977"
  var userProducts = req.body.user_products;
  var client = req.client;
  var guild = client.guilds.get(req.guildID);
  var member = guild.members.get(discordId);
  var defaultRoleData = guild.roles.find("id", "456874019732324353");
  var premiumRoleData = guild.roles.find("id", "456868636712501278");


  //This is a map for the product id on the rotogrinders side. Matched with the role ID on the discord side.
  var roles = {
    '72': '456868636712501278', //Premium Channel role
  }


  _.forEach(userProducts, function(singleProduct) {
    console.log(singleProduct['product'].product_type_id);
    console.log(singleProduct['status'])

    if (singleProduct['product'].product_type_id == 1 && singleProduct['status'] != 2 && singleProduct['status'] != 22) {
      isPremium = true;
    }
  });



  if (!_.isEmpty(discordId) && isPremium == false && !_.isEmpty(member) && member.roles.has(process.env.PREMIUM_ROLE_ID)) {
    member.removeRole(premiumRoleData)
      .then(function(response) {
        member.send(req.textResponses.premiumUnsub);
      })
      .catch(function() {
        res.json({
          success: false
        })
      });
    //Uncomment when multi-premium channel is enabled.
    /*  var productIdArr = [];
      _.forEach(userProducts, function(singleProduct) {
        console.log(singleProduct);
        console.log("Passed in Role Id:" + singleProduct['product_id']);
        productIdArr.push(singleProduct['product_id']);
        console.log("Coresponding Role:" + roles[singleProduct['product_id']]);

      });

      var removeRoles = _.omit(roles, productIdArr);
      _.forEach(removeRole, function(badRole) {
        member.removeRole(badRole[0])
      });*/
    res.json({
      success: true
    });
  } else {
    res.json({
      success: false
    })
  }
});

function decrypt(text) {
  var decipher = crypto.createDecipher(algorithm, password)
  var dec = decipher.update(text, 'hex', 'utf8')
  dec += decipher.final('utf8');
  return dec;
}




module.exports = router;