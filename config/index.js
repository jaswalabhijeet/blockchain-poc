'use strict';

const keys = require('./keys');


module.exports = {
  getChaincodeIdFilePath: () => {
    return keys.chaincodeIdFilePath
  },
  getChainName: () => {
    return keys.blockchainName;
  },
  getKeyValStorePath: () => {
    return keys.keyValStorePath
  },
  getLocalIP: () => {
    return keys.localIP;
  }
};
