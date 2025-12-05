const { google } = require('googleapis');
const http = require('http');
const url = require('url');
const { exec } = require('child_process');

// Instructions:
// 1. Ensure your OAuth Client is type "Desktop App".
// 2. Run: node setup_drive_token.js <CLIENT_ID> <CLIENT_SECRET>

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const REDIRECT_URI = 'http://127.0.0.1:3000/oauth2callback';

async function getRefreshToken(clientId, clientSecret) {
    const oAuth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        REDIRECT_URI
    );

    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    const server = http.createServer(async (req, res) => {
        if (req.url.startsWith('/oauth2callback')) {
            const qs = new url.URL(req.url, 'http://127.0.0.1:3000').searchParams;
            const code = qs.get('code');

            res.end('Authentication successful! You can close this window and check your terminal.');
            server.close();

            if (code) {
                try {
                    const { tokens } = await oAuth2Client.getToken(code);
                    console.log('\nSUCCESS! Here is your Refresh Token:\n');
                    console.log(tokens.refresh_token);
                    console.log('\nCopy this token and provide it to the chat!');
                } catch (err) {
                    console.error('Error retrieving access token', err);
                }
            }
        }
    });

    server.listen(3000, () => {
        console.log('Local server listening on port 3000...');
        console.log('Opening browser to:', authUrl);

        // Open the browser automatically
        exec(`open "${authUrl}"`);
    });
}

const args = process.argv.slice(2);
if (args.length < 2) {
    console.log('Usage: node setup_drive_token.js <CLIENT_ID> <CLIENT_SECRET>');
} else {
    getRefreshToken(args[0], args[1]);
}
