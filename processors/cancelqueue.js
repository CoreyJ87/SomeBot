const _ = require('lodash');
const kue = require('kue');
const functions = require('./functions.js')
require('dotenv').config();
const defaultRoleId = process.env.DEFAULT_ROLE_ID;
const premiumRoleId = process.env.PREMIUM_ROLE_ID;
const guildId = process.env.GUILD_ID;
const CFBRoleId = process.env.CFB_ROLE_ID;

var self = module.exports = {
  queueInit: function(client, queue, textResponses, roleMap, debug) {
    const guild = client.guilds.get(guildId);

    queue.process((debug ? 'discordCancelTest' : 'discordCancel'), 4, async function(job, done) {
      var removeArr = [];
      var sendMsgArr = [];
      const discordId = job.data.discordId;
      const userProducts = job.data.userProducts;
      const member = guild.members.get(discordId);

      functions.isUserPremium(userProducts).then(function(response) {
        if (!response) {
          removeArr.push(premiumRoleId);
          sendMsgArr.push(textResponses.premiumUnsub);
        }
        _.forEach(roleMap, function(roleRow) {
          var isInProductList = false;
          var filterResults = _.filter(userProducts, ['product_id', roleRow.product_id.toString()])
          if (singleProduct['status'] != 2 && singleProduct['status'] != 22 && !_.isUndefined(filterResults)) {
            isInProductList = true;
          }
          if (!isInProductList) {
            removeArr.push(roleRow.role_id);
            sendMsgArr.push(roleRow.unsubmsg);
          }
        })
      }).catch(function(err) {
        done(new Error("Failed to remove Premium role"))
      })
      if (!_.isEmpty(removeArr)) {
        console.log("Roles to be removed from user: " + username);
        console.log(removeArr);
      }
      member.removeRoles(removeArr)
        .then(function(response) {
          _.forEach(sendMsgArr, function(message) {
            member.send(message);
          })
          done()
        })
        .catch(function() {
          done(new Error('Failed to remove role'));
        });
    })
  },
}