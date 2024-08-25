const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'upload')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage }).single('profile_pic');

const fileUploadHandler = (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            res.status(500).json({ message: err.message });
        }
        next();
    });
}

module.exports = fileUploadHandler;