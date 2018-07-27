const _ = require('lodash');
const kue = require('kue');
require('dotenv').config();
const defaultRoleId = process.env.DEFAULT_ROLE_ID;
const premiumRoleId = process.env.PREMIUM_ROLE_ID;
const guildId = process.env.GUILD_ID;

var self = module.exports = {
  queueInit: function(client, queue, textResponses) {
    var guild = client.guilds.get(guildId);
    var defaultRoleData = guild.roles.find("id", defaultRoleId);
    var premiumRoleData = guild.roles.find("id", premiumRoleId);

    queue.process('discordUnlink', 4, async function(job, done) {
      var isPremiumRemove = false;
      var discordId = job.data.discordId;
      var userProducts = job.data.userProducts;
      var member = guild.members.get(discordId);
      _.forEach(userProducts, function(singleProduct) {
        if (singleProduct['product'].product_type_id == 1 && singleProduct['status'] != 2 && singleProduct['status'] != 22) {
          isPremiumRemove = true;
        }
      });

      if (!_.isEmpty(discordId) && isPremiumRemove == false && !_.isEmpty(member) && member.roles.has(process.env.PREMIUM_ROLE_ID)) {
        member.removeRole(premiumRoleData)
          .then(function(response) {
            member.send(textResponses.premiumUnsub);
            done()
          })
          .catch(function() {
            done(new Error('Failed to remove role'));
          });
      } else {
        done();
      }
    })
  },
}