const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createStorage = (folder, allowedFormats = ['jpg', 'jpeg', 'png', 'webp', 'svg']) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `jersey-design/${folder}`,
      allowed_formats: allowedFormats,
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    },
  });

const uploadJerseyTemplate = multer({ storage: createStorage('templates') });
const uploadLogo = multer({ storage: createStorage('logos') });
const uploadReadyMade = multer({ storage: createStorage('ready-made') });
const uploadDesign = multer({ storage: createStorage('designs') });

module.exports = {
  cloudinary,
  uploadJerseyTemplate,
  uploadLogo,
  uploadReadyMade,
  uploadDesign,
};
