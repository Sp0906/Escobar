const Order = require('../models/Order');

// @desc  Get user orders
// @route GET /api/orders
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.design', 'name previewImageUrl')
      .populate('items.readyMadeDesign', 'name imageUrl')
      .sort('-createdAt');
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get single order
// @route GET /api/orders/:id
const getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
      .populate('items.design', 'name previewImageUrl customizations canvasData')
      .populate('items.readyMadeDesign', 'name imageUrl')
      .populate('items.jersey', 'name imageUrl');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Cancel order
// @route PUT /api/orders/:id/cancel
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!['placed', 'confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
    }
    order.orderStatus = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', note: req.body.reason || 'Cancelled by user' });
    await order.save();
    res.json({ success: true, message: 'Order cancelled', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUserOrders, getOrder, cancelOrder };
