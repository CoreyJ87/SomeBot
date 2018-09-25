require('dotenv').config();
const crypto = require('crypto');
const algorithm = process.env.ALGORITHM;
const password = process.env.ENCRYPTION_PASS;
const _ = require('lodash');

let self = module.exports = {
  decrypt: function(text) {
    let decipher = crypto.createDecipher(algorithm, password);
    let dec = decipher.update(text, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
  },
  encrypt: function(text) {
    let cipher = crypto.createCipher(algorithm, password);
    let crypted = cipher.update(text, 'utf8', 'hex');
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
        let isUserPremium = false;
        _.forEach(userProducts, function(singleProduct) {
          if (singleProduct['product'].product_type_id === 1 && singleProduct['status'] !== 2 && singleProduct['status'] !== 22) {
            isUserPremium = true;
          }
        });
        resolve(isUserPremium);
      }
    );
  },
  setNick: function(member, job) {
    member.setNickname(job.data.username).then(function(response) {
        console.log(response);
      console.log("Changed Nickname from ...." + member.displayName + " to " + job.data.username);
    }).catch(function(err) {
        console.log(err);
      return done(new Error('Failed to change name'));
    });
  },
}