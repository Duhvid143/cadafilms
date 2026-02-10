export interface Chapter {
    time: string;
    title: string;
}

export interface Episode {
    id: string;
    title: string;
    uploadedAt: string;
    date?: string;
    processedAt?: string;
    status: "processing" | "ready" | "error";
    videoUrl: string;
    sizeBytes?: number;
    durationSeconds?: number;
    summary?: string;
    description?: string;
    chapters?: Chapter[];
    keywords?: string[];
    hashtags?: string[];
    showNotes?: string;
    errorMessage?: string;
}

export interface Article {
    id: string;
    title: string;
    slug: string;
    coverImageUrl: string;
    content: string;
    author?: string;
    hideTitleOverlay?: boolean;
    createdAt: string;
    updatedAt: string;
}
