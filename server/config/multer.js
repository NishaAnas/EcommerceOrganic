const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const limits ={fileSize: 10 * 1024 * 1024}
const storage = multer.memoryStorage();

const fileFilter = (req, file, callback) => {
    if (file.mimetype.startsWith('image')) {
      callback(null, true);
    } else {
      callback(new Error('Only images are allowed'), false);
    }
  };

const upload = multer({ limits:limits, storage: storage, fileFilter: fileFilter });

        const resizeImages = async (req, res, next) => {
            if (!req.files || req.files.length === 0) {
                return next();
            }
            try {
                req.resizedImages = [];
                await Promise.all(req.files.map(async (file) => {
                    const resizedImageBuffer = await sharp(file.buffer)
                        .resize({ width: 300, height: 300 })
                        .toBuffer();
                        
                        
                        const uploadPath = path.join(__dirname, '..','..', 'public', 'uploads', `${file.originalname}`);
                        fs.writeFileSync(uploadPath, resizedImageBuffer);// Save the resized image to uploads folder
                    
                    req.resizedImages.push(uploadPath);
                }));
                next();
            } catch (error) {
                next(error);
            }
};

module.exports = { upload, resizeImages };
