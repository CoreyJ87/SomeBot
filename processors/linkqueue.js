require('dotenv').config()
const _ = require('lodash');
const kue = require('kue');
const defaultRoleId = process.env.DEFAULT_ROLE_ID;
const premiumRoleId = process.env.PREMIUM_ROLE_ID;
const guildId = process.env.GUILD_ID;


var self = module.exports = {
  queueInit: function(client, queue, textResponses) {
    var guild = client.guilds.get(guildId);
    var defaultRoleData = guild.roles.find("id", defaultRoleId);
    var premiumRoleData = guild.roles.find("id", premiumRoleId);

    queue.process('discordLink', 4, async function(job, done) {
      var count = 0;
      var discordId = job.data.discordId;
      var userProducts = job.data.userProducts;
      var member = guild.members.get(discordId);
      if (_.isEmpty(discordId) || _.isEmpty(member) || _.isEmpty(defaultRoleData)) {
        done(new Error('Bad data'))
      } else {
        var isPremium = self.isUserPremium(userProducts);
        if (member.nickname != job.data.username)
          self.setNick(member, job)

        if (member.roles.has(process.env.DEFAULT_ROLE_ID) && isPremium && !member.roles.has(process.env.PREMIUM_ROLE_ID)) {
          member.addRole(premiumRoleData).then(function(response) {
            member.send(textResponses.addPremium);
            done();
          }).catch(function(e) {
            console.log(e);
            done(new Error('Failed to add Premium Role'))
          });
        } else if (!member.roles.has(process.env.DEFAULT_ROLE_ID)) {
          member.addRole(defaultRoleData).then(function(response) {
              member.send(textResponses.addDefault);
              if (isPremium && !member.roles.has(process.env.PREMIUM_ROLE_ID)) {
                member.addRole(premiumRoleData).then(function(response) {
                  member.send(textResponses.addPremium);
                  done();
                }).catch(function(e) {
                  console.log(e);
                  done(new Error('Failed to add Premium Role'))
                });
              } else {
                done()
              }
            })
            .catch(function(e) {
              console.log(e);
              done(new Error('Failed to add default role'))
            });
        }
      }
    });
  },

  isUserPremium: function(userProducts) {
    var isUserPremium = false;
    _.forEach(userProducts, function(singleProduct) {
      console.log(singleProduct);
      if (singleProduct['product'].product_type_id == 1 && singleProduct['status'] != 2 && singleProduct['status'] != 22) {
        isUserPremium = true;
      }
    });
    return isUserPremium;
  },

  setNick: function(member, job) {
    member.setNickname(job.data.username).then(function(response) {
      console.log("Changed Nickname")
    }).catch(function(err) {
      return done(new Error('Failed to change name'))
      console.log(err)
    });
  }
}