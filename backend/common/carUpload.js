const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDirectory = path.join(__dirname, '..', 'uploads', 'car');

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDirectory);
  },
  filename: (_req, file, callback) => {
    const safeFileName = file.originalname.replace(/\s+/g, '-').toLowerCase();
    callback(null, `${Date.now()}-${safeFileName}`);
  },
});

module.exports = multer({ storage });
