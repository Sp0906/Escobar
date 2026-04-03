const Design = require('../models/Design');
const Jersey = require('../models/Jersey');
const { cloudinary } = require('../config/cloudinary');

// @desc  Save a design
// @route POST /api/designs
const saveDesign = async (req, res) => {
  try {
    const { jerseyId, name, canvasData, customizations, previewImageBase64 } = req.body;
    const jersey = await Jersey.findById(jerseyId);
    if (!jersey) return res.status(404).json({ success: false, message: 'Jersey template not found' });

    let previewImageUrl = null;
    let previewCloudinaryId = null;

    if (previewImageBase64) {
      const uploaded = await cloudinary.uploader.upload(previewImageBase64, {
        folder: 'jersey-design/designs',
        public_id: `design_${req.user._id}_${Date.now()}`,
      });
      previewImageUrl = uploaded.secure_url;
      previewCloudinaryId = uploaded.public_id;
    }

    const design = await Design.create({
      user: req.user._id,
      jersey: jerseyId,
      name: name || 'My Design',
      canvasData,
      customizations,
      previewImageUrl,
      previewCloudinaryId,
    });

    res.status(201).json({ success: true, design });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get user designs
// @route GET /api/designs
const getUserDesigns = async (req, res) => {
  try {
    const designs = await Design.find({ user: req.user._id })
      .populate('jersey', 'name imageUrl basePrice')
      .sort('-createdAt');
    res.json({ success: true, count: designs.length, designs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get single design
// @route GET /api/designs/:id
const getDesign = async (req, res) => {
  try {
    const design = await Design.findOne({ _id: req.params.id, user: req.user._id }).populate(
      'jersey',
      'name imageUrl basePrice category'
    );
    if (!design) return res.status(404).json({ success: false, message: 'Design not found' });
    res.json({ success: true, design });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update design
// @route PUT /api/designs/:id
const updateDesign = async (req, res) => {
  try {
    const { name, canvasData, customizations, previewImageBase64 } = req.body;
    const design = await Design.findOne({ _id: req.params.id, user: req.user._id });
    if (!design) return res.status(404).json({ success: false, message: 'Design not found' });

    if (previewImageBase64) {
      if (design.previewCloudinaryId) {
        await cloudinary.uploader.destroy(design.previewCloudinaryId);
      }
      const uploaded = await cloudinary.uploader.upload(previewImageBase64, {
        folder: 'jersey-design/designs',
        public_id: `design_${req.user._id}_${Date.now()}`,
      });
      design.previewImageUrl = uploaded.secure_url;
      design.previewCloudinaryId = uploaded.public_id;
    }

    if (name) design.name = name;
    if (canvasData) design.canvasData = canvasData;
    if (customizations) design.customizations = customizations;
    await design.save();

    res.json({ success: true, design });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Delete design
// @route DELETE /api/designs/:id
const deleteDesign = async (req, res) => {
  try {
    const design = await Design.findOne({ _id: req.params.id, user: req.user._id });
    if (!design) return res.status(404).json({ success: false, message: 'Design not found' });
    if (design.previewCloudinaryId) {
      await cloudinary.uploader.destroy(design.previewCloudinaryId);
    }
    await design.deleteOne();
    res.json({ success: true, message: 'Design deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Upload logo for design
// @route POST /api/designs/upload-logo
const uploadLogo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    res.json({ success: true, url: req.file.path, cloudinaryId: req.file.filename });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { saveDesign, getUserDesigns, getDesign, updateDesign, deleteDesign, uploadLogo };
