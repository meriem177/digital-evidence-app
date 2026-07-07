const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const evidenceRoutes = require("./routes/evidenceRoutes");

const connectDB = require("./config/db");
const path = require("path");

// Connexion à MongoDB
connectDB();

// Initialiser Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Route de test
app.get("/", (req, res) => {
    res.send("🚀 Digital Evidence API is running...");
});
const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);

app.use("/api/evidences", evidenceRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
    "/reports",
    express.static(path.join(__dirname, "reports"))
);

// Port
const PORT = process.env.PORT || 5000;

// Lancer le serveur
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
const protect = require("./middleware/authMiddleware");

app.get("/api/profile", protect, (req, res) => {

    res.json({
        message: "Bienvenue",
        user: req.user
    });

});
