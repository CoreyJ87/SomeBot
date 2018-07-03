require('dotenv').config()
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const Discord = require('discord.js');
const bodyParser = require('body-parser');
const fs = require('fs');
const kue = require('kue');
const process = require('process');
//const linkqueue = require('middleware/linkqueue.js');
//const unlinkqueue = require('middleware/linkqueue.js');
const queue = kue.createQueue();
const guildId = process.env.GUILD_ID;
const botToken = process.env.BOT_TOKEN;
const app = express();
kue.app.listen(3050);

const textResponses = {
  addDefault: "You now have access to all standard RotoGrinders channels.",
  addPremium: "You now have access to the #premium RotoGrinders channel.",
  premiumUnsub: "You may not have realized premium gave you exclusive access to our experts in the #premium channel. Resubscribe today!",
  welcomeMessage: "Hi, welcome to the Rotogrinders discord server! To chat and receive access to any premium channels you will need to link your account to your Rotogrinders account. To link your account, please follow this link. https://rotogrinders.com/partners/discord?id=",
}

const startRouter = require('./routes/start');
const linkRouter = require('./routes/link');
const unlinkRouter = require('./routes/unlink');
const processRouter = require('./routes/processQueue');


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


var checkApiKey = function(req, res, next) {
  if (req.query.apikey == process.env.API_KEY) {
    next();
  } else {
    res.status(401).json({
      unauthorized: true
    })
  }
}

var initDiscord = function(req, res, next) {
  req.queue = queue;
  req.textResponses = textResponses;
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

var initQueue = function(req, res, next) {
  queue.on('error', function(err) {
    console.log('Oops... ', err);
  });
  process.once('SIGTERM', function(sig) {
    queue.shutdown(5000, function(err) {
      console.log('Kue shutdown: ', err || '');
      process.exit(0);
    });
  });

  queue.failed(function(err, ids) {
    ids.forEach(function(id) {
      kue.Job.get(id, function(err, job) {
        // Add failed jobs back to queue
        job.inactive();
      });
    });
  });
  next();
}

app.use(checkApiKey);
app.use(initQueue);
app.use(initDiscord);

app.use('/start', startRouter);
app.use('/link', linkRouter);
app.use('/processqueue', processRouter)
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