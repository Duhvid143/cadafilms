import * as admin from "firebase-admin";
import { onObjectFinalized } from "firebase-functions/v2/storage";
import { generateRSS } from "./rss";
import { backupToDrive } from "./drive";
import { analyzeVideo } from "./ai";

admin.initializeApp({
    projectId: "cada-f5b39",
    storageBucket: "cada-f5b39.firebasestorage.app",
    databaseId: "(default)" // Explicitly set default database
} as any);

console.log("Firebase Admin Initialized. Project ID:", admin.app().options.projectId);

// 2GB+ file processing requires increased memory/timeout
export const processEpisode = onObjectFinalized({
    cpu: 2,
    memory: "8GiB",
    timeoutSeconds: 540, // 9 mins
    region: "us-east1"
}, async (event) => {
    const filePath = event.data.name;
    if (!filePath.startsWith("episodes/")) return; // Only process episodes

    const bucket = event.data.bucket;
    const fileName = filePath.split("/").pop();
    const episodeId = fileName?.split(".")[0];

    if (!fileName || !episodeId) {
        console.error("Invalid file name or episode ID");
        return;
    }

    console.log(`Processing episode: ${episodeId}`);

    // 1. Parallel Processing: Drive Backup + AI Analysis
    await Promise.all([
        backupToDrive(bucket, filePath, fileName),
        analyzeVideo(bucket, filePath, episodeId)
    ]);

    // 2. RSS Regeneration (Must happen after metadata is in DB)
    // Note: In a real app, you might trigger this separately or wait for AI
    // For now, we run it here, but ideally AI analysis updates DB which triggers another function
    // or we wait for AI to finish (which we do above with Promise.all)
    await generateRSS(bucket);

    console.log(`Processing complete for ${episodeId}`);
});
