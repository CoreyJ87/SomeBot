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
  var client = req.client;
  var textResponses = req.textResponses;
  var guild = client.guilds.get(guildId)
  var knex = require('knex')({
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
        var member = guild.members.get(row.discordId);
        member.send(textResponses.upsell).then(function(response) {
          knex('users')
            .where('discord_id', row.discordId)
            .del()
        }).catch(function(err) {
          console.log(err)
        });
      }
    })
  }).catch(function(err) {
    console.error(err);
  });
});


module.exports = router;