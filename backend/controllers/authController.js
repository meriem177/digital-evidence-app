const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcrypt");

const normalizeEmail = (value) => {
    if (typeof value !== "string") {
        return "";
    }

    return value.trim().toLowerCase();
};

exports.normalizeEmail = normalizeEmail;

exports.register = async (req, res) => {
    try {

        const { fullName, email, password, role } = req.body;
        const normalizedEmail = normalizeEmail(email);

        // Vérifier les champs obligatoires
        if (!fullName || !normalizedEmail || !password) {
            return res.status(400).json({
                message: "Tous les champs sont obligatoires"
            });
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(400).json({
                message: "Cet email existe déjà"
            });
        }

        // Chiffrer le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer un nouvel utilisateur
        const user = new User({
            fullName,
            email: normalizedEmail,
            password: hashedPassword,
            role
        });

        // Sauvegarder dans MongoDB
        await user.save();

        res.status(201).json({
            message: "Utilisateur créé avec succès",
            user
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};
exports.login = async (req, res) => {
    try {

        const { email, password } = req.body;
        const normalizedEmail = normalizeEmail(email);

        // Vérifier les champs
        if (!normalizedEmail || !password) {
            return res.status(400).json({
                message: "Email et mot de passe obligatoires"
            });
        }

        // Chercher l'utilisateur
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                message: "Utilisateur introuvable"
            });
        }

        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Mot de passe incorrect"
            });
        }

       // Générer un token
const token = jwt.sign(
    {
        id: user._id,
        role: user.role
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "1d"
    }
);

// Réponse
res.status(200).json({
    message: "Connexion réussie",
    token,
    user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
    }
});

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};