package main 

import (
    "encoding/json"
    "fmt"
    "errors"
    "strconv"
    "github.com/hyperledger/fabric/core/chaincode/shim"
)

type SimpleChaincode struct{
}

type Owner struct{
  Name  string  `json:"Name"`
  Address string  `json:"Address"`
  Number int64  `json:"Number"`
}

// Init : Adds initial block to chaincode on blockchain network
func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
  var Aval int
  var err error

  if len(args) != 1 {
    return nil, errors.New("Incorrect number of arguments. Expecting 1")
  }

  // Initialize the chaincode
  Aval, err = strconv.Atoi(args[0])
  if err != nil {
    return nil, errors.New("Expecting integer value for asset holding")
  }

  // Write the state to the ledger
  err = stub.PutState("abc", []byte(strconv.Itoa(Aval))) //making a test var "abc", I find it handy to read/write to it right away to test the network
  if err != nil {
    return nil, err
  }

  return nil, nil
}


// Invoke : Adds a new block to the blockchain network
func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
  if function == "init" {
    // Initial block - Puts 'abc' and '99'
    return t.Init(stub, "init", args)
  } else if function == "createContact" {
    // Pushes property details to Blockchain network
    return t.createContact(stub, args)
  } 

  fmt.Println("invoke did not find func: " + function) //error
  return nil, errors.New("Received unknown function invocation")
}

func (t *SimpleChaincode) createContact(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
  
  if len(args) != 3 {
    return nil, errors.New("Incorrect number of arguments. Expected 3 arguments")
  }

  var err error
  // Reference to struct
  var owner Owner

  //Set key
  var ownerName = args[0]
  owner.Name = ownerName

  var addressValue = args[1]
  owner.Address = addressValue

  var contactValue int64
  contactValue, _ = strconv.ParseInt(args[2], 10, 64)
  owner.Number = contactValue

  // Convert to bytes and store in blockchain

  bytes,_ := json.Marshal(owner)
  err = stub.PutState(ownerName, bytes)

  if err != nil {
    return nil, errors.New("Putstate failed")
  }

  return nil,nil
}

func (t *SimpleChaincode) Query(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
  fmt.Println("query is running " + function)

  // Handle different functions
  if function == "readContact" {
    return t.readContact(stub, args)
  }

  return nil, errors.New("Received unknown function query: " + function)
}


func (t *SimpleChaincode) readContact(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
  if len(args) != 1 {
    return nil, errors.New("Invalid numbers of arguments. Expected ")
  }

  var ownerName = args[0]

  var owner Owner

  valAsBytes,_ := stub.GetState(ownerName)

  json.Unmarshal(valAsBytes,&owner)

  return valAsBytes,nil
}

func main() {
  err := shim.Start(new(SimpleChaincode))
  if err != nil {
    fmt.Printf("Error starting Simple chaincode: %s", err)
  }
}



