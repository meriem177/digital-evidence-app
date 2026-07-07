const multer = require("multer");
const path = require("path");

// Définir où enregistrer les fichiers
const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },

    filename: function (req, file, cb) {

        const uniqueName =
            Date.now() + "-" + file.originalname;

        cb(null, uniqueName);
    }

});

// Vérifier le type de fichier
const fileFilter = (req, file, cb) => {

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "video/mp4"
    ];

    if (allowedTypes.includes(file.mimetype)) {

        cb(null, true);

    } else {

        cb(new Error("Type de fichier non autorisé"), false);

    }

};

module.exports = multer({
    storage,
    fileFilter
});