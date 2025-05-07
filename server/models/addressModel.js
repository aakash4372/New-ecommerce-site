const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  address_type: { type: String, default: 'home' }, 
  street_address: { type: String, required: true },
  landmark: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postal_code: { type: String, required: true },
  is_default: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Address', addressSchema);
