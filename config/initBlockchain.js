'use strict';

const hfc = require('hfc');
const fs = require('fs');

const keys = require('./keys');


const caCert = process.env.SDK_CA_CERT_FILE ? process.env.SDK_CA_CERT_FILE : "tlsca.cert";
const tlsOn = (process.env.SDK_TLS == null) ? Boolean(false) : Boolean(parseInt(process.env.SDK_TLS));


const initBlockchain = () => {
  const chain = hfc.newChain(keys.blockchainName);
  chain.setKeyValStore(hfc.newFileKeyValStore('/tmp/keyValStore'));

  chain.setMemberServicesUrl("grpc://localhost:7054");
  chain.addPeer("grpc://localhost:7051");

  console.log("setting registrar ...");

  chain.enroll("WebAppAdmin", "DJY27pEnl16d", function(err, webAppAdmin) {
    if (err)
      return console.log("ERROR: %s", err);

    chain.setRegistrar(webAppAdmin);
    // *** Register and Enroll User ***
    // register and enroll a new user "chainuser"
    console.log("enrolling user ...");
    const registrationRequest = {
      enrollmentID: "chainuser",
      roles: 1,
      affiliation: "bank_a",
      registrar: null
    };

    chain.registerAndEnroll(registrationRequest, function(err, user) {
      if (err)
        return console.log("ERROR: %s", err);
      chainuser = user;
      // *** Deploy Chaincode ***
      console.log("deploying chaincode ...");
      const deployRequest = {
        fcn: "init",
        args: ["a", "100", "b", "200"],
        chaincodePath: "../chaincode/chaincode"
      };
      const deployTx = chainuser.deploy(deployRequest);
      deployTx.on('submitted', function(results) {
        console.log("submitted deploy: %j", results);
      });
      deployTx.on('complete', function(results) {
        console.log("completed deploy: %j", results);
        chaincodeID = results.chaincodeID;
        console.log("chaincodeID:" + chaincodeID);
        // *** Invoke Chaincode ***
        console.log("invoke chaincode ...");
        const invokeRequest = {
          chaincodeID: chaincodeID,
          fcn: "invoke",
          args: ["a", "b", "10"]
        };
        const invokeTx = chainuser.invoke(invokeRequest);
        invokeTx.on('submitted', function(results) {
          console.log("submitted invoke: %j", results);
        });
        invokeTx.on('complete', function(results) {
          console.log("completed invoke: %j", results);
          // *** Query Chaincode ***
          console.log("query chaincode ...");
          const queryRequest = {
            chaincodeID: chaincodeID,
            fcn: "query",
            args: ["a"]
          };
          const queryTx = chainuser.query(queryRequest);
          queryTx.on('submitted', function(results) {
            console.log("submitted query: %j", results);
          });
          queryTx.on('complete', function(results) {
            console.log("completed query: %j", results);
          });
          queryTx.on('error', function(err) {
            console.log("error on query: %j", err);
          });
        });
        invokeTx.on('error', function(err) {
          console.log("error on invoke: %j", err);
        });
      });
      deployTx.on('error', function(err) {
        console.log("error on deploy: %j", err);
      });
    });
  });



  /* if (tlsOn) {
     if (fs.existsSync(caCert)) {
       const pem = fs.readFileSync(caCert);
       console.log("Setting cert to " + caCert);

       if (caCertHost) {
         const grpcOpts = {
           pem: pem,
           hostnameOverride: caCertHost
         }
       } else {
         const grpcOpts = {
           pem: pem
         }
       };

       console.log("Setting membersrvc address to grpcs://" + caAddr);
       chain.setMemberServicesUrl("grpcs://" + caAddr, grpcOpts);

       console.log("Setting peer address to grpcs://" + peerAddr0);
       chain.addPeer("grpcs://" + peerAddr0, grpcOpts);

       //         console.log("Setting eventHub address to grpcs://" + eventHubAddr);
       //         chain.eventHubConnect("grpcs://" + eventHubAddr, grpcOpts);

     } else {
       console.log("TLS was requested but " + caCert + " not found.")
       process.exit(1)
     }
   } else {
     console.log("Setting membersrvc address to grpc://" + caAddr);
     console.log("Setting peer address to grpc://" + peerAddr0);
     //    console.log("Setting eventHub address to grpc://" + eventHubAddr);
     chain.setMemberServicesUrl("grpc://" + caAddr);
     chain.addPeer("grpc://" + peerAddr0);
     //    chain.eventHubConnect("grpc://" + eventHubAddr);
   }
   console.log("$SDK_DEPLOY_MODE: " + deployMode);
   if (deployMode === 'dev') {
     chain.setDevMode(true);
   } else {
     chain.setDevMode(false);
   }
   chain.setDeployWaitTime(parseInt(deployWait));
   chain.setInvokeWaitTime(parseInt(invokeWait));
   return chain;*/


  console.log("\n", " --- Chaincode Setup done --- ", "\n");

  return;
};

module.exports = {
  initBlockchain
}
