const axios = require("axios");

const ANALYSIS_ENDPOINT = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000/analyze";

async function analyzeImage(imagePath) {

    try {

        const { data } = await axios.post(
            ANALYSIS_ENDPOINT,
            {
                image_path: imagePath
            },
            {
                timeout: 120000
            }
        );

        return data;

    } catch (err) {

        console.error("===== AI SERVICE ERROR =====");

        if (err.response) {
            console.error(err.response.data);
        } else {
            console.error(err.message);
        }

        return {

            authenticity: 0,

            manipulation: false,

            confidence: 0,

            heatmap: null,

            heatmap_path: null,

            metadata: {},

            analysis: {}

        };

    }

}

module.exports = {
    analyzeImage
};