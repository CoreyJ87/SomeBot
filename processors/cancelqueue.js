const _ = require('lodash');
const kue = require('kue');
const functions = require('./functions.js')
require('dotenv').config();
const defaultRoleId = process.env.DEFAULT_ROLE_ID;
const premiumRoleId = process.env.PREMIUM_ROLE_ID;
const guildId = process.env.GUILD_ID;
const CFBRoleId = process.env.CFB_ROLE_ID;

var self = module.exports = {
  queueInit: function(client, queue, textResponses, roleMap) {
    var guild = client.guilds.get(guildId);
    queue.process('discordCancel', 4, async function(job, done) {
      var removeArr = [];
      var discordId = job.data.discordId;
      var userProducts = job.data.userProducts;
      var member = guild.members.get(discordId);

      functions.isUserPremium(userProducts).then(function(response) {
        if (response) {
          removeArr.push(premiumRoleId)
          member.send(textResponses.premiumUnsub);
        }
        _.forEach(roleMap, function(roleRow) {
          var isInProductList = false;
          var filterResults = _.filter(userProducts, `{'product_id': ${roleRow.product_id} }`)
          if (singleProduct['status'] != 2 && singleProduct['status'] != 22 && !_.isUndefined(filterResults)) {
            isInProductList = true;
          }
          if (!isInProductList) {
            removeArr.push(roleRow.role_id);
            member.send(roleRow.unsubmsg);
          }
        })
      }).catch(function(err) {
        done(new Error("Failed to remove Premium role"))
      })
      member.removeRoles(removeArr)
        .then(function(response) {
          done()
        })
        .catch(function() {
          done(new Error('Failed to remove role'));
        });
    })
  },
}