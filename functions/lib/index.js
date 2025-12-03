"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processEpisode = void 0;
const storage_1 = require("firebase-functions/v2/storage");
const app_1 = require("firebase-admin/app");
const rss_1 = require("./rss");
const drive_1 = require("./drive");
const ai_1 = require("./ai");
(0, app_1.initializeApp)({
    projectId: "cada-f5b39", // Explicitly set Project ID to resolve Firestore discovery issues
    storageBucket: "cada-f5b39.firebasestorage.app" // Explicitly set Storage Bucket
});
// 2GB+ file processing requires increased memory/timeout
exports.processEpisode = (0, storage_1.onObjectFinalized)({
    cpu: 2,
    memory: "8GiB",
    timeoutSeconds: 540, // 9 mins
    region: "us-east1"
}, async (event) => {
    const filePath = event.data.name;
    if (!filePath.startsWith("episodes/"))
        return; // Only process episodes
    const bucket = event.data.bucket;
    const fileName = filePath.split("/").pop();
    const episodeId = fileName === null || fileName === void 0 ? void 0 : fileName.split(".")[0];
    if (!fileName || !episodeId) {
        console.error("Invalid file name or episode ID");
        return;
    }
    console.log(`Processing episode: ${episodeId}`);
    // 1. Parallel Processing: Drive Backup + AI Analysis
    await Promise.all([
        (0, drive_1.backupToDrive)(bucket, filePath, fileName),
        (0, ai_1.analyzeVideo)(bucket, filePath, episodeId)
    ]);
    // 2. RSS Regeneration (Must happen after metadata is in DB)
    // Note: In a real app, you might trigger this separately or wait for AI
    // For now, we run it here, but ideally AI analysis updates DB which triggers another function
    // or we wait for AI to finish (which we do above with Promise.all)
    await (0, rss_1.generateRSS)(bucket);
    console.log(`Processing complete for ${episodeId}`);
});
//# sourceMappingURL=index.js.map