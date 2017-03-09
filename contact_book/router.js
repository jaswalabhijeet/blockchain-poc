'use strict';

const express = require('express');
const router = express.Router();

const controller = require('./controller');

router.get('/', controller.getAllContacts);
router.get('/:id', controller.getContactById);
router.post('/', controller.createContact);
router.post('/:id', controller.updateContactById);

module.exports = router;
