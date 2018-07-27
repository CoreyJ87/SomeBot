require('dotenv').config();
const _ = require('lodash');
const kue = require('kue');
const functions = require('./functions.js');
const defaultRoleId = process.env.DEFAULT_ROLE_ID;
const premiumRoleId = process.env.PREMIUM_ROLE_ID;
const guildId = process.env.GUILD_ID;


var self = module.exports = {
  queueInit: function(client, queue, textResponses) {
    var guild = client.guilds.get(guildId);
    var defaultRoleData = guild.roles.find("id", defaultRoleId);
    var premiumRoleData = guild.roles.find("id", premiumRoleId);

    queue.process('discordLink', 2, async function(job, done) {
      var discordId = job.data.discordId;
      var userProducts = job.data.userProducts;
      var username = job.data.username;
      var banned = job.data.banned;
      var member = guild.members.get(discordId);

      if (_.isEmpty(member))
        var member = guild.members.find("id", discordId);

      /*  if (banned) {
          guild.ban(member)
            .then(function(user) {
              console.log(`Banned ${user.username || user.id || user}`)
              done()
            })
            .catch(function() {
              console.log(`Failed to ban user: ${user.username || user.id || user}`)
              done(new Error(`Member ${user.username} should be banned but failed`))
            });
        } else*/
      if (_.isEmpty(member)) {
        done(new Error('Member data is undefined'))
      } else if (_.isEmpty(defaultRoleData)) {
        done(new Error('No Default Role Data'))
      } else {
        var isPremium = functions.isUserPremium(userProducts);
        if (member.nickname != job.data.username)
          functions.setNick(member, job)

        if (member.roles.has(process.env.DEFAULT_ROLE_ID) && isPremium && !member.roles.has(process.env.PREMIUM_ROLE_ID)) {
          member.addRole(premiumRoleData).then(function(response) {
            console.log("Added Premium role for user..." + username)
            member.send(textResponses.addPremium);
            done();
          }).catch(function(e) {
            console.log(e);
            done(new Error('Failed to add Premium Role'))
          });
        } else if (!member.roles.has(process.env.DEFAULT_ROLE_ID)) {
          member.addRole(defaultRoleData).then(function(response) {
              console.log("Added default role for user..." + username)
              member.send(textResponses.addDefault);
              if (isPremium && !member.roles.has(process.env.PREMIUM_ROLE_ID)) {
                member.addRole(premiumRoleData).then(function(response) {
                  console.log("Added premium role for user..." + username)
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
        } else {
          console.log("Skipping...User already has roles:" + username)
          done();
        }
      }
    });
  },


}