const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactions');
const auth = require('../middleware/auth');

router.get('/', auth, transactionsController.getTransactions);
router.get('/:id', auth, transactionsController.getTransaction);
router.post('/', auth, transactionsController.createTransaction);
router.put('/:id', auth, transactionsController.updateTransaction);
router.delete('/:id', auth, transactionsController.deleteTransaction);

module.exports = router; 