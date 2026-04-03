const express = require('express');
const router = express.Router();
const { getUserOrders, getOrder, cancelOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getUserOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
