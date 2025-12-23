"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRSSEpisode = exports.processEpisode = void 0;
const admin = require("firebase-admin");
const storage_1 = require("firebase-functions/v2/storage");
const firestore_1 = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const rss_1 = require("./rss");
const drive_1 = require("./drive");
const ai_1 = require("./ai");
admin.initializeApp();
logger.info("Firebase Admin Initialized", { projectId: admin.app().options.projectId });
// 2GB+ file processing requires increased memory/timeout
exports.processEpisode = (0, storage_1.onObjectFinalized)({
    cpu: 2,
    memory: "8GiB",
    timeoutSeconds: 3600, // 1 hour
    region: "us-east1"
}, async (event) => {
    const filePath = event.data.name;
    if (!filePath.startsWith("episodes/"))
        return; // Only process episodes
    const bucket = event.data.bucket;
    const contentType = event.data.contentType;
    const fileName = filePath.split("/").pop();
    const episodeId = fileName === null || fileName === void 0 ? void 0 : fileName.split(".")[0];
    if (!fileName || !episodeId) {
        logger.error("Invalid file name or episode ID", { filePath });
        return;
    }
    logger.info("Processing episode", { episodeId, fileName });
    // 1. Parallel Processing: Drive Backup + AI Analysis
    // Use allSettled so one failure doesn't stop the other
    const results = await Promise.allSettled([
        (0, drive_1.backupToDrive)(bucket, filePath, fileName),
        (0, ai_1.analyzeVideo)(bucket, filePath, episodeId, contentType || "video/mp4")
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
    await (0, rss_1.generateRSS)(admin.storage().bucket(bucket));
    logger.info("Processing complete", { episodeId });
});
exports.updateRSSEpisode = (0, firestore_1.onDocumentWritten)("episodes/{episodeId}", async (event) => {
    logger.info("Episode changed, regenerating RSS feed...");
    await (0, rss_1.generateRSS)();
});
//# sourceMappingURL=index.js.map