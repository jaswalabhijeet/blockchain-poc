'use strict';

const hfc = require('hfc');
const fs = require('fs');

const keys = require('./keys');

const localIP = keys.localIP;

const deployMode = process.env.SDK_DEPLOY_MODE ? process.env.SDK_DEPLOY_MODE : "dev";
const caAddr = process.env.SDK_MEMBERSRVC_ADDRESS ? process.env.SDK_MEMBERSRVC_ADDRESS : localIP + ":7054";
const caCert = process.env.SDK_CA_CERT_FILE ? process.env.SDK_CA_CERT_FILE : "tlsca.cert";
const caCertHost = process.env.SDK_CA_CERT_HOST ? process.env.SDK_CA_CERT_HOST : "";
const deployWait = process.env.SDK_DEPLOYWAIT ? process.env.SDK_DEPLOYWAIT : 20;
const invokeWait = process.env.SDK_INVOKEWAIT ? process.env.SDK_INVOKEWAIT : 5;
const peerAddr0 = process.env.SDK_PEER_ADDRESS ? process.env.SDK_PEER_ADDRESS : localIP + ":7051";
const tlsOn = (process.env.SDK_TLS == null) ? Boolean(false) : Boolean(parseInt(process.env.SDK_TLS));



const configBlockchain = () => {
  const chain = hfc.newChain(keys.blockchainName);
  chain.setKeyValStore(hfc.newFileKeyValStore(keys.keyValStorePath));

  try {
    chain.setMemberServicesUrl("grpc://" + localIP + ":7054");
    chain.addPeer("grpc://" + localIP + ":7051");


    console.log("\nSetting membersrvc address to grpc://" + caAddr);
    console.log("\nSetting peer address to grpc://" + peerAddr0);

    chain.setMemberServicesUrl("grpc://" + caAddr);
    chain.addPeer("grpc://" + peerAddr0);
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

  chain.setDeployWaitTime(parseInt(deployWait));
  chain.setInvokeWaitTime(parseInt(invokeWait));

  return enrollUser(chain);
};

const enrollUser = (chain) => {
  chain.enroll("jim", "6avZQLwcUe9b", function(err, enrolledUser) {
    if (err) {
      throw Error("\nERROR: failed to enroll user Jim : %s", err);
    }

    console.log("\n *** Enrolled user Jim successfully *** \n");

    fs.exists(keys.chaincodeIdFilePath, function(exists) {
      if (!exists) {
        console.log('\n *** Deploying chaincode *** \n');
        return deployChaincode(enrolledUser);
      }
      console.log("\n *** Initial setup already done ***\n");
      return queryChaincode(enrolledUser);
    });
  })
};


const deployChaincode = (enrolledUser) => {

  let deployRequest = {};

  if (deployMode === "dev") {
    deployRequest = {
      fcn: "init",
      args: ["a", "100", "b", "200"],
      chaincodeName: keys.blockchainName
    };
  } else {
    deployRequest = {
      fcn: "init",
      args: ["a", "100", "b", "200"],
      chaincodePath: "../chaincode/chaincode"
    };
  }

  const deployTx = enrolledUser.deploy(deployRequest);

  deployTx.on('complete', function(results) {

    console.log("\n *** Chaincode deployed successfully *** \n");

    const testChaincodeID = results.chaincodeID;

    fs.writeFile(keys.chaincodeIdFilePath, testChaincodeID, function(err) {
      if (err) {
        return console.log(err);
      }
      console.log("\n *** Chaincode ID is written to file *** \n");
      console.log("\n *** Initial setup Completed *** \n");

      return queryChaincode(enrolledUser);
    });
  });

  deployTx.on('error', function(err) {
    console.log(err);
    throw err;
  });
};

const queryChaincode = (enrolledUser) => {
  let chaincodeID = '';

  console.log("\n *** Querying chaincode to test *** \n");

  const queryRequest = {
    chaincodeID: keys.blockchainName,
    fcn: "query",
    args: ["a"]
  };
  const tx = enrolledUser.query(queryRequest);

  tx.on('complete', function(results) {
    console.log("\n *** Query completed successfully");
    console.log("\n a = %s", results.result.toString('utf-8'));
    console.log("\n Result of query; results=%j", results);

    console.log("\n\n *** Blockchain Initialization complete *** \n\n")

    return enrolledUser;

  });

  tx.on('error', function(error) {
    console.log("\n *** Failed to query chaincode: request=%j, error=%k", queryRequest, error);
    throw error;
  });
};


module.exports = {
  configBlockchain
}
