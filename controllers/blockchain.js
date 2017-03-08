'use strict';

const hfc = require('hfc');

const config = require('../config');

const chain = hfc.getChain(config.getChainName());
// chain.setKeyValStore(hfc.newFileKeyValStore(config.getKeyValStorePath()));

const root = (req, res) => {
  return res.send('Success');
};

const queryJim = (req, res) => {
  return res.send("Query Something here");
};

module.exports = {
  root,
  queryJim
}
