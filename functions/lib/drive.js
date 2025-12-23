"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupToDrive = backupToDrive;
const admin = require("firebase-admin");
const googleapis_1 = require("googleapis");
const logger = require("firebase-functions/logger");
// OAuth2 Configuration
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    logger.warn("Missing Google OAuth credentials in environment variables.");
}
const oauth2Client = new googleapis_1.google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
const drive = googleapis_1.google.drive({ version: 'v3', auth: oauth2Client });
async function backupToDrive(bucketName, filePath, fileName) {
    logger.info("Backing up to Google Drive (Streaming)", { fileName });
    const bucket = admin.storage().bucket(bucketName);
    const file = bucket.file(filePath);
    try {
        // Use the folder ID from env or fallback to root
        const folderId = process.env.DRIVE_FOLDER_ID;
        const fileMetadata = {
            name: fileName,
            parents: folderId ? [folderId] : []
        };
        // Create a pass-through stream to pipe GCS -> Drive
        // GCS createReadStream() returns a readable stream
        const gcsStream = file.createReadStream()
            .on('error', (err) => logger.error("GCS Stream Error", err));
        const media = {
            mimeType: 'video/mp4',
            body: gcsStream
        };
        try {
            if (folderId)
                logger.info("Attempting upload to folder", { folderId });
            const response = await drive.files.create({
                requestBody: fileMetadata,
                media: media,
                fields: 'id',
                supportsAllDrives: true
            });
            logger.info("Backup complete", { fileId: response.data.id });
        }
        catch (error) {
            logger.warn("Upload failed", { error: error.message });
            // Fallback to root if folder fails
            if (folderId) {
                logger.info("Retrying upload to root directory...");
                delete fileMetadata.parents;
                // Re-create stream for retry as the previous one might be consumed/errored
                const retryStream = file.createReadStream();
                const retryResponse = await drive.files.create({
                    requestBody: fileMetadata,
                    media: {
                        mimeType: 'video/mp4',
                        body: retryStream
                    },
                    fields: 'id',
                    supportsAllDrives: true
                });
                logger.info("Backup to root complete", { fileId: retryResponse.data.id });
            }
            else {
                throw error;
            }
        }
    }
    catch (error) {
        logger.error("Error backing up to Drive", { error });
        throw error; // Re-throw so Promise.allSettled catches it
    }
}
//# sourceMappingURL=drive.js.map