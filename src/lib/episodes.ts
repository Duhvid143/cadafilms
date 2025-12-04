import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "./firebase";

export interface Episode {
    id: string;
    title?: string; // AI might not return title, we use ID or filename if missing
    summary: string;
    description: string;
    showNotes?: string[];
    chapters?: { time: string; title: string }[];
    keywords?: string[];
    status: "ready" | "processing" | "error";
    processedAt: string;
    videoUrl: string;
}

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

export async function getEpisodes(): Promise<Episode[]> {
    try {
        const episodesRef = collection(db, "episodes");
        const q = query(
            episodesRef
            // where("status", "==", "ready")
            // orderBy("processedAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            // Construct public video URL
            // Assuming file path is episodes/{id}.mp4 based on upload logic
            // We might need to store the actual path if it varies, but for now this is a safe assumption
            const videoPath = `episodes/${doc.id}.mp4`;
            const videoUrl = `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodeURIComponent(videoPath)}?alt=media`;

            return {
                id: doc.id,
                title: data.title || doc.id, // Fallback to ID if title missing
                summary: data.summary || "",
                description: data.description || "",
                showNotes: data.showNotes || [],
                chapters: data.chapters || [],
                keywords: data.keywords || [],
                status: data.status,
                processedAt: data.processedAt,
                videoUrl
            } as Episode;
        });

        return results.sort((a, b) => new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime());
    } catch (error) {
        console.error("Error fetching episodes:", error);
        return [];
    }
}
