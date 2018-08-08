const express = require('express');
const router = express.Router();
const _ = require('lodash');
const kue = require('kue');
const functions = require('../processors/functions.js');
require('dotenv').config();

router.get('/', function(req, res, next) {
  var client = req.client;

});

module.exports = router;