"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupToDrive = backupToDrive;
const admin = require("firebase-admin");
const googleapis_1 = require("googleapis");
const path = require("path");
const fs = require("fs");
const os = require("os");
// OAuth2 Configuration
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    console.warn("Missing Google OAuth credentials in environment variables.");
}
const oauth2Client = new googleapis_1.google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
const drive = googleapis_1.google.drive({ version: 'v3', auth: oauth2Client });
async function backupToDrive(bucketName, filePath, fileName) {
    console.log(`Backing up ${fileName} to Google Drive...`);
    const tempFilePath = path.join(os.tmpdir(), fileName);
    const bucket = admin.storage().bucket(bucketName);
    try {
        console.log(`Downloading to ${tempFilePath}...`);
        await bucket.file(filePath).download({ destination: tempFilePath });
        // Use the folder ID from env or fallback to root
        const folderId = process.env.DRIVE_FOLDER_ID;
        const fileMetadata = {
            name: fileName,
            parents: folderId ? [folderId] : []
        };
        const media = {
            mimeType: 'video/mp4',
            body: fs.createReadStream(tempFilePath)
        };
        try {
            if (folderId)
                console.log(`Attempting upload to folder: ${folderId}`);
            const response = await drive.files.create({
                requestBody: fileMetadata,
                media: media,
                fields: 'id',
                supportsAllDrives: true
            });
            console.log(`Backup complete. File ID: ${response.data.id}`);
        }
        catch (error) {
            console.warn("Upload failed:", error.message);
            // Fallback to root if folder fails
            if (folderId) {
                console.log("Retrying upload to root directory...");
                delete fileMetadata.parents;
                const retryResponse = await drive.files.create({
                    requestBody: fileMetadata,
                    media: media,
                    fields: 'id',
                    supportsAllDrives: true
                });
                console.log(`Backup to root complete. File ID: ${retryResponse.data.id}`);
            }
            else {
                throw error;
            }
        }
    }
    catch (error) {
        console.error("Error backing up to Drive:", error);
    }
    finally {
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
    }
}
//# sourceMappingURL=drive.js.map