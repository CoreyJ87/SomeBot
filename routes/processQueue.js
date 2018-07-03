const express = require('express');
const router = express.Router();
const _ = require('lodash');
const crypto = require('crypto');
const kue = require('kue');
const algorithm = process.env.ALGORITHM;
const password = process.env.ENCRYPTION_PASS;
const defaultRoleId = process.env.DEFAULT_ROLE_ID;
const premiumRoleId = process.env.PREMIUM_ROLE_ID;

//This is a map for the product id on the rotogrinders side. Matched with the role ID on the discord side.
var roles = {
  '72': '456868636712501278'
}

router.get('/', function(req, res, next) {
  var client = req.client;
  var guild = client.guilds.get(req.guildID);
  var queue = req.queue;
  var defaultRoleData = guild.roles.find("id", defaultRoleId);
  var premiumRoleData = guild.roles.find("id", premiumRoleId);

  queue.process('discordUnlink', 4, function(job, done) {
    var isPremiumRemove = false;
    var discordId = job.data.discordId;
    var userProducts = job.data.userProducts;
    var member = guild.members.get(discordId);
    console.log(guild.roles)
    _.forEach(userProducts, function(singleProduct) {
      console.log(singleProduct['product'].product_type_id);
      console.log(singleProduct['status']);

      if (singleProduct['product'].product_type_id == 1 && singleProduct['status'] != 2 && singleProduct['status'] != 22) {
        isPremiumRemove = true;
      }
    });

    if (!_.isEmpty(discordId) && isPremiumRemove == false && !_.isEmpty(member) && member.roles.has(process.env.PREMIUM_ROLE_ID)) {
      member.removeRole(premiumRoleData)
        .then(function(response) {
          member.send(req.textResponses.premiumUnsub);
          done()
        })
        .catch(function() {
          done(new Error('Failed to remove role'));
        });
    }
  })



  queue.process('discordLink', 4, function(job, done) {
    var count = 0;
    var discordId = job.data.discordId;
    var userProducts = job.data.userProducts;
    var member = guild.members.get(discordId);
    if (_.isEmpty(discordId) || _.isEmpty(member) || _.isEmpty(defaultRoleData)) {
      done(new Error('Bad data'))
    } else {
      var isPremium = isUserPremium(userProducts);
      if (member.nickname != job.data.username)
        setNick(member, job)

      if (member.roles.has(process.env.DEFAULT_ROLE_ID) && isPremium && !member.roles.has(process.env.PREMIUM_ROLE_ID)) {
        member.addRole(premiumRoleData).then(function(response) {
          member.send(req.textResponses.addPremium);
          done();
        }).catch(function(e) {
          console.log(e);
          done(new Error('Failed to add Premium Role'))
        });
      } else if (!member.roles.has(process.env.DEFAULT_ROLE_ID)) {
        member.addRole(defaultRoleData).then(function(response) {
            member.send(req.textResponses.addDefault);
            if (isPremium && !member.roles.has(process.env.PREMIUM_ROLE_ID)) {
              member.addRole(premiumRoleData).then(function(response) {
                member.send(req.textResponses.addPremium);
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
});

function isUserPremium(userProducts) {
  var isUserPremium = false;
  _.forEach(userProducts, function(singleProduct) {
    console.log(singleProduct);
    if (singleProduct['product'].product_type_id == 1 && singleProduct['status'] != 2 && singleProduct['status'] != 22) {
      isUserPremium = true;
    }
  });
  return isUserPremium;
}

function setNick(member, job) {
  member.setNickname(job.data.username).then(function(response) {
    console.log("Changed Nickname")
  }).catch(function(err) {
    return done(new Error('Failed to change name'))
    console.log(err)
  });
}

function decrypt(text) {
  var decipher = crypto.createDecipher(algorithm, password)
  var dec = decipher.update(text, 'hex', 'utf8')
  dec += decipher.final('utf8');
  return dec;
}

module.exports = router;