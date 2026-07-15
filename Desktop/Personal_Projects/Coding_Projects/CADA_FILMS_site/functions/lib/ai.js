"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeVideo = analyzeVideo;
const vertexai_1 = require("@google-cloud/vertexai");
const firestore_1 = require("firebase-admin/firestore");
const vertexAI = new vertexai_1.VertexAI({ project: process.env.GCLOUD_PROJECT || "cada-productions", location: "us-central1" });
const model = vertexAI.getGenerativeModel({ model: "gemini-1.5-flash" });
async function analyzeVideo(bucketName, filePath, epId) {
    var _a;
    // "Direct-to-Cloud" - No download needed!
    const fileUri = `gs://${bucketName}/${filePath}`;
    const prompt = `
        You are a podcast editor. Analyze this video.
        Output a valid JSON object with:
        1. "summary": A 2-sentence hook.
        2. "chapters": An array of objects { "time": "00:00", "title": "Topic" }.
        3. "showNotes": A formatted string with bullet points.
        4. "hashtags": 5 relevant tags for YouTube.
    `;
    try {
        const result = await model.generateContent({
            contents: [{
                    role: 'user',
                    parts: [
                        { file_data: { mime_type: "video/mp4", file_uri: fileUri } },
                        { text: prompt }
                    ]
                }]
        });
        const responseText = (_a = result.response.candidates) === null || _a === void 0 ? void 0 : _a[0].content.parts[0].text;
        if (!responseText)
            throw new Error("No response from Vertex AI");
        const aiData = JSON.parse(responseText.replace(/```json|```/g, ""));
        await (0, firestore_1.getFirestore)().collection("episodes").doc(epId).set(aiData, { merge: true });
        console.log(`AI analysis complete for ${epId}`);
    }
    catch (error) {
        console.error(`Error analyzing video ${epId}:`, error);
        // Don't throw, so other processes can continue
    }
}
//# sourceMappingURL=ai.js.map