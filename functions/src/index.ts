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
        backupToDrive(bucket, filePath, fileName, contentType || "video/mp4"),
        analyzeVideo(bucket, filePath, episodeId, contentType || "video/mp4")
    ]);

    const [backupResult, aiResult] = results;

    if (backupResult.status === "rejected") {
        logger.error("Backup failed", { reason: backupResult.reason });
    }
    if (aiResult.status === "rejected") {
        logger.error("AI analysis failed", { reason: aiResult.reason });
    }

    // 2. Only mark "ready" if AI succeeded; mark "error" otherwise
    const newStatus = aiResult.status === "fulfilled" ? "ready" : "error";
    logger.info(`Marking episode as ${newStatus}`, { episodeId });
    await admin.firestore().collection("episodes").doc(episodeId).update({
        status: newStatus,
        processedAt: new Date().toISOString(),
        ...(newStatus === "error" && { errorMessage: "AI analysis failed. Re-upload to retry." })
    });

    // 3. Only regenerate RSS if episode is ready
    if (newStatus === "ready") {
        await generateRSS(admin.storage().bucket(bucket));
    }

    logger.info("Processing complete", { episodeId, status: newStatus });
});

export const updateRSSEpisode = onDocumentWritten("episodes/{episodeId}", async (event) => {
    // Skip if this is a delete (no after data) or if triggered by processEpisode
    // (processEpisode already calls generateRSS directly)
    const afterData = event.data?.after?.data();
    const beforeData = event.data?.before?.data();

    if (!afterData) {
        logger.info("Episode deleted, regenerating RSS feed...");
        await generateRSS();
        return;
    }

    // Only regenerate if status changed to "ready" from a manual edit
    // (processEpisode already handles its own RSS regeneration)
    if (afterData.status === "ready" && beforeData?.status === "ready") {
        logger.info("Ready episode metadata updated, regenerating RSS feed...");
        await generateRSS();
    }
});
