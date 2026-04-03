const Cart = require('../models/Cart');
const Design = require('../models/Design');
const ReadyMadeDesign = require('../models/ReadyMadeDesign');
const Jersey = require('../models/Jersey');

// @desc  Get cart
// @route GET /api/cart
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.design', 'name previewImageUrl customizations')
      .populate('items.readyMadeDesign', 'name imageUrl price')
      .populate('items.jersey', 'name imageUrl basePrice');
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Add item to cart
// @route POST /api/cart
const addToCart = async (req, res) => {
  try {
    const { itemType, designId, readyMadeDesignId, jerseyId, quantity, size } = req.body;
    if (!size) return res.status(400).json({ success: false, message: 'Please select a size' });

    let price = 0;
    let previewImageUrl = null;

    if (itemType === 'custom') {
      const design = await Design.findOne({ _id: designId, user: req.user._id }).populate('jersey');
      if (!design) return res.status(404).json({ success: false, message: 'Design not found' });
      price = design.jersey.basePrice;
      previewImageUrl = design.previewImageUrl;
    } else {
      const rdDesign = await ReadyMadeDesign.findById(readyMadeDesignId);
      if (!rdDesign) return res.status(404).json({ success: false, message: 'Design not found' });
      price = rdDesign.price;
      previewImageUrl = rdDesign.imageUrl;
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const newItem = {
      itemType,
      design: itemType === 'custom' ? designId : undefined,
      readyMadeDesign: itemType === 'readymade' ? readyMadeDesignId : undefined,
      jersey: jerseyId,
      quantity: quantity || 1,
      size,
      price,
      previewImageUrl,
    };

    cart.items.push(newItem);
    await cart.save();

    res.status(201).json({ success: true, message: 'Item added to cart', cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update cart item quantity
// @route PUT /api/cart/:itemId
const updateCartItem = async (req, res) => {
  try {
    const { quantity, size } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found in cart' });

    if (quantity !== undefined) item.quantity = quantity;
    if (size) item.size = size;
    await cart.save();

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Remove item from cart
// @route DELETE /api/cart/:itemId
const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.items = cart.items.filter((item) => item._id.toString() !== req.params.itemId);
    await cart.save();

    res.json({ success: true, message: 'Item removed from cart', cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Clear cart
// @route DELETE /api/cart
const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
