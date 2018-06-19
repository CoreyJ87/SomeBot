var express = require('express');
var router = express.Router();

/* GET start listing. */
router.get('/', function(req, res, next) {
  res.send('Bot has been started');
});

module.exports = router;