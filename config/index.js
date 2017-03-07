'use strict';

const keys = require('./keys');
const blockchainSetup = require('./initBlockchain');


module.exports = {
  getChainName : () => {
    return keys.blockchainName;
  },
  initBlockchain : () => {
    return blockchainSetup.initBlockchain;
  }
};
