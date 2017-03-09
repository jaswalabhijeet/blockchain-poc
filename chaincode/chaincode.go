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

type Contact struct{
  Name  string  `json:"name"`
  Address string  `json:"address"`
  Number string  `json:"number"`
}

// Init : Adds initial block to chaincode on blockchain network
func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
  var A, B string    // Entities
  var Aval, Bval int // Asset holdings
  var err error

  if len(args) != 4 {
    return nil, errors.New("Incorrect number of arguments. Expecting 4")
  }

  // Initialize the chaincode
  A = args[0]
  Aval, err = strconv.Atoi(args[1])
  if err != nil {
    return nil, errors.New("Expecting integer value for asset holding")
  }
  B = args[2]
  Bval, err = strconv.Atoi(args[3])
  if err != nil {
    return nil, errors.New("Expecting integer value for asset holding")
  }
  fmt.Printf("Aval = %d, Bval = %d\n", Aval, Bval)

  // Write the state to the ledger
  err = stub.PutState(A, []byte(strconv.Itoa(Aval)))
  if err != nil {
    return nil, err
  }

  err = stub.PutState(B, []byte(strconv.Itoa(Bval)))
  if err != nil {
    return nil, err
  }

  return nil, nil
}


// Invoke : Adds a new block to the blockchain network
func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
  if function == "init" {
    return t.Init(stub, "init", args)
  } else if function == "createContact" {
    return t.createContact(stub, args)
  }

  fmt.Println("invoke did not find func: " + function) //error
  return nil, errors.New("Received unknown function invocation")
}

func (t *SimpleChaincode) createContact(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {

  if len(args) != 4 {
    return nil, errors.New("Incorrect number of arguments. Expected 4 arguments")
  }

  var err error
  // Reference to struct
  newContact := new(Contact)
  retrievedContactsArray := []*Contact{}

  //Set key
  var ownerName = args[0]

  newContact.Name = args[1]
  newContact.Address = args[2]
  newContact.Number = args[3]

  // Get owner's state from blockchain network
  valAsBytes, _ := stub.GetState(ownerName)
  json.Unmarshal(valAsBytes, &retrievedContactsArray)  // may be `&retrievedContactsArray`

  retrievedContactsArray = append(retrievedContactsArray, newContact)

  // Convert to bytes and store in blockchain

  bytes, err := json.Marshal(retrievedContactsArray)
  if err != nil {
    fmt.Println(err)
    return nil,err
  }

  err = stub.PutState(ownerName, bytes)
  if err != nil {
    return nil, err
  }

  return nil, nil
}

func (t *SimpleChaincode) Query(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
  fmt.Println("query is running " + function)

  // Handle different functions
  if function == "readContacts" {
    return t.readContacts(stub, args)
  }

  return nil, errors.New("Received unknown function query: " + function)
}


func (t *SimpleChaincode) readContacts(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
  if len(args) != 1 {
    return nil, errors.New("Invalid numbers of arguments. Expected 1")
  }

  ownerName := args[0]

  valAsBytes,_ := stub.GetState(ownerName)

  return valAsBytes, nil
}

func main() {
  err := shim.Start(new(SimpleChaincode))
  if err != nil {
    fmt.Printf("Error starting Simple chaincode: %s", err)
  }
}



