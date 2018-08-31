require('dotenv').config();
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const moment = require('moment');
const time_interval = 20;
const defaultRoleId = process.env.DEFAULT_ROLE_ID;
const premiumRoleId = process.env.PREMIUM_ROLE_ID;
const guildId = process.env.GUILD_ID;


router.post('/', function(req, res, next) {
  const client = req.client;
  const textResponses = req.textResponses;
  const guild = client.guilds.get(guildId)
  const knex = require('knex')({
    client: 'mysql',
    connection: {
      host: process.env.DISCORD_DB_HOST,
      user: process.env.DISCORD_DB_USER,
      password: process.env.DISCORD_DB_PASS,
      database: process.env.DISCORD_DBNAME,
    }
  });

  knex.select().from('users').then(function(rows) {
    _.forEach(rows, function(row) {
      if (moment().diff(row.timestamp, 'hours') > time_interval) {
        var member = guild.members.get(row.discord_id);
        member.send(textResponses.upsell).then(function(response) {

          knex('users')
            .where('discord_id', row.discordId)
            .del();

          var date = moment().format('YYYY-MM-DD');

          knex.count('sends as thecount').where('timestamp', date).from('stats').then(function(resp) {
            if (resp[0].thecount > 0) {
              knex.where('timestamp', date).select('sends').from('stats').then(function(selectResp) {
                console.log(selectResp)
                _.forEach(selectResp, function(row) {
                  knex('stats')
                    .where({
                      timestamp: date
                    })
                    .update({
                      sends: parseInt(row.sends) + 1
                    }).then(function(resp) {
                      console.log(resp)
                      res.send("Success")
                    }).catch(function(err) {
                      console.log(err)
                      res.send(err)
                    })
                })

              })
            } else {
              knex('stats')
                .insert({
                  sends: 1,
                  timestamp: date
                }).then(function(resp) {
                  console.log(resp);
                  res.send("Success")
                }).catch(function(err) {
                  console.log(err);
                  res.send(err)
                })
            }
          })
        });
      }
    });
  })
});


module.exports = router;