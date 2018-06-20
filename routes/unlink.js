var express = require('express');
var router = express.Router();
const _ = require('lodash');
const crypto = require('crypto');
const algorithm = 'aes-256-ctr',
  password = '3kj4b69sd73jqa0xj230xk';


router.post('/', function(req, res, next) {
  var isPremium = false;
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
    if (singleProduct['product'].product_type_id == 1) {
      isPremium = true;
    }
  });

  if (!_.isEmpty(discordId) && isPremium == false && !_.isEmpty(member)) {
    member.removeRole(premiumRoleData)
      .then(console.log)
      .catch(console.error);

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
  var decipher = crypto.createDecipherv(algorithm, password)
  var dec = decipher.update(text, 'hex', 'utf8')
  dec += decipher.final('utf8');
  return dec;
}




module.exports = router;