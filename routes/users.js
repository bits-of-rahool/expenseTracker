const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

router.get('/:id', authController.getUser);
router.put('/:id', authController.updateUser);
router.put('/:id/password', authController.updatePassword);
module.exports = router;