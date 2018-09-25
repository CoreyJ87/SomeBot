const _ = require('lodash');
const functions = require('./functions.js');
require('dotenv').config();
const premiumRoleId = process.env.PREMIUM_ROLE_ID;
const guildId = process.env.GUILD_ID;

let self = module.exports = {
  queueInit: function(client, queue, textResponses, roleMap, debug) {
    const guild = client.guilds.get(guildId);

    queue.process((debug ? 'discordCancelTest' : 'discordCancel'), 4, async function(job, done) {
        let removeArr = [];
        let sendMsgArr = [];
      const discordId = job.data.discordId;
      const userProducts = job.data.userProducts;
      const member = guild.members.get(discordId);

      functions.isUserPremium(userProducts).then(function(response) {
        if (!response) {
          removeArr.push(premiumRoleId);
          sendMsgArr.push(textResponses.premiumUnsub);
        }
        _.forEach(roleMap, function(roleRow) {
          let isInProductList = false;
          let filterResults = _.filter(userProducts, ['product_id', roleRow.product_id.toString()]);
          console.log("filterResults: " + filterResults);
          console.log("product id: " + roleRow.product_id.toString());
          if (!_.isEmpty(filterResults)) {
            if (filterResults['status'] !== 2 && filterResults['status'] !== 22) {
              isInProductList = true;
            }
          }
          console.log("Role Checking:" +roleRow.name);
          console.log("Is in product list: "+ isInProductList);
          if (isInProductList === false) {
              console.log("Pushing role id: "+ roleRow.role_id);
            removeArr.push(roleRow.role_id);
            sendMsgArr.push(roleRow.unsubmsg);
          }
        })
          if (!_.isEmpty(removeArr)) {
              console.log("Roles to be removed from user: " + member.nickname);
              console.log(removeArr);
          }
          member.removeRoles(removeArr)
              .then(function() {
                  _.forEach(sendMsgArr, function(message) {
                      member.send(message);
                  });
                  done()
              })
              .catch(function() {
                  done(new Error('Failed to remove role'));
              });
      }).catch(function(err) {
        console.log(err);
        done(new Error("Failed to remove Premium role"))
      });
    })
  },
}