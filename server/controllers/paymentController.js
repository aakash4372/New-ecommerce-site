// controllers/paymentController.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/orderModel');
const Payment = require('../models/paymentModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

const createPaymentIntent = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user_id: req.user._id }).populate('items.product_id');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate total amount
    const totalAmount = cart.items.reduce((total, item) => 
      total + (item.quantity * item.price), 0);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount * 100,
      currency: 'usd',
      metadata: { userId: req.user._id.toString() }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const handlePaymentSuccess = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not succeeded' });
    }

    // Create order
    const cart = await Cart.findOne({ user_id: req.user._id }).populate('items.product_id');
    const order = await createOrderFromCart(req.user, cart, paymentIntent);

    res.json({ 
      message: 'Payment successful', 
      order: order.order_number 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createOrderFromCart = async (user, cart, paymentIntent) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create order
    const order = new Order({
      user_id: user._id,
      items: cart.items.map(item => ({
        product_id: item.product_id._id,
        name: item.product_id.name,
        quantity: item.quantity,
        price: item.price
      })),
      subtotal: cart.total,
      shipping_fee: 0, // Calculate actual shipping fee
      total: cart.total,
      payment_method: 'stripe',
      payment_status: 'completed',
      shipping_address: user.addresses.find(a => a.is_default),
      billing_address: user.addresses.find(a => a.is_default)
    });

    // Create payment record
    const payment = new Payment({
      order_id: order._id,
      user_id: user._id,
      amount: order.total,
      payment_method: 'stripe',
      transaction_id: paymentIntent.id,
      status: 'success',
      payment_details: paymentIntent
    });

    // Update product quantities
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product_id, {
        $inc: { quantity: -item.quantity }
      });
    }

    // Save all changes
    await order.save({ session });
    await payment.save({ session });
    await Cart.findByIdAndDelete(cart._id, { session });
    
    await session.commitTransaction();
    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Webhook handler
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // Update payment status
      await Payment.updateOne(
        { transaction_id: paymentIntent.id },
        { status: 'success' }
      );
      break;
    case 'payment_intent.payment_failed':
      const failedIntent = event.data.object;
      await Payment.updateOne(
        { transaction_id: failedIntent.id },
        { status: 'failed' }
      );
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

module.exports = {
  createPaymentIntent,
  handlePaymentSuccess,
  handleWebhook
};