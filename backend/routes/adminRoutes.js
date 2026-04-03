const express = require('express');
const router = express.Router();
const {
  getStats,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  uploadReadyMade,
  getReadyMadeDesigns,
  deleteReadyMade,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');
const { uploadReadyMade: readyMadeUpload } = require('../config/cloudinary');

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/users', getAllUsers);
router.get('/ready-made', getReadyMadeDesigns);
router.post('/ready-made', readyMadeUpload.single('image'), uploadReadyMade);
router.delete('/ready-made/:id', deleteReadyMade);

module.exports = router;
