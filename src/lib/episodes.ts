import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "./firebase";
import { Episode } from "@/types";

export type { Episode };

export async function getEpisodes(): Promise<Episode[]> {
    try {
        const episodesRef = collection(db, "episodes");
        const q = query(
            episodesRef,
            where("status", "==", "ready"),
            orderBy("processedAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title || doc.id,
                summary: data.summary || "",
                description: data.description || "",
                showNotes: data.showNotes || "",
                chapters: data.chapters || [],
                keywords: data.keywords || [],
                hashtags: data.hashtags || [],
                status: data.status,
                processedAt: data.processedAt,
                uploadedAt: data.uploadedAt,
                videoUrl: data.videoUrl || "",
                sizeBytes: data.sizeBytes,
                durationSeconds: data.durationSeconds,
            } as Episode;
        });
    } catch (error) {
        console.error("Error fetching episodes:", error);
        throw error;
    }
}
