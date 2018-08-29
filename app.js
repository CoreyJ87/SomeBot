require('dotenv').config();
const Promise = require("bluebird");
const express = require('express');
const fs = require('fs');
const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const kue = require('kue');
const kueUiExpress = require('kue-ui-express');
const Discord = require('discord.js');
const _ = require('lodash');
const cluster = require('cluster')

const functions = require('./processors/functions.js');
const linkProcessor = require('./processors/linkqueue.js');
const cancelProcessor = require('./processors/cancelqueue.js');
const unbanProcessor = require('./processors/unbanqueue.js');
const banProcessor = require('./processors/banqueue.js');
const eventListeners = require('./processors/eventlisteners.js')
const queue = kue.createQueue();
const guildId = process.env.GUILD_ID;
const botToken = process.env.BOT_TOKEN;

const app = express();
kueUiExpress(app, '/thequeue/', '/kue-api');
var client = new Discord.Client();

const textResponses = {
  addCFB: "You now have access to the College Football channel",
  addDefault: "You now have access to all standard RotoGrinders channels.",
  addPremium: "You now have access to the #premium RotoGrinders channel.",
  premiumUnsub: "You may not have realized premium gave you exclusive access to our experts in the #premium channel. Resubscribe today!",
  welcomeMessage: "Hi, welcome to the Rotogrinders discord server! To chat and receive access to any premium channels you will need to link your account to your Rotogrinders account. To link your account, please follow this link. https://rotogrinders.com/partners/discord?id=",
  upsell: "This is a test of the emergency upsell system",
  nflPreseason: "You now have access to the NFL Preseason channel",
}

const linkRouter = require('./routes/link');
const purchaseRouter = require('./routes/purchase');
const cancelRouter = require('./routes/cancel');
const encryptRouter = require('./routes/encryptor');
const banRouter = require('./routes/ban');
const unbanRouter = require('./routes/unban');
const upsellRouter = require('./routes/upsell');



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
  if (req.query.apikey == process.env.API_KEY || req.originalUrl == "/kue" || req.originalUrl == "/kue-api") {
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
  req.client = client;
  next();
  console.log('Initialized Queue and Client');
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
app.use('/kue-api/', kue.app);
app.use(checkApiKey);
app.use(initQueue);
app.use(initDiscord);

app.use('/link', linkRouter);
app.use('/purchase', purchaseRouter);
app.use('/cancel', cancelRouter);
app.use('/encryptor', encryptRouter);
app.use('/ban', banRouter);
app.use('/unban', unbanRouter)
app.use('/upsell', upsellRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

client.login(botToken);

client.on('ready', () => {
  client.user.setPresence({ game: { name: 'with RG user permissions' }, status: 'online' })
  console.log(`Logged in as ${client.user.tag}!`);
  linkProcessor.queueInit(client, queue, textResponses);
  cancelProcessor.queueInit(client, queue, textResponses);
  banProcessor.queueInit(client, queue);
  unbanProcessor.queueInit(client, queue);

  if (functions.isMasterProcess())
    eventListeners.eventListenersInit(client, textResponses);
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
