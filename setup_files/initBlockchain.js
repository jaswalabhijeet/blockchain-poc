'use strict';

const blockchainHelpers = require('../helpers/blockchain');

const initBlockchain = () => {

  // 1. configure blockchain values
  const chain = blockchainHelpers.configBlockchain();

  // 2. enroll user Jim
  const user = {
    name: "jim",
    secret: "6avZQLwcUe9b"
  };

  let enrolledUser = null;

  blockchainHelpers.enrollUser(chain, user)
    .then((user) => {
      enrolledUser = user;
      return enrolledUser;
    })
    .then((enrolledUser) => {
      // 3. deploy chaincode using `enrolledUser`
      return blockchainHelpers.deployChaincode(enrolledUser);
    }).then((deployedFlag) => {
      blockchainHelpers.queryChaincode(enrolledUser, ["a"]);
    });
};

module.exports = {
  initBlockchain
};
