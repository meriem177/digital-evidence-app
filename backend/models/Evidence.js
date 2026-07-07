const mongoose = require("mongoose");

const evidenceSchema = new mongoose.Schema(
{
    caseNumber: {
        type: String,
        required: true
    },

    caseType: {
        type: String,
        required: true
    },

    investigator: {
        type: String,
        required: true
    },

    seizureLocation: {
        type: String,
        required: true
    },

    seizureDate: {
        type: Date,
        required: true
    },

    description: {
        type: String
    },

    fileName: {
        type: String
    },

    filePath: {
        type: String
    },

    fileType: {
        type: String
    },

    fileSize: {
        type: Number
    },

    hash: {
        type: String,
        default: null
    },

    // ======================
    // Résultat IA
    // ======================

    aiResult: {
        type: String,
        default: "Non analysé"
    },

    confidence: {
        type: Number,
        default: 0
    },

    deepfake: {
        type: Boolean,
        default: false
    },

    manipulation: {
        type: Boolean,
        default: false
    },

heatmap: {
    type: String,
    default: null
},

heatmapPath: {
    type: String,
    default: null
},

metadata: {
    type: Object,
    default: {}
},

analysis: {
    type: Object,
    default: {}
},

report: {
    type: String,
    default: null
},

    // ======================
    // Utilisateur
    // ======================

    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

},
{
    timestamps: true
});

module.exports = mongoose.model("Evidence", evidenceSchema);