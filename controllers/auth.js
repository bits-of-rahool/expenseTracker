const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Account = require('../models/account');
// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'yBJNVJFgvHUiyk%^&6UYHb', {
    expiresIn: '30d'
  });
};

// Get user by ID
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    console.log('Password update attempt:', { userId: req.params.id });
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      console.log('Password update failed: User not found', { userId: req.params.id });
      return res.status(404).json({ message: 'User not found' });
    }

    if (currentPassword == newPassword) {
      console.log('Password update failed: New password same as current', { userId: user._id });
      return res.status(400).json({ message: 'New password cannot be the same as the current password' });
    }

    if (newPassword.length < 6) {
      console.log('Password update failed: Password too short', { userId: user._id });
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    console.log('Password match check:', { userId: user._id, isMatch });

    if (!isMatch) {
      console.log('Password update failed: Incorrect current password', { userId: user._id });
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    user.password = newPassword;
    await user.save();
    console.log('Password updated successfully', { userId: user._id });

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user by ID
exports.updateUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true, runValidators: true, select: '-password' }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Register new user
exports.register = async (req, res) => {
  try {
    console.log('Registration attempt:', { email: req.body.email, name: req.body.name });
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Registration failed: User already exists', { email });
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password
    });

    await user.save();
    console.log('User created successfully', { userId: user._id, email });

    const defaultAccount = new Account({
      user: user._id,
      name: 'Default Account', 
      type: 'Bank',            
      amount: 0
    });

    await defaultAccount.save();
    // Generate token
    const token = generateToken(user._id);
    console.log('Registration successful', { userId: user._id, email });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    console.log('Login attempt:', { email: req.body.email });
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Login failed: User not found', { email });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Login failed: Invalid password', { email });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);
    console.log('Login successful', { email, userId: user._id });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
}; 