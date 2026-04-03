const mongoose = require('mongoose');

const readyMadeDesignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    imageUrl: { type: String, required: true },
    cloudinaryId: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: ['football', 'cricket', 'basketball', 'hockey', 'custom'],
      default: 'custom',
    },
    isActive: { type: Boolean, default: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReadyMadeDesign', readyMadeDesignSchema);
