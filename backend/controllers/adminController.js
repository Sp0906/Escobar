const Order = require('../models/Order');
const User = require('../models/User');
const Jersey = require('../models/Jersey');
const ReadyMadeDesign = require('../models/ReadyMadeDesign');
const { cloudinary } = require('../config/cloudinary');

// @desc  Get dashboard stats
// @route GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [totalOrders, totalUsers, totalRevenue, pendingOrders] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.countDocuments({ orderStatus: { $in: ['placed', 'confirmed'] } }),
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalUsers,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingOrders,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get all orders (Admin)
// @route GET /api/admin/orders
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.orderStatus = status;

    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .populate('items.design', 'name previewImageUrl')
      .populate('items.readyMadeDesign', 'name imageUrl')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);
    res.json({ success: true, orders, total, pages: Math.ceil(total / limit), currentPage: parseInt(page) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update order status (Admin)
// @route PUT /api/admin/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    order.orderStatus = orderStatus;
    order.statusHistory.push({ status: orderStatus, note: note || '' });
    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get all users (Admin)
// @route GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort('-createdAt');
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Upload ready-made design (Admin)
// @route POST /api/admin/ready-made
const uploadReadyMade = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload an image' });
    const { name, description, category, price } = req.body;
    const design = await ReadyMadeDesign.create({
      name,
      description,
      category,
      price: parseFloat(price),
      imageUrl: req.file.path,
      cloudinaryId: req.file.filename,
      uploadedBy: req.user._id,
    });
    res.status(201).json({ success: true, design });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get all ready-made designs
// @route GET /api/admin/ready-made
const getReadyMadeDesigns = async (req, res) => {
  try {
    const designs = await ReadyMadeDesign.find().sort('-createdAt');
    res.json({ success: true, count: designs.length, designs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Delete ready-made design (Admin)
// @route DELETE /api/admin/ready-made/:id
const deleteReadyMade = async (req, res) => {
  try {
    const design = await ReadyMadeDesign.findById(req.params.id);
    if (!design) return res.status(404).json({ success: false, message: 'Design not found' });
    await cloudinary.uploader.destroy(design.cloudinaryId);
    await design.deleteOne();
    res.json({ success: true, message: 'Ready-made design deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStats,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  uploadReadyMade,
  getReadyMadeDesigns,
  deleteReadyMade,
};
