'use strict';

const hfc = require('hfc');

const root = (req, res) => {
  return res.send('Success');
};

const queryJim = (req, res) => {
  return res.send(foo);
};

module.exports = {
  root,
  queryJim
}
