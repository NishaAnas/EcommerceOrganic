const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Set file size limit for uploads to 10MB
const limits = { fileSize: 10 * 1024 * 1024 };

// Use memory storage for multer to store files in memory as buffers
const storage = multer.memoryStorage();

// Filter to allow only image files
const fileFilter = (req, file, callback) => {
    if (file.mimetype.startsWith('image')) {
        callback(null, true); // Accept the file
    } else {
        callback(new Error('Only images are allowed'), false); // Reject the file
    }
};

// Configure multer with defined limits, storage, and file filter
const upload = multer({ limits: limits, storage: storage, fileFilter: fileFilter });

// Middleware function to resize images
const resizeImages = async (req, res, next) => {
    // Check if there are files to process
    if (!req.files || req.files.length === 0) {
        return next(); // No files to process, proceed to next middleware
    }
    try {
        req.resizedImages = []; // Initialize array to store paths of resized images
        await Promise.all(req.files.map(async (file) => {
            // Resize image using sharp
            const resizedImageBuffer = await sharp(file.buffer)
                .resize({ width: 300, height: 300 }) // Resize to 300x300
                .toBuffer();
            
            // Define path to save resized image
            const uploadPath = path.join(__dirname, '..', '..', 'public', 'uploads', `${file.originalname}`);
            // Save resized image to the specified path
            fs.writeFileSync(uploadPath, resizedImageBuffer);
            
            // Add the path of the resized image to the request object
            req.resizedImages.push(uploadPath);
        }));
        next(); // Proceed to next middleware
    } catch (error) {
        next(error); // Pass any errors to the next error handling middleware
    }
};

// Export the upload and resizeImages middleware functions
module.exports = { upload, resizeImages };
