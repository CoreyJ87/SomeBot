require('dotenv').config();
const _ = require('lodash');

var self = module.exports = {
  queueInit: function(client, queue) {
    const guildId = process.env.GUILD_ID;
    const guild = client.guilds.get(guildId);
    queue.process('discordBan', 2, async function(job, done) {
      const discordId = job.data.discordId;
      const member = guild.members.get(discordId);
      if (!_.isEmpty(member)) {
        guild.ban(member).then(function(response) {
          console.log(`Banned user ${member.nickname}`)
          done()
        }).catch(function(err) {
          console.log(`Failed to ban user ${member.nickname}`)
          done(new Error(`Failed to ban ${member.nickname}`))
        });
      }
    });
  }
}