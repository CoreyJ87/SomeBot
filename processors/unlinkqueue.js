const _ = require('lodash');
const kue = require('kue');
const functions = require('./functions.js')
require('dotenv').config();
const defaultRoleId = process.env.DEFAULT_ROLE_ID;
const premiumRoleId = process.env.PREMIUM_ROLE_ID;
const guildId = process.env.GUILD_ID;

var self = module.exports = {
  queueInit: function(client, queue, textResponses) {
    var guild = client.guilds.get(guildId);
    queue.process('discordUnlink', 4, async function(job, done) {
      var removeArr = [];
      var isPremiumRemove = false;
      var discordId = job.data.discordId;
      var userProducts = job.data.userProducts;
      var member = guild.members.get(discordId);

      functions.isUserPremium(userProducts).then(function(response) {
        if (response) {
          removeArr.push(premiumRoleId)
          member.send(textResponses.premiumUnsub);
        }

        functions.isNFLPreseason(userProducts).then(function(response) {
          if (response) {
            removeArr.push(nflPreasonRoleId)
          }
        })
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