"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRSS = generateRSS;
const podcast_1 = require("podcast");
const storage_1 = require("firebase-admin/storage");
const firestore_1 = require("firebase-admin/firestore");
async function generateRSS(bucketName) {
    const feed = new podcast_1.Podcast({
        title: "MUIT",
        description: "Weekly insights from CADA Productions.",
        feedUrl: "https://cadafilms.com/rss.xml",
        siteUrl: "https://cadafilms.com",
        author: "CADA",
        imageUrl: "https://cadafilms.com/artwork.jpg",
        itunesOwner: { name: "CADA", email: "you@cadafilms.com" }
    });
    const snapshot = await (0, firestore_1.getFirestore)().collection("episodes").orderBy("date", "desc").get();
    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === "ready") { // Only include ready episodes
            feed.addItem({
                title: data.title,
                description: data.description || data.summary, // Fallback to summary
                url: `https://cadafilms.com/muit/${doc.id}`,
                date: data.date || data.uploadedAt,
                enclosure: {
                    url: data.videoUrl, // Direct Firebase Download URL
                    type: "video/mp4",
                    size: data.sizeBytes
                },
                itunesDuration: data.durationSeconds
            });
        }
    });
    const xml = feed.buildXml();
    const bucket = (0, storage_1.getStorage)().bucket(bucketName);
    await bucket.file("public/feed.xml").save(xml, {
        public: true,
        contentType: "application/rss+xml"
    });
    console.log("RSS feed generated successfully");
}
//# sourceMappingURL=rss.js.map