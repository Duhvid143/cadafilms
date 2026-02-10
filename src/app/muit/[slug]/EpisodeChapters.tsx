"use client";

import { Chapter } from "@/types";

function parseTimeToSeconds(time: string): number {
    const parts = time.split(':').map(Number);
    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    }
    return 0;
}

export default function EpisodeChapters({ chapters }: { chapters: Chapter[] }) {
    const seekTo = (time: string) => {
        const video = document.getElementById('episode-video') as HTMLVideoElement | null;
        if (video) {
            video.currentTime = parseTimeToSeconds(time);
            video.play();
            video.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    return (
        <section>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Chapters</h2>
            <div className="space-y-2">
                {chapters.map((chapter, i) => (
                    <button
                        key={i}
                        onClick={() => seekTo(chapter.time)}
                        className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group w-full text-left"
                    >
                        <span className="font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded text-sm group-hover:bg-blue-100 transition-colors">
                            {chapter.time}
                        </span>
                        <span className="text-gray-700 font-medium group-hover:text-gray-900">
                            {chapter.title}
                        </span>
                    </button>
                ))}
            </div>
        </section>
    );
}
