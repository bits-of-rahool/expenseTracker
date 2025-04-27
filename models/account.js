const mongoose = require('mongoose');
const AccountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  amount: { type: Number, default: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Add this line
});
module.exports = mongoose.model('Account', AccountSchema);