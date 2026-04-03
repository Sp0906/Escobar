const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc  Create Razorpay order
// @route POST /api/payment/create-order
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    const options = {
      amount: Math.round(amount * 100), // paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Verify payment and create order
// @route POST /api/payment/verify
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData,
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Create the order
    const { items, shippingAddress, subtotal, shippingCharge } = orderData;
    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      subtotal,
      shippingCharge,
      totalAmount: subtotal + shippingCharge,
      paymentStatus: 'paid',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      statusHistory: [{ status: 'placed', note: 'Order placed successfully' }],
    });

    // Clear cart after successful payment
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    res.json({ success: true, message: 'Payment verified and order placed', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get Razorpay key
// @route GET /api/payment/key
const getRazorpayKey = async (req, res) => {
  res.json({ success: true, key: process.env.RAZORPAY_KEY_ID });
};

module.exports = { createRazorpayOrder, verifyPayment, getRazorpayKey };
