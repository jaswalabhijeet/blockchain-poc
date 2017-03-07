'use strict';

const hfc = require('hfc');
const config = require('../config');
const initializeBlockchain = config.initBlockchain();


const foo = (req, res) => {
  return res.send('Success');
};


const initBlockchain = (req, res) => {
  initializeBlockchain();
  return res.end("Initialized blockchain!")
};


const queryJim = (req, res) => {
  return res.send('Success');
};

module.exports = {
  foo,
  initBlockchain,
  queryJim
}
