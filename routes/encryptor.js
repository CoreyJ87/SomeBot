const express = require('express');
const router = express.Router();
const _ = require('lodash');
require('dotenv').config();
const functions = require('../processors/functions.js');

router.post('/', function(req, res, next) {
  let result = {}
  if (req.body.type == "decrypt") {
        result.discord_id=functions.decrypt(req.body.theid);
        res.json(result)
  } else if (req.body.type == "encrypt") {
    console.log("Converted  " + req.body.theid + " to " + functions.encrypt(req.body.theid));
      result.discord_id=functions.encrypt(req.body.theid);
      res.json(result)
  } else {
    res.json("{\"response\":\"nope\"}")
  }
});

module.exports = router;