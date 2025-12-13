"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRSS = generateRSS;
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
async function generateRSS(bucket = admin.storage().bucket()) {
    logger.info("Generating RSS feed...");
    const siteUrl = "https://cadafilms.com"; // Configure this
    const rssHeader = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>CADA Films Podcast</title>
    <link>${siteUrl}</link>
    <language>en-us</language>
    <itunes:author>CADA Films</itunes:author>
    <description>Latest episodes from CADA Films</description>
    <itunes:image href="${siteUrl}/logo.png"/>
`;
    try {
        logger.info("Querying Firestore for episodes...");
        const snapshot = await admin.firestore()
            .collection("episodes")
            .where("status", "==", "ready")
            .orderBy("uploadedAt", "desc")
            .get();
        logger.info(`Found ${snapshot.size} episodes.`);
        let items = "";
        snapshot.forEach(doc => {
            const data = doc.data();
            items += `
    <item>
      <title>${data.title}</title>
      <enclosure url="${data.videoUrl}" type="video/mp4" length="${data.sizeBytes}"/>
      <guid>${doc.id}</guid>
      <pubDate>${new Date(data.uploadedAt).toUTCString()}</pubDate>
      <description>${data.summary || data.description || ""}</description>
    </item>`;
        });
        const rssContent = `${rssHeader}${items}
  </channel>
</rss>`;
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