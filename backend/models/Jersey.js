const mongoose = require('mongoose');

const jerseySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    imageUrl: { type: String, required: true },
    cloudinaryId: { type: String, required: true },
    category: {
      type: String,
      enum: ['football', 'cricket', 'basketball', 'hockey', 'custom'],
      default: 'custom',
    },
    basePrice: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Jersey', jerseySchema);
