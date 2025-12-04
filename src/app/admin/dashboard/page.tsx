"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, FileText, List, Tag, Clock, CheckCircle, AlertCircle, Loader2, ChevronDown, ChevronUp, PlayCircle } from "lucide-react";

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
    keywords?: string[] | string; // Handle potential string return from AI
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

    // Helper to safely get keywords array
    const getKeywords = (ep: Episode): string[] => {
        if (Array.isArray(ep.keywords)) return ep.keywords;
        if (typeof ep.keywords === 'string') return (ep.keywords as string).split(',').map(s => s.trim());
        return [];
    };

    const styles = {
        page: {
            backgroundColor: '#050505',
            minHeight: '100vh',
            paddingTop: '120px', // Reduced top padding slightly
            paddingBottom: '8rem',
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            width: '100%'
        },
        container: {
            maxWidth: '1000px', // Slightly wider for dashboard view
            width: '100%',
            padding: '0 2rem',
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center'
        },
        header: {
            width: '100%',
            marginBottom: '3rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            paddingBottom: '2rem'
        },
        title: {
            fontSize: '3rem',
            fontWeight: 300,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.3rem',
            marginBottom: '0.5rem',
            color: '#ffffff'
        },
        subtitle: {
            color: '#888888',
            fontSize: '1rem',
            fontWeight: 300,
            letterSpacing: '0.05rem'
        },
        contentContainer: {
            width: '100%',
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
                            className="inline-flex items-center text-xs font-medium text-white/40 hover:text-white transition-colors mb-4 group uppercase tracking-widest"
                        >
                            <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Upload
                        </Link>
                        <h1 style={styles.title}>
                            Dashboard
                        </h1>
                        <p style={styles.subtitle}>
                            Manage your content & AI insights
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <a
                            href="https://firebasestorage.googleapis.com/v0/b/cada-f5b39.firebasestorage.app/o/public%2Ffeed.xml?alt=media"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full backdrop-blur-md transition-all group hover:border-white/20"
                        >
                            <span className="text-xs font-medium tracking-widest uppercase">RSS Feed</span>
                            <ExternalLink className="w-3 h-3 text-white/60 group-hover:text-white transition-colors" />
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
                            {episodes.map((episode) => {
                                const isExpanded = expandedEpisode === episode.id;
                                const keywords = getKeywords(episode);

                                return (
                                    <div
                                        key={episode.id}
                                        className={`group relative border rounded-[20px] overflow-hidden transition-all duration-300 backdrop-blur-sm ${isExpanded
                                                ? "bg-white/[0.08] border-white/20 shadow-2xl shadow-black/50"
                                                : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/10"
                                            }`}
                                    >
                                        {/* Card Header / Summary Row */}
                                        <div
                                            className="p-6 cursor-pointer"
                                            onClick={() => toggleExpand(episode.id)}
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div className="flex items-center gap-5">
                                                    {/* Status Icon */}
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${episode.status === "ready"
                                                            ? "bg-green-500/10 border-green-500/20 text-green-400"
                                                            : episode.status === "processing"
                                                                ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                                                : "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                                                        }`}>
                                                        {episode.status === "ready" ? (
                                                            <CheckCircle className="w-5 h-5" />
                                                        ) : episode.status === "processing" ? (
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                        ) : (
                                                            <AlertCircle className="w-5 h-5" />
                                                        )}
                                                    </div>

                                                    {/* Title & Meta */}
                                                    <div>
                                                        <h3 className="text-lg font-medium text-white group-hover:text-blue-200 transition-colors tracking-wide">
                                                            {episode.title || "Untitled Episode"}
                                                        </h3>
                                                        <div className="flex items-center gap-3 text-xs text-white/40 mt-1.5 uppercase tracking-wider font-medium">
                                                            <span className="font-mono opacity-70">#{episode.id}</span>
                                                            <span className="w-1 h-1 rounded-full bg-white/20" />
                                                            <span>{new Date(episode.uploadedAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right Side Actions */}
                                                <div className="flex items-center gap-6">
                                                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${episode.status === "ready"
                                                            ? "bg-green-500/5 border-green-500/20 text-green-400"
                                                            : "bg-blue-500/5 border-blue-500/20 text-blue-400"
                                                        }`}>
                                                        {episode.status || "UNKNOWN"}
                                                    </div>

                                                    {isExpanded ? (
                                                        <ChevronUp className="w-5 h-5 text-white/40" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5 text-white/40" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {isExpanded && (
                                            <div className="border-t border-white/10 bg-black/20 p-8 animate-in slide-in-from-top-2 duration-300">
                                                <div className="grid md:grid-cols-12 gap-8">

                                                    {/* Left Column: Core Info (7 cols) */}
                                                    <div className="md:col-span-7 space-y-8">
                                                        {/* Summary Section */}
                                                        <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/5">
                                                            <h4 className="flex items-center gap-2 text-xs font-bold text-white/50 mb-4 uppercase tracking-widest">
                                                                <FileText className="w-3 h-3" /> AI Summary
                                                            </h4>
                                                            <p className="text-white/90 leading-relaxed font-light text-lg">
                                                                {episode.summary || "Generating summary..."}
                                                            </p>
                                                        </div>

                                                        {/* Description Section */}
                                                        {episode.description && (
                                                            <div>
                                                                <h4 className="flex items-center gap-2 text-xs font-bold text-white/50 mb-3 uppercase tracking-widest">
                                                                    Full Description
                                                                </h4>
                                                                <p className="text-white/60 text-sm leading-relaxed font-light">
                                                                    {episode.description}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Video Preview Link */}
                                                        {episode.videoUrl && (
                                                            <a
                                                                href={episode.videoUrl}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-2 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider"
                                                            >
                                                                <PlayCircle className="w-4 h-4" />
                                                                Watch Video File
                                                            </a>
                                                        )}
                                                    </div>

                                                    {/* Right Column: Metadata (5 cols) */}
                                                    <div className="md:col-span-5 space-y-8">
                                                        {/* Chapters */}
                                                        {episode.chapters && episode.chapters.length > 0 && (
                                                            <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/5">
                                                                <h4 className="flex items-center gap-2 text-xs font-bold text-white/50 mb-4 uppercase tracking-widest">
                                                                    <List className="w-3 h-3" /> Chapters
                                                                </h4>
                                                                <div className="space-y-4 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10">
                                                                    {episode.chapters.map((chapter, idx) => (
                                                                        <div key={idx} className="flex items-start gap-4 text-sm group/chapter relative z-10">
                                                                            <span className="font-mono text-[10px] text-blue-400 bg-blue-900/20 border border-blue-500/20 px-1.5 py-0.5 rounded min-w-[45px] text-center">
                                                                                {chapter.time}
                                                                            </span>
                                                                            <span className="text-white/70 group-hover/chapter:text-white transition-colors font-light text-sm pt-0.5">
                                                                                {chapter.title}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Keywords */}
                                                        {keywords.length > 0 && (
                                                            <div>
                                                                <h4 className="flex items-center gap-2 text-xs font-bold text-white/50 mb-3 uppercase tracking-widest">
                                                                    <Tag className="w-3 h-3" /> Keywords
                                                                </h4>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {keywords.map((keyword, idx) => (
                                                                        <span
                                                                            key={idx}
                                                                            className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-white/60 hover:bg-white/10 hover:text-white transition-colors tracking-wide"
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
                                );
                            })}

                            {episodes.length === 0 && (
                                <div className="text-center py-24 bg-white/[0.02] rounded-[30px] border border-white/[0.08] border-dashed backdrop-blur-sm">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileText className="w-6 h-6 text-white/20" />
                                    </div>
                                    <p className="text-white/40 font-light text-lg">No episodes found</p>
                                    <Link href="/admin/upload" className="text-blue-400 hover:text-blue-300 mt-2 inline-block transition-colors text-sm uppercase tracking-widest">
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
