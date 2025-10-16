const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Create the uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}


// --- Multer Configuration ---
// This tells Multer where and how to save the uploaded files.
const storage = multer.diskStorage({
    // The destination directory for the files.
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Files will be saved in the 'uploads' directory
    },
    // The name of the file inside the destination directory.
    filename: function (req, file, cb) {
        // Create a unique filename to prevent overwriting: fieldname-timestamp.extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to only accept image files
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.'), false);
    }
};

// Initialize multer with the storage configuration and file filter
const upload = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 1024 * 1024 * 5 } }); // Limit file size to 5MB

// @route   POST /api/upload/image
// @desc    Upload a single image
// @access  Private (you would add authentication middleware here)
router.post('/image', upload.single('image'), (req, res) => {
    // 'image' is the field name from the frontend FormData

    if (!req.file) {
        return res.status(400).json({ message: 'No image file provided.' });
    }

    try {
        // Construct the URL to be sent back to the client.
        // This URL must be accessible from the browser.
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        res.status(201).json({ imageUrl: imageUrl });

    } catch (err) {
        res.status(500).json({ message: 'Server error during file upload.' });
    }
});


module.exports = router;