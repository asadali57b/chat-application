
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, "./public");
    },
    filename: function (req, file, cb) {
        const uploadPath = path.join("./public", file.originalname);

        
        if (fs.existsSync(uploadPath)) {
            
            fs.unlinkSync(uploadPath);
        }

        return cb(null, file.originalname);
    },
});

const upload = multer({ storage });
module.exports = upload;
