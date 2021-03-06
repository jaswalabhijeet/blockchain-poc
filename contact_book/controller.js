'use strict';

const blockchainLib = require('../blockchain/');

const enrollUser = blockchainLib.getEnrollUser();
const invokeChaincode = blockchainLib.getInvokeChaincode();
const queryChaincode = blockchainLib.getQueryChaincode();

const createContact = (req, res) => {

  /*const user = {
    "name": req.body.user.name,
    "secret": req.body.user.secret
  };*/

  const user = {
    "name": 'jim',
    "secret": '6avZQLwcUe9b'
  };

  const contact = {
    "name": req.body.contact.name,
    "address": req.body.contact.address,
    "number": req.body.contact.number
  };

  enrollUser(user)
    .then((enrolledUser) => {
      return invokeChaincode(enrolledUser, "createContact", [user.name, contact.name, contact.address, contact.number]);
    })
    .then((createdContact) => {
      return res.status(201).json(createdContact);
    })
    .catch((err) => {
      console.log("\n *** Error creating contact:", err);
      return res.status(500).end("Something went wrong. Check console");
    });
};

const getAllContacts = (req, res) => {

  /*const user = {
    "name": req.body.user.name,
    "secret": req.body.user.secret
  };*/

  const user = {
    "name": 'jim',
    "secret": '6avZQLwcUe9b'
  };

  enrollUser(user)
    .then((enrolledUser) => {
      return queryChaincode(enrolledUser, "readContacts", [user.name]);
    })
    .then((returnedContacts) => {
      return res.status(200).json(JSON.parse(returnedContacts.result.toString('utf-8')));
    })
    .catch((err) => {
      console.log("\n *** Error reading contact:", err);
      return res.status(500).end("Something went wrong. Check console");
    });
};

const getContactById = (req, res) => {
  return res.send('Success');
};

const updateContactById = (req, res) => {
  return res.send('Success');
};

module.exports = {
  createContact,
  getAllContacts,
  getContactById,
  updateContactById
}
