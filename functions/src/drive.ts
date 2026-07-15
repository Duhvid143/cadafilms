import { google } from "googleapis";
import { getStorage } from "firebase-admin/storage";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export async function backupToDrive(bucketName: string, filePath: string, fileName: string) {
    try {
        // Load Service Account Key (Ensure this env var is set in Firebase Functions)
        // For local dev, it might be in a file, but for prod, use env var or default creds if configured
        // Here we assume GOOGLE_APPLICATION_CREDENTIALS is set or we use a specific key file path
        // For simplicity in this snippet, we'll assume standard auth or a key file path provided in env

        // Load Service Account Key from Env (for Gen 2 functions)
        const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
        const credentials = credentialsJson ? JSON.parse(credentialsJson) : undefined;

        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/drive.file'],
        });

        const drive = google.drive({ version: 'v3', auth });

        // Download file from Firebase Storage to temp
        const bucket = getStorage().bucket(bucketName);
        const tempFilePath = path.join(os.tmpdir(), fileName);

        console.log(`Downloading ${fileName} to ${tempFilePath}...`);
        await bucket.file(filePath).download({ destination: tempFilePath });

        // Upload to Drive
        console.log(`Uploading ${fileName} to Google Drive...`);
        const response = await drive.files.create({
            requestBody: {
                name: fileName,
                parents: [process.env.DRIVE_FOLDER_ID || 'root'], // Set DRIVE_FOLDER_ID in env
            },
            media: {
                mimeType: 'video/mp4',
                body: fs.createReadStream(tempFilePath),
            },
        });

        console.log(`Backup complete. File ID: ${response.data.id}`);

        // Cleanup
        fs.unlinkSync(tempFilePath);
    } catch (error) {
        console.error("Error backing up to Drive:", error);
        // Don't throw, allow other processes to continue
    }
}
