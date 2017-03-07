'use strict';

const keys = require('./keys');
const blockchainSetup = require('./initBlockchain');


module.exports = {
  getChainName : () => {
    return keys.blockchainName;
  },
  getBlockchainSetup : () => {
    return blockchainSetup.configBlockchain;
  },
  getLocalIP: () => {
  	return keys.localIP;
  }
};
