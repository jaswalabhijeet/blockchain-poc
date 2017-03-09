'use strict';

const lib = require('./lib');


module.exports = {
  getEnrollUser: () => {
    return lib.enrollUser;
  },
  getInvokeChaincode: () => {
    return lib.invokeChaincode;
  },
  getQueryChaincode: () => {
    return lib.queryChaincode;
  }
};
