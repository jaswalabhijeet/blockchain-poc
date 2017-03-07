'use strict';

const hfc = require('hfc');

const foo = (req, res) => {
  return res.send('Success');
};

const queryJim = (req, res) => {
  return res.send('Query something here');
};

module.exports = {
  foo,
  queryJim
}
