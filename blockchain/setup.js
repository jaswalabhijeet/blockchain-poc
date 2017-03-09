/*
  set up the blockchain using following steps:
    - configure blockchain values
    - enroll/registerAndEnroll user
    - deploy cc using enrolled user
    - simple query on blockchain to test
*/

'use strict';

const blockchainLib = require('./lib');

const initBlockchain = () => {

  // 1. configure blockchain values
  const chain = blockchainLib.configBlockchain();

  // 2. enroll user Jim
  const user = {
    name: "jim",
    secret: "6avZQLwcUe9b"
  };

  let enrolledUser = null;

  blockchainLib.enrollUser(user)
    .then((user) => {
      enrolledUser = user;
      console.log("\n *** Enrolled user %s successfully *** \n", user.name);
      return enrolledUser;
    })
    .then((enrolledUser) => {
      // 3. deploy chaincode using `enrolledUser`
      return blockchainLib.deployChaincode(enrolledUser);
    })
    .then((deployedFlag) => {
      console.log("\n *** Querying chaincode to test *** \n");
      return blockchainLib.queryChaincode(enrolledUser, "readContacts", [enrolledUser.name]);
    })
    .then((results) => {
      console.log("\n *** Query completed successfully ***\n");
      console.log("\n", results.result.toString('utf-8'));
      console.log("\n Result of query; results=", results);

      console.log("\n\n *** Blockchain Initialization complete *** \n\n");
    })
    .catch((err) => {
      console.log("\n *** ERROR in blockcain `setup.js` ***\n", err);
      throw new Error(err);
    });
};

module.exports = {
  initBlockchain
};
