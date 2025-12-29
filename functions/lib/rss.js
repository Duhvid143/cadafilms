"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRSS = generateRSS;
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const podcast_1 = require("podcast");
async function generateRSS(bucket = admin.storage().bucket()) {
    logger.info("Generating RSS feed with 'podcast' library...");
    const siteUrl = "https://cadafilms.com";
    const feed = new podcast_1.Podcast({
        title: "MUIT", // Updated title from user snippet
        description: "Weekly insights from CADA Productions.",
        feedUrl: `${siteUrl}/rss.xml`,
        siteUrl: siteUrl,
        imageUrl: `${siteUrl}/artwork.jpg`, // Matches user snippet
        author: "CADA",
        managingEditor: "you@cadafilms.com",
        webMaster: "you@cadafilms.com", // Fallback
        copyright: "2025 CADA",
        language: "en",
        categories: ["Society & Culture"], // Matched to Spotify feed
        pubDate: new Date(),
        ttl: 60,
        itunesAuthor: "MUIT", // Changed from CADA to MUIT to match Spotify
        itunesSummary: "Exercising thought about economics, technology, politics, philosophy, culture, and meaning to confront the questions that shape our time.",
        itunesOwner: { name: "MUIT", email: "productionsbycada@gmail.com" }, // Matched to Spotify
        itunesExplicit: false,
        itunesCategory: [{ text: "Society & Culture" }],
        itunesType: "episodic"
    });
    try {
        logger.info("Querying Firestore for episodes...");
        const snapshot = await admin.firestore()
            .collection("episodes")
            .where("status", "==", "ready")
            .orderBy("uploadedAt", "desc")
            .get();
        logger.info(`Found ${snapshot.size} episodes.`);
        snapshot.forEach(doc => {
            const data = doc.data();
            // Critical check: Ensure valid enclosure (video file)
            // If data.videoUrl is missing, we shouldn't add it as a playable episode, or we skip it
            if (!data.videoUrl) {
                logger.warn(`Skipping episode ${doc.id}: Missing videoUrl`);
                return;
            }
            feed.addItem({
                title: data.title || "Untitled Episode",
                description: data.description || "No description available.",
                url: `${siteUrl}/muit/${doc.id}`, // Permalink
                guid: `${siteUrl}/muit/${doc.id}`,
                categories: data.keywords || [],
                author: "CADA",
                date: data.uploadedAt || new Date(),
                enclosure: {
                    url: data.videoUrl,
                    size: data.sizeBytes || 0, // Should be passed from upload
                    type: "video/mp4"
                },
                itunesAuthor: "CADA",
                itunesExplicit: false,
                itunesSummary: data.summary || data.description || "",
                itunesDuration: data.duration, // Optional: if AI or metadata provides this
                // itunesImage: data.thumbnailUrl // Optional: if each ep has artwork
            });
        });
        const rssContent = feed.buildXml();
        await bucket.file("public/feed.xml").save(rssContent, {
            contentType: "application/xml",
            public: true,
            metadata: {
                cacheControl: "public, max-age=0, no-transform"
            }
        });
        logger.info("RSS feed generated successfully");
    }
    catch (error) {
        logger.error("Error generating RSS", error);
    }
}
//# sourceMappingURL=rss.js.map