const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const Discord = require('discord.js');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const fs = require('fs');
const algorithm = 'aes-256-ctr',
  password = '3kj4b69sd73jqa0xj230xk';

var options = {
  inflate: true,
  limit: '100kb',
  type: 'application/json'
};

var app = express();

var indexRouter = require('./routes/index');
var startRouter = require('./routes/start');
var linkRouter = require('./routes/link');
var unlinkRouter = require('./routes/unlink');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

var initDiscord = function(req, res, next) {
  console.log('Initialized Discord Client');
  var client = new Discord.Client();
  req.client = client;
  req.guildID = "456864351870124032"
  var token = "NDU3MjE1MDY2NzQwMjI4MTI4.DgV2Pg.4v-AZagi-o9zlw_pHOptjuakxmo"
  client.login(token);
  client.on('message', msg => {
    if (msg.content === 'ping') {
      msg.reply('Pong!');
    }
  });

  // Create an event listener for new guild members
  client.on('guildMemberAdd', member => {
    const id = member.id;
    var encryptedId = encrypt(id)
    member.send('Hi. To link your account to your rotogrinders account please follow this link. https://rotogrinders.com/partners/discord?id=' + encryptedId);
  });
  client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    next();
  });

}

app.use(initDiscord);
app.use('/', indexRouter);
app.use('/start', startRouter);
app.use('/link', linkRouter);
app.use('/unlink', unlinkRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log(err)

  fs.writeFile("/var/log/rgdiscordbot.log", err, function(err2) {
    if (err2) {
      return console.log(err2);
    }

    console.log("The file was saved!");
  });
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

function encrypt(text) {
  var cipher = crypto.createCipheri(algorithm, password)
  var crypted = cipher.update(text, 'utf8', 'hex')
  crypted += cipher.final('hex');
  return crypted;
}


module.exports = app;