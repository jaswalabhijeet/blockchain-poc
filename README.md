# blockchain-poc
Blockchain POC using Hyperledger Fabric v0.6

## Setup

* Clone the repo
```console
git clone https://github.com/aarongoa/blockchain-poc
cd blockchain-poc
npm install
```
* Run docker containers
```console
cd setup_files
docker-compose -f docker-compose-with-membersrvc.yml up
```

* Compile Chaincode
```console
cd chaincode
go build
```

* Run Chaincode in dev mode or production mode

  * For dev mode
  ```console
  CORE_CHAINCODE_ID_NAME=mycc CORE_PEER_ADDRESS=0.0.0.0:7051 ./chaincode
  ```

Find detailed instructions [here](https://github.com/hyperledger/fabric/blob/v0.6/docs/Setup/Chaincode-setup.md)


## License

MIT
