import { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions, WithFieldValue } from "firebase/firestore";
import { Episode } from "@/types";

export const episodeConverter: FirestoreDataConverter<Episode> = {
    toFirestore(episode: WithFieldValue<Episode>): DocumentData {
        return { ...episode };
    },
    fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
    ): Episode {
        const data = snapshot.data(options);
        return {
            id: snapshot.id,
            title: data.title,
            description: data.description,
            summary: data.summary,
            videoUrl: data.videoUrl,
            sizeBytes: data.sizeBytes,
            durationSeconds: data.durationSeconds,
            uploadedAt: data.uploadedAt,
            date: data.date,
            status: data.status,
            chapters: data.chapters,
            showNotes: data.showNotes,
            hashtags: data.hashtags,
            keywords: data.keywords,
            processedAt: data.processedAt,
        };
    }
};
