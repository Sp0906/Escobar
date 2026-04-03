const express = require('express');
const router = express.Router();
const {
  getJerseys,
  getJersey,
  uploadJersey,
  updateJersey,
  deleteJersey,
} = require('../controllers/jerseyController');
const { protect, adminOnly } = require('../middleware/auth');
const { uploadJerseyTemplate } = require('../config/cloudinary');

router.get('/', getJerseys);
router.get('/:id', getJersey);
router.post('/', protect, adminOnly, uploadJerseyTemplate.single('image'), uploadJersey);
router.put('/:id', protect, adminOnly, updateJersey);
router.delete('/:id', protect, adminOnly, deleteJersey);

module.exports = router;
