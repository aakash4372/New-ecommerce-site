const Address = require('../models/addressModel');

const createAddress = async (req, res) => {
  const { address_type, street_address, landmark, city, state, postal_code, is_default } = req.body;

  const address = new Address({
    user_id: req.user._id,
    address_type,
    street_address,
    landmark,
    city,
    state,
    postal_code,
    is_default,
  });

  if (is_default) {
    await Address.updateMany({ user_id: req.user._id }, { is_default: false });
  }

  const saved = await address.save();
  res.status(201).json(saved);
};

const getUserAddresses = async (req, res) => {
  const addresses = await Address.find({ user_id: req.user._id });
  res.json(addresses);
};

const updateAddress = async (req, res) => {
  const address = await Address.findOne({ _id: req.params.id, user_id: req.user._id });
  if (!address) return res.status(404).json({ message: 'Address not found' });

  Object.assign(address, req.body);
  if (req.body.is_default) {
    await Address.updateMany({ user_id: req.user._id }, { is_default: false });
  }

  const updated = await address.save();
  res.json(updated);
};

const deleteAddress = async (req, res) => {
  const address = await Address.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
  if (!address) return res.status(404).json({ message: 'Address not found' });
  res.json({ message: 'Address deleted' });
};

module.exports = { createAddress, getUserAddresses, updateAddress, deleteAddress };
