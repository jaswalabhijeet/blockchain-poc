'use strict';

const express = require('express');
const router = express.Router();

const blockchainController = require('../controllers/blockchain');

/* GET users listing. */
router.get('/', blockchainController.root);

router.get('/jim', blockchainController.queryJim);


module.exports = router;
