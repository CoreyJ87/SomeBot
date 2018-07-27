require('dotenv').config();
var self = module.exports = {
  queueInit: function(client, queue) {
    const guildId = process.env.GUILD_ID;
    const guild = client.guilds.get(guildId);
    queue.process('discordUnban', 2, async function(job, done) {
      const discordId = job.data.discordId;
      const member = guild.members.get(discordId);
      if (!_.isEmpty(member)) {
        guild.unban(member).then(function(response) {
          console.log(`UnBanned user ${member.nickname}`)
          done()
        }).catch(function(err) {
          console.log(`Failed to Unban user ${member.nickname}`)
          done(new Error(`Failed to Unban ${member.nickname}`))
        });
      }
    });
  }
}