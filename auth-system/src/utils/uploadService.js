const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

// Check if Cloudinary is configured
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log("Cloudinary configured successfully.");
} else {
  console.log("Cloudinary configuration missing. Running in local fallback mode.");
}

// Create uploads folder if it doesn't exist
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File validation helper
const fileFilter = (req, file, cb) => {
  // Allow common file types
  const allowedExtensions = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|zip|txt/i;
  const ext = allowedExtensions.test(path.extname(file.originalname));
  if (ext) {
    cb(null, true);
  } else {
    cb(new Error("File type not supported."));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

/**
 * Uploads a file to Cloudinary, falling back to local static file storage if needed.
 * @param {string} filePath - Absolute path to the local file
 * @param {string} folder - Destination folder (e.g. 'avatars', 'documents')
 * @returns {Promise<string>} - The uploaded file URL
 */
async function uploadToStorage(filePath, folder = "smartvyapar") {
  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: folder,
        resource_type: "auto",
      });
      // Delete temporary local file
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error("Failed to delete temp file:", err.message);
      }
      return result.secure_url;
    } catch (err) {
      console.error("Cloudinary upload error, falling back to local:", err.message);
    }
  }
  // Local storage fallback: Return relative URL path
  const filename = path.basename(filePath);
  return `http://localhost:8000/uploads/${filename}`;
}

module.exports = {
  upload,
  uploadToStorage,
};
