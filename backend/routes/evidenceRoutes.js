const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const upload = require("../config/multer");

const evidenceController = require("../controllers/evidenceController");

router.post(
    "/",
    protect,
    upload.single("file"),
    evidenceController.createEvidence
);
router.get(
    "/:id",
    protect,
    evidenceController.getEvidenceById
);
router.get(
    "/verify/:id",
    protect,
    evidenceController.verifyIntegrity
);
router.get(
    "/",
    protect,
    evidenceController.getAllEvidences
);
module.exports = router;