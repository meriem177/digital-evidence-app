const crypto = require("crypto");
const fs = require("fs");

// Fonction qui calcule le SHA-256 d'un fichier
const generateFileHash = (filePath) => {

    return new Promise((resolve, reject) => {

        const hash = crypto.createHash("sha256");

        const stream = fs.createReadStream(filePath);

        stream.on("data", (data) => {
            hash.update(data);
        });

        stream.on("end", () => {
            resolve(hash.digest("hex"));
        });

        stream.on("error", (err) => {
            reject(err);
        });

    });

};

module.exports = generateFileHash;