import { VertexAI } from "@google-cloud/vertexai";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

const project = process.env.GCLOUD_PROJECT;
if (!project) throw new Error("GCLOUD_PROJECT environment variable is missing");

const vertexAI = new VertexAI({ project, location: "us-east1" });
const model = vertexAI.getGenerativeModel({ model: "gemini-2.5-pro" });

export async function analyzeVideo(bucketName: string, filePath: string, epId: string) {
    logger.info("Starting AI analysis", { epId, bucketName, filePath });
    const gcsUri = `gs://${bucketName}/${filePath}`;

    const prompt = `
    Analyze this video episode for a podcast website.
    Return ONLY a valid JSON object with these fields:
    - summary: A 2-sentence hook.
    - description: A detailed paragraph.
    - showNotes: A list of bullet points with timestamps (e.g., "01:30 - Topic").
    - chapters: An array of objects { time: "MM:SS", title: "Chapter Title" }.
    - keywords: An array of 5-10 tags.
    `;

    try {
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ file_data: { file_uri: gcsUri, mime_type: "video/mp4" } }, { text: prompt }] }],
        });

        const response = result.response;
        const text = response.candidates?.[0].content.parts[0].text;

        if (!text) throw new Error("No response from Gemini");

        // Clean up JSON markdown if present
        const jsonStr = text.replace(/```json\n|\n```/g, "").trim();
        const aiData = JSON.parse(jsonStr);

        logger.info("AI Analysis success. Writing to Firestore", { epId });
        await admin.firestore().collection("episodes").doc(epId).set(aiData, { merge: true });
        logger.info("AI analysis complete", { epId });
    } catch (error) {
        logger.error("Error analyzing video", { epId, error });
        // Don't throw, so other processes can continue
    }
}
