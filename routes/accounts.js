const express = require('express');
const router = express.Router();
const accountsController = require('../controllers/accounts');
const auth = require('../middleware/auth');

router.get('/', auth, accountsController.getAccounts);
router.get('/:id', auth, accountsController.getAccount);
router.post('/', auth, accountsController.createAccount);
router.put('/:id', auth, accountsController.updateAccount);
router.delete('/:id', auth, accountsController.deleteAccount);

module.exports = router; 