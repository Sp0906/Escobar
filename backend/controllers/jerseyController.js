const Jersey = require('../models/Jersey');
const { cloudinary } = require('../config/cloudinary');

// @desc  Get all active jersey templates
// @route GET /api/jerseys
const getJerseys = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    const jerseys = await Jersey.find(filter).sort('-createdAt');
    res.json({ success: true, count: jerseys.length, jerseys });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get single jersey
// @route GET /api/jerseys/:id
const getJersey = async (req, res) => {
  try {
    const jersey = await Jersey.findById(req.params.id);
    if (!jersey) return res.status(404).json({ success: false, message: 'Jersey not found' });
    res.json({ success: true, jersey });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Upload jersey template (Admin)
// @route POST /api/jerseys
const uploadJersey = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload an image' });
    const { name, description, category, basePrice } = req.body;
    const jersey = await Jersey.create({
      name,
      description,
      category,
      basePrice: parseFloat(basePrice),
      imageUrl: req.file.path,
      cloudinaryId: req.file.filename,
      uploadedBy: req.user._id,
    });
    res.status(201).json({ success: true, jersey });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update jersey template (Admin)
// @route PUT /api/jerseys/:id
const updateJersey = async (req, res) => {
  try {
    const jersey = await Jersey.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!jersey) return res.status(404).json({ success: false, message: 'Jersey not found' });
    res.json({ success: true, jersey });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Delete jersey template (Admin)
// @route DELETE /api/jerseys/:id
const deleteJersey = async (req, res) => {
  try {
    const jersey = await Jersey.findById(req.params.id);
    if (!jersey) return res.status(404).json({ success: false, message: 'Jersey not found' });
    await cloudinary.uploader.destroy(jersey.cloudinaryId);
    await jersey.deleteOne();
    res.json({ success: true, message: 'Jersey template deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getJerseys, getJersey, uploadJersey, updateJersey, deleteJersey };
