import * as admin from "firebase-admin";
import { onObjectFinalized } from "firebase-functions/v2/storage";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { generateRSS } from "./rss";
import { backupToDrive } from "./drive";
import { analyzeVideo } from "./ai";

admin.initializeApp();

logger.info("Firebase Admin Initialized", { projectId: admin.app().options.projectId });

// 2GB+ file processing requires increased memory/timeout
export const processEpisode = onObjectFinalized({
    cpu: 2,
    memory: "8GiB",
    timeoutSeconds: 3600, // 1 hour
    region: "us-east1"
}, async (event) => {
    const filePath = event.data.name;
    if (!filePath.startsWith("episodes/")) return; // Only process episodes

    const bucket = event.data.bucket;
    const contentType = event.data.contentType;
    const fileName = filePath.split("/").pop();
    const episodeId = fileName?.split(".")[0];

    if (!fileName || !episodeId) {
        logger.error("Invalid file name or episode ID", { filePath });
        return;
    }

    logger.info("Processing episode", { episodeId, fileName });

    // 1. Parallel Processing: Drive Backup + AI Analysis
    // Use allSettled so one failure doesn't stop the other
    const results = await Promise.allSettled([
        backupToDrive(bucket, filePath, fileName),
        analyzeVideo(bucket, filePath, episodeId, contentType || "video/mp4")
    ]);

    results.forEach((result, index) => {
        if (result.status === "rejected") {
            logger.error(`Task ${index === 0 ? "Backup" : "AI"} failed`, { reason: result.reason });
        }
    });

    // 2. Mark as Ready
    logger.info("Marking episode as ready", { episodeId });
    await admin.firestore().collection("episodes").doc(episodeId).update({
        status: "ready",
        processedAt: new Date().toISOString()
    });

    // 3. RSS Regeneration (Must happen after metadata is in DB)
    // Note: In a real app, you might trigger this separately or wait for AI
    // For now, we run it here, but ideally AI analysis updates DB which triggers another function
    // or we wait for AI to finish (which we do above with Promise.all)
    await generateRSS(admin.storage().bucket(bucket));

    logger.info("Processing complete", { episodeId });
});

export const updateRSSEpisode = onDocumentWritten("episodes/{episodeId}", async (event) => {
    logger.info("Episode changed, regenerating RSS feed...");
    await generateRSS();
});
