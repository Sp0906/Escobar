const express = require('express');
const router = express.Router();
const {
  saveDesign,
  getUserDesigns,
  getDesign,
  updateDesign,
  deleteDesign,
  uploadLogo,
} = require('../controllers/designController');
const { protect } = require('../middleware/auth');
const { uploadLogo: logoUpload } = require('../config/cloudinary');

router.get('/', protect, getUserDesigns);
router.post('/', protect, saveDesign);
router.post('/upload-logo', protect, logoUpload.single('logo'), uploadLogo);
router.get('/:id', protect, getDesign);
router.put('/:id', protect, updateDesign);
router.delete('/:id', protect, deleteDesign);

module.exports = router;
