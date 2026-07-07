const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {

    let token;

    // Vérifier si le token est présent
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {

        token = req.headers.authorization.split(" ")[1];

        try {

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = decoded;

            next();

        } catch (error) {

            return res.status(401).json({
                message: "Token invalide"
            });

        }

    } else {

        return res.status(401).json({
            message: "Accès refusé. Aucun token."
        });

    }

};

module.exports = protect;