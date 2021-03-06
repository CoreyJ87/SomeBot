require('dotenv').config();
const functions = require('./functions.js');
const guildId = process.env.GUILD_ID;
const unlinkedRoleId = process.env.UNLINKED_ROLE_ID;
const defaultRoleId = process.env.DEFAULT_ROLE_ID;

var self = module.exports = {
  eventListenersInit: function(client, textResponses) {
    var guild = client.guilds.get(guildId);
    if (functions.isMasterProcess()) {
      client.on('message', msg => {
        if (msg.content == '!resend') {
          const id = msg.author.id;
          var encryptedId = functions.encrypt(id);
          msg.author.send(textResponses.welcomeMessage + encryptedId);
          msg.delete(500)
            .then(msg => console.log(`Deleted !resend from ${msg.author.username}`))
            .catch(function(err) {
              console.log(err)
            });
        }
      })
      client.on('guildMemberAdd', member => {
        //if the joining member has the default roles
        if (!member.roles.has(defaultRoleId)) {
          const id = member.id;
          var encryptedId = functions.encrypt(id);
          member.send(textResponses.welcomeMessage + encryptedId);
          member.addRole(guild.roles.get(unlinkedRoleId))
        }
      });
    }
  }
}