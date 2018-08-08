require('dotenv').config();
const crypto = require('crypto');
const algorithm = process.env.ALGORITHM;
const password = process.env.ENCRYPTION_PASS;
const _ = require('lodash')

var self = module.exports = {
  decrypt: function(text) {
    var decipher = crypto.createDecipher(algorithm, password)
    var dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
  },
  encrypt: function(text) {
    var cipher = crypto.createCipher(algorithm, password)
    var crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
  },
  isMasterProcess: function() {
    if (_.has(process.env, 'NODE APP INSTANCE')) {
      return _.get(process.env, 'NODE APP INSTANCE') === '0';
    } else if (_.has(process.env, 'NODE_APP_INSTANCE')) {
      return _.get(process.env, 'NODE_APP_INSTANCE') === '0';
    } else {
      return cluster.isMaster;
    }
  },


  isUserPremium: function(userProducts) {
    return new Promise(
      function(resolve, reject) {
        var isUserPremium = false;
        _.forEach(userProducts, function(singleProduct) {
          if (singleProduct['product'].product_type_id == 1 && singleProduct['status'] != 2 && singleProduct['status'] != 22) {
            isUserPremium = true;
          }
        });
        resolve(isUserPremium);
      }
    );

  },
  isNFLPreseason: function(userProducts) {
    return new Promise(
      function(resolve, reject) {
        var isUserNFLPreason = false;
        _.forEach(userProducts, function(singleProduct) {
          if (singleProduct['product'].id == 618 && singleProduct['product'].product_type_id == 2 && singleProduct['status'] != 2 && singleProduct['status'] != 22) {
            isUserNFLPreason = true;
          }
        });
        resolve(isUserNFLPreason);
      })
  },

  setNick: function(member, job) {
    member.setNickname(job.data.username).then(function(response) {
      console.log("Changed Nickname from ...." + member.displayName + " to " + job.data.username);
    }).catch(function(err) {
      return done(new Error('Failed to change name'))
      console.log(err)
    });
  },
}