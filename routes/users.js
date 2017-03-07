'use strict';

const express = require('express');
const router = express.Router();

const blockchainController = require('../controllers/blockchain');

/* GET users listing. */
router.get('/', blockchainController.foo);

router.get('/jim', blockchainController.queryJim);


module.exports = router;
