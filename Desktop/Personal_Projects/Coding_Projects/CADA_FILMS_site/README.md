# Project Antigravity: Headless Podcast CMS

A "Headless Podcast CMS" that handles 2GB+ video uploads via Next.js + Firebase without Vercel timeouts.

## 🚀 Features
- **Direct-to-Cloud Uploads**: Bypasses Vercel server limits using `uploadBytesResumable`.
- **AI Analysis**: Gemini 1.5 Flash analyzes video content for summaries, chapters, and show notes.
- **Automated Backups**: Backs up every episode to Google Drive.
- **RSS Generation**: Automatically updates the RSS feed for podcast distribution.
- **Social Pack**: One-click copy for YouTube and X metadata.

## 🛠️ Setup & Deployment

### Prerequisites
1.  **Firebase Project**: Create a project on the Blaze plan.
2.  **Google Cloud APIs**: Enable "Google Drive API" and "Vertex AI API".
3.  **Service Account**: Create a Service Account in Google Cloud Console, download the JSON key, and set it up.

### Environment Variables
Create a `.env.local` file in the root:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

For Cloud Functions, set variables via Firebase CLI:
```bash
firebase functions:config:set drive.folder_id="your_folder_id"
```

### Deployment
1.  **Deploy Cloud Functions**:
    ```bash
    firebase deploy --only functions
    ```
2.  **Deploy Storage Rules**:
    ```bash
    firebase deploy --only storage
    ```
3.  **Deploy Frontend**:
    ```bash
    npm run build
    # Deploy to Vercel or Firebase Hosting
    ```

## 📂 Project Structure
- `/functions`: Cloud Functions (AI, RSS, Drive).
- `/src/app/admin/upload`: Admin dashboard.
- `/src/app/muit/[slug]`: Public episode page.
- `/src/lib`: Firebase SDK and converters.
- `/src/components`: UI components.
