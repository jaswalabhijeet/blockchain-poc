'use strict';

const hfc = require('hfc');

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
