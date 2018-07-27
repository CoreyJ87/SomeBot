const express = require('express');
const router = express.Router();
const _ = require('lodash');
require('dotenv').config();
const functions = require('../processors/functions.js');

const knex = require('knex')({
  client: 'mysql',
  connection: {
    host: process.env.READER_HOST,
    user: process.env.READER_USER,
    password: process.env.READER_PASS,
    database: process.env.READER_DBNAME,
  }
});

router.post('/', function(req, res, next) {
  if (req.body.type == "decrypt") {
    knex('users').where({
      discord_id: req.body.theid
    }).select().then(function(results) {
      if (!_.isEmpty(results)) {
        res.json(results)
      }
    })
  } else if (req.body.type == "encrypt") {
    console.log("Converted  " + req.body.theid + " to " + functions.encrypt(req.body.theid));
    knex('users').where({
      discord_id: functions.encrypt(req.body.theid)
    }).select().then(function(results) {
      if (!_.isEmpty(results)) {
        res.json(results)
      }
    })
  } else {
    res.json("{\"response\":\"nope\"}")
  }
});

module.exports = router;