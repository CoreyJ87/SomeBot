require('dotenv').config();
const _ = require('lodash');
const kue = require('kue');
const functions = require('./functions.js');
const defaultRoleId = process.env.DEFAULT_ROLE_ID;
const premiumRoleId = process.env.PREMIUM_ROLE_ID;
const nflPreasonRoleId = process.env.NFL_PRESEASON_ROLE_ID;
const unlinkedRoleId = process.env.UNLINKED_ROLE_ID;
const guildId = process.env.GUILD_ID;
const upsellEnabled = process.env.UPSELL_ENABLED;
const CFBRoleId = process.env.CFB_ROLE_ID;


var self = module.exports = {
  queueInit: function(client, queue, textResponses) {
    var guild = client.guilds.get(guildId);


    queue.process('discordLink', 2, async function(job, done) {
      var discordId = job.data.discordId;
      var userProducts = job.data.userProducts;
      var username = job.data.username;
      var banned = job.data.banned;
      var member = guild.members.get(discordId);
      var purchase = job.data.purchase;

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
            done(new Error(`Member ${username} should be banned but failed. Or is already banned`))
          });
      } else if (_.isEmpty(member)) {
        done(new Error('Member data is undefined'))
      } else {

        var roleAddArray = []

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


            functions.isCFBPremium(userProducts).then(function(response) {
            if(response && !member.role.has(CFBRoleId)){
              roleAddArray.push(CFBRoleId);
              member.send(textResponses.addCFB);
            }

            member.addRoles(roleAddArray).then(function(response) {
              member.removeRole(guild.roles.get(unlinkedRoleId)).then(function(response) {
                console.log(`Removed unlinked from:${member.displayName}`);
                if (member.nickname != job.data.username)
                  functions.setNick(member, job)


                if (!member.roles.has(premiumRoleId) && !purchase) {
                  var knex = require('knex')({
                    client: 'mysql',
                    connection: {
                      host: process.env.DISCORD_DB_HOST,
                      user: process.env.DISCORD_DB_USER,
                      password: process.env.DISCORD_DB_PASS,
                      database: process.env.DISCORD_DBNAME,
                    }
                  });
                  if (upsellEnabled) {
                    knex('users').insert({
                      discord_id: discordId,
                    });
                  }
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

          }).catch(function(){
            done(new Error("Failed to add premium role"))
          })
        }).catch(function(err){
          done(new Error("Failed to add nfl preseason role"))
        })
      }).catch(function(){
        done(new Error("Failed to add premium role"))
      })
      }
    });
  },
}
