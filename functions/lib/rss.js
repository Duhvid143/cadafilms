"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRSS = generateRSS;
const podcast_1 = require("podcast");
const admin = require("firebase-admin");
async function generateRSS(bucketName) {
    console.log("Generating RSS feed...");
    try {
        const feed = new podcast_1.Podcast({
            title: "MUIT",
            description: "Weekly insights from CADA Productions.",
            feedUrl: "https://cadafilms.com/rss.xml",
            siteUrl: "https://cadafilms.com",
            author: "CADA",
            imageUrl: "https://cadafilms.com/artwork.jpg",
            itunesOwner: { name: "CADA", email: "you@cadafilms.com" }
        });
        console.log("Querying Firestore for episodes...");
        const snapshot = await admin.firestore().collection("episodes").get();
        console.log(`Found ${snapshot.size} episodes.`);
        const episodes = [];
        snapshot.forEach(doc => {
            episodes.push(Object.assign({ id: doc.id }, doc.data()));
        });
        // Sort in memory
        episodes.sort((a, b) => {
            const dateA = new Date(a.date || a.uploadedAt).getTime();
            const dateB = new Date(b.date || b.uploadedAt).getTime();
            return dateB - dateA;
        });
        for (const data of episodes) {
            if (data.status === "ready") {
                feed.addItem({
                    title: data.title,
                    description: data.description || data.summary,
                    url: `https://cadafilms.com/muit/${data.id}`,
                    date: data.date || data.uploadedAt,
                    enclosure: {
                        url: data.videoUrl,
                        type: "video/mp4",
                        size: data.sizeBytes
                    },
                    itunesDuration: data.durationSeconds
                });
            }
        }
        const xml = feed.buildXml();
        const bucket = admin.storage().bucket(bucketName);
        await bucket.file("public/feed.xml").save(xml, {
            public: true,
            contentType: "application/rss+xml"
        });
        console.log("RSS feed generated successfully");
    }
    catch (error) {
        console.error("Error generating RSS feed:", error);
        // Try to log the project ID we are connected to
        console.error("Current Project ID:", admin.app().options.projectId);
    }
}
//# sourceMappingURL=rss.js.map