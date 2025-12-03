import { VertexAI } from "@google-cloud/vertexai";
import { getFirestore } from "firebase-admin/firestore";

const vertexAI = new VertexAI({ project: process.env.GCLOUD_PROJECT || "cada-productions", location: "us-east1" });
const model = vertexAI.getGenerativeModel({ model: "gemini-2.5-pro" });

export async function analyzeVideo(bucketName: string, filePath: string, epId: string) {
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

        const responseText = result.response.candidates?.[0].content.parts[0].text;
        if (!responseText) throw new Error("No response from Vertex AI");

        const aiData = JSON.parse(responseText.replace(/```json|```/g, ""));

        await getFirestore().collection("episodes").doc(epId).set(aiData, { merge: true });
        console.log(`AI analysis complete for ${epId}`);
    } catch (error) {
        console.error(`Error analyzing video ${epId}:`, error);
        // Don't throw, so other processes can continue
    }
}
