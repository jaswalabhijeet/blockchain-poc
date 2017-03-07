'use strict';

const express = require('express');
const router = express.Router();

const blockchainController = require('../controllers/blockchain');

/* GET users listing. */
router.get('/', blockchainController.foo);

router.get('/jim', blockchainController.queryJim);

router.post('/initBlockchain', blockchainController.initBlockchain);


module.exports = router;
