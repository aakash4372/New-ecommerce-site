const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');

const registerUser = async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: 'User already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    first_name,
    last_name,
    email,
    password: hashedPassword,
  });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  res.status(201).json({ user, accessToken, refreshToken });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  user.last_login = new Date();
  await user.save();
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  res.json({ user, accessToken, refreshToken });
};

const refreshAccessToken = (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const accessToken = generateAccessToken(decoded.userId);
    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
};

const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.first_name = req.body.first_name || user.first_name;
    user.last_name = req.body.last_name || user.last_name;
    user.phone = req.body.phone || user.phone;
    user.profile_image = req.body.profile_image || user.profile_image;
    const updatedUser = await user.save();
    res.json(updatedUser);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  getUserProfile,
  updateUserProfile,
};