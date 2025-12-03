import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { episodeConverter } from "@/lib/converters";
import SocialPack from "@/components/SocialPack";
import { notFound } from "next/navigation";

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';

async function getEpisode(slug: string) {
    const docRef = doc(db, "episodes", slug).withConverter(episodeConverter);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;
    }

    return docSnap.data();
}

export default async function EpisodePage({ params }: { params: { slug: string } }) {
    const episode = await getEpisode(params.slug);

    if (!episode) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section with Video */}
            <div className="bg-black text-white">
                <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
                    <div className="aspect-video w-full bg-gray-900 rounded-xl overflow-hidden shadow-2xl mb-8">
                        {/* Native Video Player for simplicity, can be upgraded to Vidstack later */}
                        <video
                            src={episode.videoUrl}
                            controls
                            className="w-full h-full object-contain"
                            poster="/artwork.jpg" // Fallback poster
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold mb-4">{episode.title}</h1>
                    <p className="text-gray-400 text-lg max-w-3xl">{episode.summary}</p>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* Left Column: Show Notes & Chapters */}
                <div className="lg:col-span-2 space-y-12">
                    {episode.showNotes && (
                        <section>
                            <h2 className="text-2xl font-bold mb-6 text-gray-900">Show Notes</h2>
                            <div className="prose prose-lg text-gray-600 whitespace-pre-wrap">
                                {episode.showNotes}
                            </div>
                        </section>
                    )}

                    {episode.chapters && episode.chapters.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-6 text-gray-900">Chapters</h2>
                            <div className="space-y-2">
                                {episode.chapters.map((chapter, i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group">
                                        <span className="font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded text-sm group-hover:bg-blue-100 transition-colors">
                                            {chapter.time}
                                        </span>
                                        <span className="text-gray-700 font-medium group-hover:text-gray-900">
                                            {chapter.title}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Right Column: Social Pack & Metadata */}
                <div className="space-y-8">
                    <SocialPack
                        episodeId={episode.id!}
                        title={episode.title}
                        hashtags={episode.hashtags}
                        summary={episode.summary}
                        videoUrl={episode.videoUrl}
                    />

                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-4">Episode Details</h3>
                        <div className="space-y-3 text-sm text-gray-600">
                            <div className="flex justify-between">
                                <span>Released</span>
                                <span className="font-medium">{new Date(episode.date || episode.uploadedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Duration</span>
                                <span className="font-medium">{episode.durationSeconds ? `${Math.floor(episode.durationSeconds / 60)} mins` : 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>File Size</span>
                                <span className="font-medium">{(episode.sizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}
