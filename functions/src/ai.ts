import { VertexAI } from "@google-cloud/vertexai";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

const project = process.env.GCLOUD_PROJECT;
if (!project) throw new Error("GCLOUD_PROJECT environment variable is missing");

const vertexAI = new VertexAI({ project, location: "us-east1" });
const model = vertexAI.getGenerativeModel({ model: "gemini-2.5-pro" });

function extractJSON(text: string): Record<string, unknown> {
    // Try standard JSON markdown fences first
    const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (fenceMatch) {
        return JSON.parse(fenceMatch[1].trim());
    }

    // Try parsing the raw text as JSON
    const trimmed = text.trim();
    if (trimmed.startsWith("{")) {
        return JSON.parse(trimmed);
    }

    // Last resort: find the first { and last }
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        return JSON.parse(text.slice(firstBrace, lastBrace + 1));
    }

    throw new Error("Could not extract JSON from AI response");
}

export async function analyzeVideo(bucketName: string, filePath: string, epId: string, mimeType: string) {
    logger.info("Starting AI analysis", { epId, bucketName, filePath, mimeType });
    const gcsUri = `gs://${bucketName}/${filePath}`;

    const prompt = `
    Analyze this video episode for a podcast website.
    IMPORTANT: You must analyze the ENTIRE duration of the video, from the very beginning to the very end. Do not stop after the first hour.

    GLOSSARY & CONTEXT:
    - Podcast Name: "MUIT" (often misheard as "Mute"). Always spell it "MUIT".
    - Company Name: "CADA" (often misheard as "Kada"). Always spell it "CADA".
    - Host Name: "Cam" (often misheard as "Kam"). Always spell it "Cam".
    - Host Name: "David".

    TONE & STYLE:
    - Write the 'summary' and 'description' in the **FIRST PERSON PLURAL ("We", "Us")**.
    - Write as if the two hosts (Cam and David) are writing this together for their audience.
    - Do NOT use phrases like "The hosts discuss..." or "Cam and David talk about...". Instead say "We discuss..." or "In this episode, we talk about...".
    - **FORMATTING**: Write the 'description' as proper HTML using <p> tags for paragraphs.

    Return ONLY a valid JSON object with these fields:
    - summary: A 2-sentence hook (Plain text).
    - description: A detailed HTML paragraph(s) covering the full episode content.
    - showNotes: A list of bullet points with timestamps (e.g., "01:30 - Topic", "01:15:00 - Later Topic").
    - chapters: An array of objects { time: "MM:SS", title: "Chapter Title" }.
    - keywords: An array of 5-10 tags.
    `;

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ file_data: { file_uri: gcsUri, mime_type: mimeType } }, { text: prompt }] }],
    });

    const response = result.response;
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("No response from Gemini");

    let aiData: Record<string, unknown>;
    try {
        aiData = extractJSON(text);
    } catch (parseError) {
        logger.error("Failed to parse AI response as JSON", { epId, rawText: text.slice(0, 500) });
        throw new Error("AI returned invalid JSON");
    }

    logger.info("AI Analysis success. Writing to Firestore", { epId });
    await admin.firestore().collection("episodes").doc(epId).set(aiData, { merge: true });
    logger.info("AI analysis complete", { epId });
}
