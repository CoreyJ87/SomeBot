require('dotenv').config();
const _ = require('lodash');
const functions = require('./functions.js');
const defaultRoleId = process.env.DEFAULT_ROLE_ID;
const premiumRoleId = process.env.PREMIUM_ROLE_ID;
const unlinkedRoleId = process.env.UNLINKED_ROLE_ID;
const guildId = process.env.GUILD_ID;
const upsellEnabled = process.env.UPSELL_ENABLED;

let self = module.exports = {
  queueInit: function(client, queue, textResponses, roleMap, debug) {
    const guild = client.guilds.get(guildId);


    queue.process((debug ? 'discordLinkTest' : 'discordLink'), 2, async function(job, done) {
      const discordId = job.data.discordId;
      const userProducts = job.data.userProducts;
      const username = job.data.username;
      const banned = job.data.banned;
      const member = guild.members.get(discordId);
      const purchase = job.data.purchase;

      if (_.isEmpty(member)) {
          const member = guild.members.find("id", discordId);
      }
      if (banned) {
        let userAlreadyBanned = false;
        console.log("Username:" + username + " is banned checking ban list before attemping to ban")
        guild.fetchBans()
          .then(function(bans) {
            _.forEach(bans, function(ban) {
              if (ban.id == discordId) {
                userAlreadyBanned = true;
              }
            })
          })
          .catch(console.error);

        if (userAlreadyBanned == false) {
          guild.ban(member, 0, 'You are banned from RG')
            .then(function(user) {
              console.log(`Banned ${user.username}`)
              done()
            })
            .catch(function(err) {
              console.log(err);
              console.log(`Failed to ban user: ${username}`);
              done(new Error(`Member ${username} should be banned but failed. Or is already banned`))
            });
        }
      } else if (_.isEmpty(member)) {
        done(new Error('Member data is undefined'))
      } else {
        let roleAddArray = [];
        functions.isUserPremium(userProducts).then(function(response) {
          if (response && !member.roles.has(premiumRoleId)) {
            roleAddArray.push(premiumRoleId);
            member.send(textResponses.addPremium);
          }
          if (!member.roles.has(defaultRoleId) && !member.roles.has(defaultRoleId)) {
            roleAddArray.push(defaultRoleId);
            member.send(textResponses.addDefault);
          }

          _.forEach(userProducts, function(singleProduct) {
            if (singleProduct['product'].product_type_id == 2 && singleProduct['status'] != 2 && singleProduct['status'] != 22) {
              let roleId = _.find(roleMap, {
                'product_id': singleProduct['product'].id,
              });
              if (!_.isUndefined(roleId) && !member.roles.has(roleId.role_id)) {
                roleAddArray.push(roleId.role_id);
                member.send(roleId.submsg);
              }
            }
          })
          if (!_.isEmpty(roleAddArray)) {
            console.log("Roles Ids to be added to user:" + username);
            console.log(roleAddArray);
          }
          member.addRoles(roleAddArray).then(function(response) {
            member.removeRole(guild.roles.get(unlinkedRoleId)).then(function(response) {
              console.log(`Removed unlinked from:${member.displayName}`);
              if (member.nickname != job.data.username)
                functions.setNick(member, job);


              if (!member.roles.has(premiumRoleId) && !purchase) {
                let knex = require('knex')({
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
            console.log(err);
            done(new Error("Failed to add roles. Add role function failed."))
          })
        }).catch(function(err) {
          console.log(err);
          done(new Error("Failed to add premium role"))
        })
      }
    })
  }
}