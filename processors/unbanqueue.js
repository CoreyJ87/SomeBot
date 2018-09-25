require('dotenv').config();
let self = module.exports = {
  queueInit: function(client, queue,debug) {
    queue.process('discordUnban', 2, async function(job, done) {
      const guildId = process.env.GUILD_ID;
      const guild = client.guilds.get(guildId);
      const discordId = job.data.discordId;
      console.log("Discord ID to unban:" + discordId);
      guild.unban(discordId).then(function(response) {
          console.log(response);
        console.log(`UnBanned user`);
        done()
      }).catch(function(err) {
        console.log(err);
        console.log(`Failed to Unban user`);
        done(new Error(`Failed to Unban`))
      });
    })
  }
}