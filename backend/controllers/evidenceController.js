const Evidence = require("../models/Evidence");
const generateFileHash = require("../utils/hash");
const fs = require("fs");
const { analyzeImage } = require("../services/aiService");
const path = require("path");
const createReport = require("../services/reportService");

const REQUIRED_FIELDS = [
    "caseNumber",
    "caseType",
    "investigator",
    "seizureLocation",
    "seizureDate"
];

function validateInput(body) {
    const missing = REQUIRED_FIELDS.filter((field) => !body[field]);
    if (missing.length > 0) {
        return `Missing required fields: ${missing.join(", ")}`;
    }
    return null;
}

exports.createEvidence = async (req, res) => {
    try {
        const validationError = validateInput(req.body);
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const {
            caseNumber,
            caseType,
            investigator,
            seizureLocation,
            seizureDate,
            description
        } = req.body;

        let hash = null;
        if (req.file) {
            hash = await generateFileHash(req.file.path);
        }

        let aiResult = {
            authenticity: 0,
            manipulation: false,
            deepfake: false,
            confidence: 0,
            metadata: {},
            analysis: {}
        };

        if (req.file) {
            const absolutePath = path.resolve(req.file.path);
            aiResult = await analyzeImage(absolutePath);
        }

        let reportUrl = null;
        if (req.file) {
            const reportFile = createReport(aiResult, path.resolve(req.file.path));
            const host = req.get("host") || "localhost:5000";
            const protocol = req.protocol || "http";
            reportUrl = `${protocol}://${host}/reports/${reportFile}`;
        }

        const evidence = await Evidence.create({
            caseNumber,
            caseType,
            investigator,
            seizureLocation,
            seizureDate,
            description,
            fileName: req.file ? req.file.filename : null,
            filePath: req.file ? req.file.path : null,
            fileType: req.file ? req.file.mimetype : null,
            fileSize: req.file ? req.file.size : null,
            hash,
            aiResult: aiResult.manipulation ? "Manipulation détectée" : "Authentique",
            confidence: aiResult.confidence,
            deepfake: aiResult.deepfake ?? false,
            manipulation: aiResult.manipulation,
            heatmap: aiResult.heatmap,
            heatmapPath: aiResult.heatmap_path,
            metadata: aiResult.metadata,
            analysis: aiResult.analysis,
            report: reportUrl,
            uploadedBy: req.user.id
        });

        res.status(201).json({ message: "Evidence created successfully", evidence });
    } catch (error) {
        console.error("createEvidence error:", error);
        res.status(500).json({ message: "An error occurred while creating evidence." });
    }
};

exports.verifyIntegrity = async (req, res) => {
    try {
        const evidence = await Evidence.findById(req.params.id);
        if (!evidence) {
            return res.status(404).json({ message: "Evidence not found" });
        }

        if (!evidence.filePath || !fs.existsSync(evidence.filePath)) {
            return res.status(404).json({ message: "Evidence file not found" });
        }

        const newHash = await generateFileHash(evidence.filePath);

        if (newHash === evidence.hash) {
            return res.json({
                status: "INTACT",
                storedHash: evidence.hash,
                currentHash: newHash,
                message: "The evidence is authentic."
            });
        }

        return res.json({
            status: "MODIFIED",
            storedHash: evidence.hash,
            currentHash: newHash,
            message: "Attention! The file has been modified."
        });
    } catch (error) {
        console.error("verifyIntegrity error:", error);
        res.status(500).json({ message: "An error occurred during integrity verification." });
    }
};

exports.getAllEvidences = async (req, res) => {
    try {
        const evidences = await Evidence.find().sort({ createdAt: -1 });
        res.json(evidences);
    } catch (error) {
        console.error("getAllEvidences error:", error);
        res.status(500).json({ message: "Unable to retrieve evidence list." });
    }
};

exports.getEvidenceById = async (req, res) => {
    try {
        const evidence = await Evidence.findById(req.params.id);
        if (!evidence) {
            return res.status(404).json({ message: "Evidence not found" });
        }
        res.json(evidence);
    } catch (error) {
        console.error("getEvidenceById error:", error);
        res.status(500).json({ message: "Unable to retrieve evidence details." });
    }
};
