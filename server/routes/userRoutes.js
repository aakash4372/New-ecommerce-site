const express = require('express');
const {
  registerUser,
  loginUser,
  refreshAccessToken,
  getUserProfile,
  updateUserProfile,
} = require('../controllers/userControllers');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh-token', refreshAccessToken);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

module.exports = router;
