'use strict';

const hfc = require('hfc');
const fs = require('fs');

const config = require('../config');

const localIP = config.getLocalIP();
var chain = null;

// TODO: clean imports - remove unused
const deployMode = process.env.SDK_DEPLOY_MODE ? process.env.SDK_DEPLOY_MODE : "dev";
const caAddr = process.env.SDK_MEMBERSRVC_ADDRESS ? process.env.SDK_MEMBERSRVC_ADDRESS : localIP + ":7054";
// const caCert = process.env.SDK_CA_CERT_FILE ? process.env.SDK_CA_CERT_FILE : "tlsca.cert";
// const caCertHost = process.env.SDK_CA_CERT_HOST ? process.env.SDK_CA_CERT_HOST : "";
const deployWait = process.env.SDK_DEPLOYWAIT ? process.env.SDK_DEPLOYWAIT : 20;
const invokeWait = process.env.SDK_INVOKEWAIT ? process.env.SDK_INVOKEWAIT : 5;
const peerAddr0 = process.env.SDK_PEER_ADDRESS ? process.env.SDK_PEER_ADDRESS : localIP + ":7051";
// const tlsOn = (process.env.SDK_TLS == null) ? Boolean(false) : Boolean(parseInt(process.env.SDK_TLS));



const configBlockchain = () => {

  console.log("\n *** Configuring Blockchain *** \n");

  // chain is global variable (in this file) so that we can reuse it
  chain = hfc.newChain(config.getChainName());
  chain.setKeyValStore(hfc.newFileKeyValStore(__dirname + "/../" + config.getKeyValStorePath()));

  chain.setMemberServicesUrl("grpc://" + localIP + ":7054");
  chain.addPeer("grpc://" + localIP + ":7051");

  chain.setMemberServicesUrl("grpc://" + caAddr);


  console.log("\nSetting membersrvc address to grpc://" + caAddr);
  console.log("\nSetting peer address to grpc://" + peerAddr0);

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

const enrollUser = (user) => {

  return new Promise((resolve, reject) => {
    if (chain == null) {
      return reject("Chain is not initialized yet");
    }

    chain.enroll(user.name, user.secret, function(err, enrolledUser) {
      if (err) {
        console.log("\nERROR: failed to enroll user : %s", user.name, err);
        return reject(err);
      }
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

      const args = [enrolledUser.name, "Test Contact", "The Shire", "42342353"];

      if (deployMode === "dev") {
        deployRequest = {
          fcn: "init",
          args,
          chaincodeName: config.getChainName()
        };
      } else {
        deployRequest = {
          fcn: "init",
          args,
          chaincodePath: "../chaincode/chaincode"
        };
      }

      deployTx = enrolledUser.deploy(deployRequest);

      deployTx.on('complete', function(results) {

        console.log("\n *** Chaincode deployed successfully *** \n");

        const testChaincodeID = results.chaincodeID;

        fs.writeFile(__dirname + "/../" + config.getChaincodeIdFilePath(), testChaincodeID, function(err) {
          if (err) {
            console.log("\n Error: ", err);
            return reject(err);
          }
          console.log("\n *** Chaincode ID is written to file *** \n");
          console.log("\n *** Initial setup Completed *** \n");

          return resolve(true);
        });
      });

      deployTx.on('error', function(err) {
        console.log("\n Error: ", err);
        return reject(err);
      });
    });
  });
};

const invokeChaincode = (enrolledUser, functionToInvoke, args) => {
  let chaincodeID = '';

  return new Promise((resolve, reject) => {
    if (args.length < 4) {
      return reject("Length of args < 4");
    }
    fs.readFile(__dirname + "/../" + config.getChaincodeIdFilePath(), (err, data) => {
      if (err) {
        console.log("\n Error: ", err);
        return reject(err);
      }

      const invokeRequest = {
        chaincodeID: data.toString(), // read from the file
        fcn: functionToInvoke, // name of `function` parameter in `Invoke` in chaincode
        args
      };

      const invokeTx = enrolledUser.invoke(invokeRequest);

      invokeTx.on('complete', function(results) {
        return resolve(results);
      });

      invokeTx.on('error', function(err) {
        console.log("\n *** Failed to invoke chaincode: request=%j, error=%k", invokeRequest, err);
        return reject(err);
      });
    });
  });
};

const queryChaincode = (enrolledUser, functionToQuery, args) => { // `args` is `array`
  let chaincodeID = '';

  return new Promise((resolve, reject) => {
    fs.readFile(__dirname + "/../" + config.getChaincodeIdFilePath(), (err, data) => {
      if (err) {
        console.log("\n Error: ", err);
        return reject(err);
      }

      const queryRequest = {
        chaincodeID: data.toString(), // read from the file
        fcn: functionToQuery, // name of `function` parameter in `Query` in chaincode
        args
      };

      const queryTx = enrolledUser.query(queryRequest);

      queryTx.on('complete', function(results) {
        return resolve(results);
      });

      queryTx.on('error', function(err) {
        console.log("\n *** Failed to query chaincode: request=%j, error=%k", queryRequest, err);
        return reject(err);
      });
    });
  });
};


module.exports = {
  configBlockchain,
  enrollUser,
  deployChaincode,
  invokeChaincode,
  queryChaincode
}
