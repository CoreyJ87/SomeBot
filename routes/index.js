var express = require('express');
var router = express.Router();
const _ = require('lodash');

router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Express'
  });
});

module.exports = router;