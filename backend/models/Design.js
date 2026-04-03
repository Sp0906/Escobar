const mongoose = require('mongoose');

const designSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jersey: { type: mongoose.Schema.Types.ObjectId, ref: 'Jersey', required: true },
    name: { type: String, default: 'My Design', trim: true },
    // Fabric.js canvas JSON state
    canvasData: { type: Object, required: true },
    // Rendered preview image
    previewImageUrl: { type: String },
    previewCloudinaryId: { type: String },
    customizations: {
      playerName: String,
      playerNumber: String,
      textColor: String,
      fontSize: Number,
      logoUrl: String,
      logoCloudinaryId: String,
    },
    isReadyMade: { type: Boolean, default: false },
    savedToCart: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Design', designSchema);
