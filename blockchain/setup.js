/*
  set up the blockchain using following steps:
    - configure blockchain values
    - enroll/registerAndEnroll user
    - deploy cc using enrolled user
    - simple query on blockchain to test
*/

'use strict';

const blockchainHelpers = require('./helpers');

const initBlockchain = () => {

  // 1. configure blockchain values
  const chain = blockchainHelpers.configBlockchain();

  // 2. enroll user Jim
  const user = {
    name: "jim",
    secret: "6avZQLwcUe9b"
  };

  let enrolledUser = null;

  blockchainHelpers.enrollUser(user)
    .then((user) => {
      enrolledUser = user;
      return enrolledUser;
    })
    .then((enrolledUser) => {
      // 3. deploy chaincode using `enrolledUser`
      return blockchainHelpers.deployChaincode(enrolledUser);
    })
    .then((deployedFlag) => {
      blockchainHelpers.queryChaincode(enrolledUser, ["a"]);
    })
    .catch((err) => {
      console.log("\n *** ERROR in blockcain `setup.js` ***\n", err);
      throw new Error(err);
    });
};

module.exports = {
  initBlockchain
};
