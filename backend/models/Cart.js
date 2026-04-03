const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  itemType: { type: String, enum: ['custom', 'readymade'], required: true },
  design: { type: mongoose.Schema.Types.ObjectId, ref: 'Design' },
  readyMadeDesign: { type: mongoose.Schema.Types.ObjectId, ref: 'ReadyMadeDesign' },
  jersey: { type: mongoose.Schema.Types.ObjectId, ref: 'Jersey' },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  size: { type: String, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], required: true },
  price: { type: Number, required: true },
  previewImageUrl: { type: String },
});

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

cartSchema.virtual('totalPrice').get(function () {
  return this.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
});

cartSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Cart', cartSchema);
