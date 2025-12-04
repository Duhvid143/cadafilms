"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, FileText, List, Tag, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface Chapter {
    time: string;
    title: string;
}

interface Episode {
    id: string;
    title: string;
    uploadedAt: string; // ISO string or timestamp
    status: string;
    videoUrl?: string;
    summary?: string;
    description?: string;
    chapters?: Chapter[];
    keywords?: string[];
    showNotes?: string[];
}

export default function DashboardPage() {
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedEpisode, setExpandedEpisode] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push("/admin/login");
            }
        });
        return () => unsubscribe();
    }, [router]);

    useEffect(() => {
        const q = query(collection(db, "episodes"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const episodesData: Episode[] = [];
            snapshot.forEach((doc) => {
                episodesData.push({ id: doc.id, ...doc.data() } as Episode);
            });
            // Sort by uploadedAt desc
            episodesData.sort((a, b) => {
                const dateA = new Date(a.uploadedAt).getTime();
                const dateB = new Date(b.uploadedAt).getTime();
                return dateB - dateA;
            });
            setEpisodes(episodesData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const toggleExpand = (id: string) => {
        setExpandedEpisode(expandedEpisode === id ? null : id);
    };

    // Styles matching Upload/Contact page exactly
    const styles = {
        page: {
            backgroundColor: '#050505',
            minHeight: '100vh',
            paddingTop: '200px',
            paddingBottom: '8rem',
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            width: '100%'
        },
        container: {
            maxWidth: '1200px',
            width: '100%',
            padding: '0 2rem',
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center'
        },
        header: {
            width: '100%',
            maxWidth: '800px',
            marginBottom: '4rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end'
        },
        title: {
            fontSize: '4rem',
            fontWeight: 300,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.5rem',
            marginBottom: '1rem',
            color: '#ffffff'
        },
        subtitle: {
            color: '#888888',
            fontSize: '1.1rem',
            fontWeight: 300,
            lineHeight: 1.8
        },
        contentContainer: {
            width: '100%',
            maxWidth: '800px',
            // Removed the glass box container for the whole list to let items breathe, 
            // but we can wrap individual items or the whole list if desired.
            // For consistency with "formContainer", we could wrap it, but a list usually needs more space.
            // Let's keep the width constraint to align with the header.
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '1.5rem'
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <Link
                            href="/admin/upload"
                            className="inline-flex items-center text-sm text-white/40 hover:text-white transition-colors mb-4 group"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Upload
                        </Link>
                        <h1 style={styles.title}>
                            Dashboard
                        </h1>
                        <p style={styles.subtitle}>
                            Monitor uploads and AI analysis results
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <a
                            href="https://firebasestorage.googleapis.com/v0/b/cada-f5b39.firebasestorage.app/o/public%2Ffeed.xml?alt=media"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full backdrop-blur-md transition-all group"
                        >
                            <span className="text-sm font-medium tracking-wide">View RSS Feed</span>
                            <ExternalLink className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
                        </a>
                    </div>
                </div>

                {/* Content */}
                <div style={styles.contentContainer}>
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
                        </div>
                    ) : (
                        <>
                            {episodes.map((episode) => (
                                <div
                                    key={episode.id}
                                    className="group relative bg-white/[0.02] border border-white/[0.08] rounded-[30px] overflow-hidden hover:bg-white/[0.05] transition-all duration-300 backdrop-blur-sm"
                                >
                                    <div
                                        className="p-8 cursor-pointer"
                                        onClick={() => toggleExpand(episode.id)}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                                    {episode.status === "ready" ? (
                                                        <CheckCircle className="w-5 h-5 text-green-400" />
                                                    ) : episode.status === "processing" ? (
                                                        <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                                                    ) : (
                                                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-light text-white group-hover:text-blue-200 transition-colors tracking-wide">
                                                        {episode.title || "Untitled Episode"}
                                                    </h3>
                                                    <div className="flex items-center gap-3 text-sm text-white/40 mt-2">
                                                        <span className="font-mono text-xs opacity-60 tracking-wider">ID: {episode.id}</span>
                                                        <span>•</span>
                                                        <span className="tracking-wide">{new Date(episode.uploadedAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className={`px-4 py-1.5 rounded-full text-xs font-medium border tracking-wider ${episode.status === "ready"
                                                    ? "bg-green-500/10 border-green-500/20 text-green-400"
                                                    : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                                    }`}>
                                                    {episode.status?.toUpperCase() || "UNKNOWN"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {expandedEpisode === episode.id && (
                                        <div className="border-t border-white/5 bg-black/20 p-8 animate-in slide-in-from-top-2 duration-200">
                                            <div className="grid md:grid-cols-2 gap-12">
                                                {/* Left Column: Summary & Description */}
                                                <div className="space-y-8">
                                                    <div>
                                                        <h4 className="flex items-center gap-2 text-xs font-medium text-white/40 mb-4 uppercase tracking-[0.2em]">
                                                            <FileText className="w-3 h-3" /> Summary
                                                        </h4>
                                                        <p className="text-white/80 leading-relaxed font-light text-lg">
                                                            {episode.summary || "No summary available yet."}
                                                        </p>
                                                    </div>

                                                    {episode.description && (
                                                        <div>
                                                            <h4 className="flex items-center gap-2 text-xs font-medium text-white/40 mb-4 uppercase tracking-[0.2em]">
                                                                Description
                                                            </h4>
                                                            <p className="text-white/60 text-sm leading-relaxed font-light">
                                                                {episode.description}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Right Column: Chapters & Keywords */}
                                                <div className="space-y-8">
                                                    {episode.chapters && episode.chapters.length > 0 && (
                                                        <div>
                                                            <h4 className="flex items-center gap-2 text-xs font-medium text-white/40 mb-4 uppercase tracking-[0.2em]">
                                                                <List className="w-3 h-3" /> Chapters
                                                            </h4>
                                                            <div className="space-y-3">
                                                                {episode.chapters.map((chapter, idx) => (
                                                                    <div key={idx} className="flex items-start gap-4 text-sm group/chapter">
                                                                        <span className="font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded text-xs">
                                                                            {chapter.time}
                                                                        </span>
                                                                        <span className="text-white/70 group-hover/chapter:text-white transition-colors font-light">
                                                                            {chapter.title}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {episode.keywords && episode.keywords.length > 0 && (
                                                        <div>
                                                            <h4 className="flex items-center gap-2 text-xs font-medium text-white/40 mb-4 uppercase tracking-[0.2em]">
                                                                <Tag className="w-3 h-3" /> Keywords
                                                            </h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                {episode.keywords.map((keyword, idx) => (
                                                                    <span
                                                                        key={idx}
                                                                        className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/60 hover:bg-white/10 hover:text-white transition-colors tracking-wide"
                                                                    >
                                                                        {keyword}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {episodes.length === 0 && (
                                <div className="text-center py-20 bg-white/[0.02] rounded-[30px] border border-white/[0.08] border-dashed backdrop-blur-sm">
                                    <p className="text-white/40 font-light text-lg">No episodes found.</p>
                                    <Link href="/admin/upload" className="text-blue-400 hover:text-blue-300 mt-2 inline-block transition-colors">
                                        Upload your first episode
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
