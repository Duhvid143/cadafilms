import * as admin from "firebase-admin";
import { google } from "googleapis";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import * as logger from "firebase-functions/logger";

// OAuth2 Configuration
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    logger.warn("Missing Google OAuth credentials in environment variables.");
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({ version: 'v3', auth: oauth2Client });

export async function backupToDrive(bucketName: string, filePath: string, fileName: string) {
    logger.info("Backing up to Google Drive", { fileName });

    const tempFilePath = path.join(os.tmpdir(), fileName);
    const bucket = admin.storage().bucket(bucketName);

    try {
        logger.debug("Downloading file", { tempFilePath });
        await bucket.file(filePath).download({ destination: tempFilePath });

        // Use the folder ID from env or fallback to root
        const folderId = process.env.DRIVE_FOLDER_ID;

        const fileMetadata: any = {
            name: fileName,
            parents: folderId ? [folderId] : []
        };

        const media = {
            mimeType: 'video/mp4',
            body: fs.createReadStream(tempFilePath)
        };

        try {
            if (folderId) logger.info("Attempting upload to folder", { folderId });

            const response = await drive.files.create({
                requestBody: fileMetadata,
                media: media,
                fields: 'id',
                supportsAllDrives: true
            });

            logger.info("Backup complete", { fileId: response.data.id });
        } catch (error: any) {
            logger.warn("Upload failed", { error: error.message });
            // Fallback to root if folder fails
            if (folderId) {
                logger.info("Retrying upload to root directory...");
                delete fileMetadata.parents;
                const retryResponse = await drive.files.create({
                    requestBody: fileMetadata,
                    media: media,
                    fields: 'id',
                    supportsAllDrives: true
                });
                logger.info("Backup to root complete", { fileId: retryResponse.data.id });
            } else {
                throw error;
            }
        }

    } catch (error) {
        logger.error("Error backing up to Drive", { error });
    } finally {
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
    }
}
