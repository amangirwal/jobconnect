const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'resume') {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(
                new Error('Only PDF files are allowed for resume!'),
                false
            );
        }
    } else if (file.fieldname === 'profilePicture') {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(
                new Error('Only images are allowed for profile picture!'),
                false
            );
        }
    } else {
        cb(new Error('Unexpected file field'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

module.exports = upload;