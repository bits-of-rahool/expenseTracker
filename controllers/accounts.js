const Account = require('../models/account');
const Transaction = require('../models/transaction');

// Get all accounts for the authenticated user
exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user._id });
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get one account (with transactions) for the authenticated user
exports.getAccount = async (req, res) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, user: req.user._id });
    if (!account) return res.status(404).json({ message: 'Account not found' });
    const transactions = await Transaction.find({ accountId: account._id, user: req.user._id });
    res.json({ ...account.toObject(), transactions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createAccount = async (req, res) => {
    try {
      const { name, type, amount } = req.body;
      const account = new Account({ name, type, user: req.user._id, amount: amount || 0 });
      await account.save();
      if (amount && Number(amount) > 0) {
        await Transaction.create({
          accountId: account._id,
          amount: Number(amount),
          type: 'credit',
          category: 'Initial Balance',
          description: 'Initial balance on account creation',
          user: req.user._id,
        });
      }
      res.status(201).json(account);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };

// Update account for the authenticated user
exports.updateAccount = async (req, res) => {
  try {
    const { name, type } = req.body;
    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { name, type },
      { new: true }
    );
    if (!account) return res.status(404).json({ message: 'Account not found' });
    res.json(account);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete account for the authenticated user
exports.deleteAccount = async (req, res) => {
  try {
    const account = await Account.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!account) return res.status(404).json({ message: 'Account not found' });
    // Optionally delete all transactions for this account and user
    await Transaction.deleteMany({ accountId: req.params.id, user: req.user._id });
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 