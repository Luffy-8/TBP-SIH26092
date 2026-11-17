require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function listModels() {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    try {
        const response = await ai.models.list();
        console.log("Available Models for your API Key:");
        for (const model of response.models) {
            // Only print models that support generateContent
            if (model.supportedGenerationMethods.includes("generateContent")) {
                console.log(`- ${model.name}`);
            }
        }
    } catch (error) {
        console.error("Error listing models:", error.message);
    }
}

listModels();