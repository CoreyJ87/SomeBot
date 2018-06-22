require('dotenv').config()
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const Discord = require('discord.js');
const bodyParser = require('body-parser');
const fs = require('fs');
const guildId = process.env.GUILD_ID;
const botToken = process.env.BOT_TOKEN;
const options = {
  type: 'application/json'
};
const app = express();


const startRouter = require('./routes/start');
const linkRouter = require('./routes/link');
const unlinkRouter = require('./routes/unlink');

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
  console.log(req.body);
  console.log('Initialized Discord Client');
  var client = new Discord.Client();
  req.client = client;
  req.guildID = guildId;
  var token = botToken;
  client.login(token);
  client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    next();
  });

}

app.use(initDiscord);
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
  });
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;