const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function createReport(result, originalImage) {
    const reportDirectory = path.join(__dirname, "../reports");
    if (!fs.existsSync(reportDirectory)) {
        fs.mkdirSync(reportDirectory, { recursive: true });
    }

    const filename = `report-${Date.now()}.pdf`;
    const output = path.join(reportDirectory, filename);
    const doc = new PDFDocument({ margin: 50 });

    doc.pipe(fs.createWriteStream(output));

    doc.fillColor("#0B3D91").fontSize(22).text("Digital Evidence Forensic Report", {
        align: "center"
    });
    doc.moveDown(0.5);
    doc.strokeColor("#cccccc").moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();

    doc.fontSize(12).fillColor("#333333").text(`Generated at: ${new Date().toLocaleString()}`);
    doc.text("Report prepared by: Digital Evidence Management System");
    doc.moveDown();

    doc.fontSize(16).fillColor("#0B3D91").text("1. AI Analysis Summary");
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor("#333333");
    doc.text(`Result: ${result.manipulation ? "Manipulated" : "Authentic"}`);
    doc.text(`Confidence: ${(result.confidence * 100).toFixed(2)}%`);
    doc.text(`Authenticity score: ${(result.authenticity * 100).toFixed(2)}%`);
    doc.text(`Deepfake detected: ${result.deepfake ? "Yes" : "No"}`);
    doc.moveDown();

    doc.fontSize(16).fillColor("#0B3D91").text("2. Metadata");
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor("#333333");

    if (result.metadata && Object.keys(result.metadata).length > 0) {
        Object.entries(result.metadata).forEach(([key, value]) => {
            doc.text(`${key}: ${value}`);
        });
    } else {
        doc.text("No metadata available.");
    }

    doc.moveDown();
    doc.fontSize(16).fillColor("#0B3D91").text("3. Image Analysis Details");
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor("#333333");

    if (result.analysis && Object.keys(result.analysis).length > 0) {
        Object.entries(result.analysis).forEach(([key, value]) => {
            doc.text(`${key}: ${value}`);
        });
    } else {
        doc.text("No additional analysis details available.");
    }

    doc.addPage();
    doc.fontSize(16).fillColor("#0B3D91").text("4. Visual Evidence", { align: "left" });
    doc.moveDown(0.5);

    if (fs.existsSync(originalImage)) {
        try {
            doc.image(originalImage, { fit: [240, 240], align: "center" });
        } catch (err) {
            doc.text("Original image could not be loaded.");
        }
    } else {
        doc.text("Original image not available.");
    }

    if (result.heatmap_path && fs.existsSync(result.heatmap_path)) {
        doc.moveDown();
        doc.fontSize(14).fillColor("#0B3D91").text("Heatmap", { align: "left" });
        doc.moveDown(0.5);
        try {
            doc.image(result.heatmap_path, { fit: [240, 240], align: "center" });
        } catch (err) {
            doc.text("Heatmap image could not be loaded.");
        }
    }

    doc.addPage();
    doc.fontSize(16).fillColor("#0B3D91").text("5. Notes", { align: "left" });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor("#333333");
    doc.text("This report includes the image forensic analysis performed by the system. The results are based on the AI model and file integrity checks.");
    doc.moveDown();
    doc.text("Recommendations:");
    doc.list([
        "Keep the original evidence file in a secure repository.",
        "Store the report and associated metadata together.",
        "Re-run integrity checks if the evidence is transferred.",
    ]);

    doc.moveDown(2);
    doc.fontSize(10).fillColor("#666666").text("Digital Evidence Management System - Final Year Project", {
        align: "center"
    });

    doc.end();
    return filename;
}

module.exports = createReport;
