const Transaction = require('../models/transaction');
const Account = require('../models/account');

// Get all transactions for the authenticated user (with optional filters)
exports.getTransactions = async (req, res) => {
  try {
    const { accountId, type, from, to } = req.query;
    let filter = { user: req.user._id };
    if (accountId) filter.accountId = accountId;
    if (type) filter.type = type;
    if (from || to) filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
    const transactions = await Transaction.find(filter).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get one transaction for the authenticated user
exports.getTransaction = async (req, res) => {
  try {
    const tx = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });
    res.json(tx);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create transaction and update account balance for the authenticated user
exports.createTransaction = async (req, res) => {
  try {
    const { accountId, amount, type, category, description, date } = req.body;
    const tx = new Transaction({ accountId, amount, type, category, description, date, user: req.user._id });
    await tx.save();
    // Update account balance
    const account = await Account.findOne({ _id: accountId, user: req.user._id });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    account.amount = account.amount || 0;
    account.amount = type === 'credit' ? account.amount + amount : account.amount - amount;
    await account.save();
    res.status(201).json(tx);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update transaction and update account balance for the authenticated user
exports.updateTransaction = async (req, res) => {
  try {
    const { amount, type, category, description, date } = req.body;
    const tx = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });
    // Reverse old transaction effect
    const account = await Account.findOne({ _id: tx.accountId, user: req.user._id });
    if (!account) return res.status(404).json({ message: 'Account not found' });
    if (tx.type === 'credit') {
      account.amount -= tx.amount;
    } else {
      account.amount += tx.amount;
    }
    // Apply new transaction effect
    if (type === 'credit') {
      account.amount += amount;
    } else {
      account.amount -= amount;
    }
    await account.save();
    // Update transaction
    tx.amount = amount;
    tx.type = type;
    tx.category = category;
    tx.description = description;
    tx.date = date;
    await tx.save();
    res.json(tx);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete transaction and update account balance for the authenticated user
exports.deleteTransaction = async (req, res) => {
  try {
    const tx = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });
    // Update account balance
    const account = await Account.findOne({ _id: tx.accountId, user: req.user._id });
    if (account) {
      account.amount = account.amount || 0;
      account.amount = tx.type === 'credit' ? account.amount - tx.amount : account.amount + tx.amount;
      await account.save();
    }
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 