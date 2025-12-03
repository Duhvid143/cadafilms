"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupToDrive = backupToDrive;
const googleapis_1 = require("googleapis");
const storage_1 = require("firebase-admin/storage");
const fs = require("fs");
const path = require("path");
const os = require("os");
async function backupToDrive(bucketName, filePath, fileName) {
    try {
        // Load Service Account Key (Ensure this env var is set in Firebase Functions)
        // For local dev, it might be in a file, but for prod, use env var or default creds if configured
        // Here we assume GOOGLE_APPLICATION_CREDENTIALS is set or we use a specific key file path
        // For simplicity in this snippet, we'll assume standard auth or a key file path provided in env
        // Load Service Account Key from Env (for Gen 2 functions)
        const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
        const credentials = credentialsJson ? JSON.parse(credentialsJson) : undefined;
        const auth = new googleapis_1.google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/drive.file'],
        });
        const drive = googleapis_1.google.drive({ version: 'v3', auth });
        // Download file from Firebase Storage to temp
        const bucket = (0, storage_1.getStorage)().bucket(bucketName);
        const tempFilePath = path.join(os.tmpdir(), fileName);
        console.log(`Downloading ${fileName} to ${tempFilePath}...`);
        await bucket.file(filePath).download({ destination: tempFilePath });
        // Upload to Drive
        console.log(`Uploading ${fileName} to Google Drive...`);
        console.log(`Target Folder ID: ${process.env.DRIVE_FOLDER_ID || 'root'}`);
        const response = await drive.files.create({
            requestBody: {
                name: fileName,
                parents: [process.env.DRIVE_FOLDER_ID || 'root'],
            },
            media: {
                mimeType: 'video/mp4',
                body: fs.createReadStream(tempFilePath),
            },
            supportsAllDrives: true, // Required for shared drives/folders owned by others
        });
        console.log(`Backup complete. File ID: ${response.data.id}`);
        // Cleanup
        fs.unlinkSync(tempFilePath);
    }
    catch (error) {
        console.error("Error backing up to Drive:", error);
        // Don't throw, allow other processes to continue
    }
}
//# sourceMappingURL=drive.js.map