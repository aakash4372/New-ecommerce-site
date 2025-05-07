const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, default: 'user', enum: ['user', 'admin'] },
  is_active: { type: Boolean, default: true },
  is_email_verified: { type: Boolean, default: false },
  email_verification_otp: { type: String },
  email_otp_expires_at: { type: Date },
  last_login: { type: Date },
  profile_image: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);