require('dotenv').config();
const _ = require('lodash');
const kue = require('kue');
const functions = require('./functions.js');
const defaultRoleId = process.env.DEFAULT_ROLE_ID;
const premiumRoleId = process.env.PREMIUM_ROLE_ID;
const nflPreasonRoleId = process.env.NFL_PRESEASON_ROLE_ID;
const guildId = process.env.GUILD_ID;


var self = module.exports = {
  queueInit: function(client, queue, textResponses) {
    var guild = client.guilds.get(guildId);

    /*  var roles = {
        'premium': {
          ids: [87, 357, 369, 4, 58, 201, 3, 57, 198, 186, 2, 56, 202, 187, 1, 55, 197, 185, 372, 72, 75, 184, 199, 371, 82, 300, 499, 500, 501, 502, 503, 504, 506],
          roleid: premiumRoleId
        }
        'NFL': [],
        'NBA': [],
        'MLB': [],
        'NHL': [],
        'PGA': [],
        '618': {
          "product_id": '618',
          "roleId": nflPreasonRoleId
        },
        '618': {
          "product_id": '618',
          "roleId": premiumRoleId
        },
        '618': {
          "product_id": '618',
          "roleId": defaultRoleId
        }

      }*/
    //var premiumRoleData = guild.roles.find("id", premiumRoleId);
    //var NFLPreseasonRoleData = guild.roles.find("id", nflPreasonRoleId);

    queue.process('discordPurchase', 2, async function(job, done) {
      var discordId = job.data.discordId;
      var userProducts = job.data.userProducts;
      var username = job.data.username;
      var banned = job.data.banned;
      var member = guild.members.get(discordId);
      var defaultRoleData = guild.roles.find("id", defaultRoleId)

      if (_.isEmpty(member))
        var member = guild.members.find("id", discordId);

      if (banned) {
        guild.ban(member, 0, 'You are banned from RG')
          .then(function(user) {
            console.log(`Banned ${user.username || user.id || user}`)
            done()
          })
          .catch(function(user) {
            console.log(`Failed to ban user: ${username}`)
            done(new Error(`Member ${username} should be banned but failed`))
          });
      } else if (_.isEmpty(member)) {
        done(new Error('Member data is undefined'))
      } else if (_.isEmpty(defaultRoleData)) {
        done(new Error('No Default Role Data'))
      } else {

        var roleAddArray = []
        /*
        _.forEach(userProducts, function(singleProduct) {
          console.log(singleProduct)
          console.log("Passed in Role Id:" + singleProduct['product_id']);
          console.log("Coresponding Role:" + roles[singleProduct['product_id']]);
          if (!_.isUndefined(roles.premium.Ids[singleProduct['product_id']]))
            roleAddArray.push(roles[singleProduct['roleId']])

        });*/

        functions.isUserPremium(userProducts).then(function(response) {
          if (response && !member.roles.has(premiumRoleId)) {
            roleAddArray.push(premiumRoleId);
            member.send(textResponses.addPremium);
          }
          functions.isNFLPreseason(userProducts).then(function(response) {
            if (response && !member.roles.has(nflPreasonRoleId)) {
              roleAddArray.push(nflPreasonRoleId);
              member.send(textResponses.nflPreseason);
            }

            if (!member.roles.has(defaultRoleId)) {

              roleAddArray.push(defaultRoleId);
              member.send(textResponses.addDefault);
            }

            member.addRoles(roleAddArray).then(function(response) {
              member.removeRole(guild.roles.find("name", "Unlinked")).then(function(response) {
                console.log(`Removed unlinked from:${member.displayName}`);
                if (member.nickname != job.data.username)
                  functions.setNick(member, job)


                if (!member.roles.has(premiumRoleId)) {
                  functions.timedMessage(member, textResponses.oneDayMessage)
                }
                done()
              }).catch(function(err) {
                console.log(`Failed to remove unlinked role from  ${member.displayName}`);
                done(new Error("Failed to remove unlinked role"))
              });
            }).catch(function(err) {
              console.log(err)
              done(new Error("Failed to add roles. Add role function failed."))
            })

          })
        });
      }
    });
  },
}