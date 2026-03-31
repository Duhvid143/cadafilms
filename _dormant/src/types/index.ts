export interface Chapter {
    time: string;
    title: string;
}

export interface Episode {
    id: string;
    title: string;
    uploadedAt: string; // ISO string or timestamp
    status: string;
    videoUrl?: string;
    sizeBytes?: number;
    summary?: string;
    description?: string; // AI generated
    chapters?: Chapter[];
    keywords?: string[] | string;
    showNotes?: string[];
}

export interface Article {
    id: string;
    title: string;
    slug: string;
    coverImageUrl: string;
    content: string;
    author?: string; // New field
    hideTitleOverlay?: boolean; // New field
    createdAt: string;
    updatedAt: string;
}
