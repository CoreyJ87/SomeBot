var express = require('express');
var router = express.Router();

/* GET start listing. */
router.get('/', function(req, res, next) {
  // Create an event listener for new guild members
  client.on('guildMemberAdd', member => {
    const id = member.id;
    var encryptedId = encrypt(id)
    member.send('Hi. To link your account to your rotogrinders account please follow this link. https://rotogrinders.com/partners/discord?id=' + encryptedId);
  });
  client.on('message', msg => {
    if (msg.content === 'ping') {
      msg.reply('Pong!');
    }
  });
  res.send('Bot has been started');
});

module.exports = router;