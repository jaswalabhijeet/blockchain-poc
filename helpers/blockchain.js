'use strict';

const hfc = require('hfc');
const fs = require('fs');

const config = require('../config');

const localIP = config.getLocalIP();

const deployMode = process.env.SDK_DEPLOY_MODE ? process.env.SDK_DEPLOY_MODE : "dev";
const caAddr = process.env.SDK_MEMBERSRVC_ADDRESS ? process.env.SDK_MEMBERSRVC_ADDRESS : localIP + ":7054";
const caCert = process.env.SDK_CA_CERT_FILE ? process.env.SDK_CA_CERT_FILE : "tlsca.cert";
const caCertHost = process.env.SDK_CA_CERT_HOST ? process.env.SDK_CA_CERT_HOST : "";
const deployWait = process.env.SDK_DEPLOYWAIT ? process.env.SDK_DEPLOYWAIT : 20;
const invokeWait = process.env.SDK_INVOKEWAIT ? process.env.SDK_INVOKEWAIT : 5;
const peerAddr0 = process.env.SDK_PEER_ADDRESS ? process.env.SDK_PEER_ADDRESS : localIP + ":7051";
const tlsOn = (process.env.SDK_TLS == null) ? Boolean(false) : Boolean(parseInt(process.env.SDK_TLS));



const configBlockchain = () => {

  console.log("\n *** Configuring Blockchain *** \n");

  const chain = hfc.newChain(config.getChainName());
  chain.setKeyValStore(hfc.newFileKeyValStore(__dirname + "/../" + config.getKeyValStorePath()));

  try {
    chain.setMemberServicesUrl("grpc://" + localIP + ":7054");
    chain.addPeer("grpc://" + localIP + ":7051");

    chain.setMemberServicesUrl("grpc://" + caAddr);
    chain.addPeer("grpc://" + peerAddr0);


    console.log("\nSetting membersrvc address to grpc://" + caAddr);
    console.log("\nSetting peer address to grpc://" + peerAddr0);
  } catch (err) {
    console.error(err);
    console.log("\n *** Peer was already enrolled *** \n");
  }

  console.log("\n$SDK_DEPLOY_MODE: " + deployMode);

  if (deployMode === 'dev') {
    chain.setDevMode(true);
  } else {
    chain.setDevMode(false);
  }

  console.log("\ndeployWait : ", deployWait);
  console.log("\ninvokeWait : ", invokeWait);

  chain.setDeployWaitTime(parseInt(deployWait));
  chain.setInvokeWaitTime(parseInt(invokeWait));

  console.log("\n *** Configuring Blockchain Done *** \n")

  return chain;
};

const enrollUser = (chain, user) => {

  return new Promise((resolve, reject) => {
    chain.enroll(user.name, user.secret, function(err, enrolledUser) {
      if (err) {
        throw Error("\nERROR: failed to enroll user : %s", user.name, err);
      }

      console.log("\n *** Enrolled user %s successfully *** \n", user.name);

      return resolve(enrolledUser);
    });
  });
};


const deployChaincode = (enrolledUser) => {

  let deployRequest = {};
  let deployTx = null;

  return new Promise((resolve, reject) => {
    fs.exists(__dirname + "/../" + config.getChaincodeIdFilePath(), function(exists) {
      if (exists) {
        console.log("\n *** Initial setup already done ***\n");
        return resolve(true);
      }

      if (deployMode === "dev") {
        deployRequest = {
          fcn: "init",
          args: ["a", "100", "b", "200"],
          chaincodeName: config.getChainName()
        };
      } else {
        deployRequest = {
          fcn: "init",
          args: ["a", "100", "b", "200"],
          chaincodePath: "../chaincode/chaincode"
        };
      }

      deployTx = enrolledUser.deploy(deployRequest);

      deployTx.on('complete', function(results) {

        console.log("\n *** Chaincode deployed successfully *** \n");

        const testChaincodeID = results.chaincodeID;

        fs.writeFile(__dirname + "/../" + config.getChaincodeIdFilePath(), testChaincodeID, function(err) {
          if (err) {
            console.log(err);
            throw err;
          }
          console.log("\n *** Chaincode ID is written to file *** \n");
          console.log("\n *** Initial setup Completed *** \n");

          resolve(true);
        });
      });

      deployTx.on('error', function(err) {
        console.log(err);
        throw err;
      });
    });
  });
};

const queryChaincode = (enrolledUser, args) => { // `args` is `array`
  let chaincodeID = '';

  console.log("\n *** Querying chaincode to test *** \n");

  return new Promise((resolve, reject) => {
    fs.readFile(__dirname + "/../" + config.getChaincodeIdFilePath(), (err, data) => {
      if (err) {
        console.log(err);
        throw err;
      }

      const queryRequest = {
        chaincodeID: data.toString(), // read from the file
        fcn: "query",
        args
      };

      const queryTx = enrolledUser.query(queryRequest);

      queryTx.on('complete', function(results) {
        console.log("\n *** Query completed successfully ***\n");
        console.log("\n", results.result.toString('utf-8'));
        console.log("\n Result of query; results=%j", results);

        console.log("\n\n *** Blockchain Initialization complete *** \n\n")

        return resolve(true);

      });

      queryTx.on('error', function(error) {
        console.log("\n *** Failed to query chaincode: request=%j, error=%k", queryRequest, error);
        throw error;
      });
    });
  });

};


module.exports = {
  configBlockchain,
  enrollUser,
  deployChaincode,
  queryChaincode
}
