import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { Bucket } from "@google-cloud/storage";
import { Podcast } from "podcast";

export async function generateRSS(bucket: Bucket = admin.storage().bucket()) {
    logger.info("Generating RSS feed with 'podcast' library...");

    const siteUrl = "https://cadafilms.com";
    const currentYear = new Date().getFullYear();

    const feed = new Podcast({
        title: "MUIT",
        description: "Weekly insights from CADA Productions.",
        feedUrl: `${siteUrl}/rss.xml`,
        siteUrl: siteUrl,
        imageUrl: `${siteUrl}/artwork.jpg`,
        author: "CADA",
        managingEditor: "productionsbycada@gmail.com",
        webMaster: "productionsbycada@gmail.com",
        copyright: `${currentYear} CADA`,
        language: "en",
        categories: ["Society & Culture"],
        pubDate: new Date(),
        ttl: 60,
        itunesAuthor: "MUIT",
        itunesSummary: "Exercising thought about economics, technology, politics, philosophy, culture, and meaning to confront the questions that shape our time.",
        itunesOwner: { name: "MUIT", email: "productionsbycada@gmail.com" },
        itunesExplicit: false,
        itunesCategory: [{ text: "Society & Culture" }],
        itunesType: "episodic"
    });

    logger.info("Querying Firestore for episodes...");
    const snapshot = await admin.firestore()
        .collection("episodes")
        .where("status", "==", "ready")
        .orderBy("uploadedAt", "desc")
        .get();

    logger.info(`Found ${snapshot.size} episodes.`);

    snapshot.forEach(doc => {
        const data = doc.data();

        if (!data.videoUrl) {
            logger.warn(`Skipping episode ${doc.id}: Missing videoUrl`);
            return;
        }

        feed.addItem({
            title: data.title || "Untitled Episode",
            description: data.description || "No description available.",
            url: `${siteUrl}/muit/${doc.id}`,
            guid: `${siteUrl}/muit/${doc.id}`,
            categories: data.keywords || [],
            author: "CADA",
            date: data.uploadedAt || new Date(),
            enclosure: {
                url: data.videoUrl,
                size: data.sizeBytes || 0,
                type: "video/mp4"
            },
            itunesAuthor: "CADA",
            itunesExplicit: false,
            itunesSummary: data.summary || data.description || "",
            itunesDuration: data.duration,
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
