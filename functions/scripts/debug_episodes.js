const admin = require('firebase-admin');

// Initialize with default credentials
// Ensure you are authenticated via `gcloud auth application-default login`
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'cada-f5b39'
    });
}

const db = admin.firestore();

async function listEpisodes() {
    console.log("Listing all episodes in 'episodes' collection...");
    try {
        const snapshot = await db.collection('episodes').get();
        if (snapshot.empty) {
            console.log("No matching documents.");
            return;
        }

        snapshot.forEach(doc => {
            console.log(doc.id, '=>', JSON.stringify(doc.data(), null, 2));
        });
    } catch (error) {
        console.error("Error getting documents:", error);
    }
}

listEpisodes();
