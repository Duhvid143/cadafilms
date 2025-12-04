"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    ExternalLink,
    FileText,
    List,
    Tag,
    CheckCircle,
    AlertCircle,
    Loader2,
    ChevronDown,
    ChevronUp,
    PlayCircle,
    Plus,
    Copy,
    Youtube,
    Twitter
} from "lucide-react";
import { toast } from "sonner";

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
        if (typeof ep.keywords === 'string') {
            // Try splitting by comma first
            if (ep.keywords.includes(',')) {
                return ep.keywords.split(',').map(s => s.trim());
            }
            // If no commas, try splitting by newlines or just return as single item
            return [ep.keywords];
        }
        return [];
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`Copied ${label} to clipboard`);
    };

    const copyYouTubeData = (ep: Episode) => {
        let content = `${ep.title}\n\n${ep.description || ep.summary}\n\n`;
        if (ep.chapters && ep.chapters.length > 0) {
            content += `Chapters:\n${ep.chapters.map(c => `${c.time} ${c.title}`).join('\n')}`;
        }
        copyToClipboard(content, "YouTube Data");
    };

    const copyXPost = (ep: Episode) => {
        const content = `New Episode: ${ep.title}\n\n${ep.summary}\n\n#${getKeywords(ep).slice(0, 3).join(' #')}`;
        copyToClipboard(content, "X Post");
    };

    const styles = {
        page: {
            backgroundColor: '#09090b', // zinc-950
            minHeight: '100vh',
            paddingTop: '220px',
            paddingBottom: '8rem',
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            width: '100%',
            fontFamily: 'var(--font-sans)', // Assuming standard font var
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
            marginBottom: '4rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
        },
        title: {
            fontSize: '3.5rem',
            fontWeight: 200,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.2rem',
            marginBottom: '0.5rem',
            color: '#ffffff'
        },
        subtitle: {
            color: '#a1a1aa', // zinc-400
            fontSize: '1.1rem',
            fontWeight: 300,
        },
        contentContainer: {
            width: '100%',
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '2rem'
        },
        // Premium Glass Card
        card: {
            backgroundColor: 'rgba(24, 24, 27, 0.6)', // zinc-950 @ 60%
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid #27272a', // zinc-800
            borderRadius: '24px',
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative' as const,
        },
        cardHover: {
            borderColor: '#52525b', // zinc-600
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)'
        },
        // FAB
        fab: {
            position: 'fixed' as const,
            bottom: '40px',
            right: '40px',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            color: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 30px rgba(255,255,255,0.2)',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            zIndex: 50
        },
        copyButton: {
            backgroundColor: '#3f3f46', // zinc-700
            color: '#ffffff',
            border: '1px solid #71717a', // zinc-500
            borderRadius: '9999px',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
        },
        headerStack: {
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'flex-start',
            gap: '16px'
        },
        actionButtonsContainer: {
            position: 'absolute' as const,
            top: '24px',
            right: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 20
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                {/* Header */}
                <div style={styles.header}>
                    <div>
                        {/* <Link
                            href="/admin/upload"
                            className="inline-flex items-center text-xs font-medium text-zinc-500 hover:text-white transition-colors mb-6 group uppercase tracking-widest"
                        >
                            <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Upload
                        </Link> */}
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
                            className="flex items-center gap-2 px-6 py-3 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-full backdrop-blur-md transition-all group"
                        >
                            <span className="text-xs font-medium tracking-widest uppercase text-zinc-300 group-hover:text-white">RSS Feed</span>
                            <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-white transition-colors" />
                        </a>
                    </div>
                </div>

                {/* Content */}
                <div style={styles.contentContainer}>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-96 gap-4">
                            <Loader2 className="w-8 h-8 text-zinc-600 animate-spin" />
                            <p className="text-zinc-500 font-light tracking-wide">Loading episodes...</p>
                        </div>
                    ) : (
                        <>
                            {episodes.map((episode) => {
                                const isExpanded = expandedEpisode === episode.id;
                                const keywords = getKeywords(episode);
                                const isProcessing = episode.status === "processing";

                                return (
                                    <div
                                        key={episode.id}
                                        className="group/card"
                                        style={styles.card}
                                        onMouseEnter={(e) => {
                                            Object.assign(e.currentTarget.style, styles.cardHover);
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = '#27272a';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        {/* Hover Action Bar */}
                                        <div
                                            style={styles.actionButtonsContainer}
                                            className="opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"
                                        >
                                            <button
                                                onClick={(e) => { e.stopPropagation(); copyYouTubeData(episode); }}
                                                style={styles.copyButton}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#52525b'} // zinc-600
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3f3f46'} // zinc-700
                                            >
                                                <Youtube className="w-3 h-3" /> Copy YouTube
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); copyXPost(episode); }}
                                                style={styles.copyButton}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#52525b'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3f3f46'}
                                            >
                                                <Twitter className="w-3 h-3" /> Copy X
                                            </button>
                                        </div>

                                        {/* Card Header */}
                                        <div
                                            className="p-8 cursor-pointer relative z-10"
                                            onClick={() => toggleExpand(episode.id)}
                                        >
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                                <div style={styles.headerStack}>
                                                    {/* Status Badge */}
                                                    <div className={`px-4 py-1.5 rounded-full flex items-center gap-2 border ${episode.status === "ready"
                                                        ? "bg-emerald-400/[0.15] border-emerald-400/20 text-emerald-400"
                                                        : isProcessing
                                                            ? "bg-amber-400/[0.15] border-amber-400/20 text-amber-400"
                                                            : "bg-red-400/[0.15] border-red-400/20 text-red-400"
                                                        }`}>
                                                        {isProcessing && (
                                                            <span className="relative flex h-2 w-2">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                                                            </span>
                                                        )}
                                                        {!isProcessing && (
                                                            <div className={`w-2 h-2 rounded-full ${episode.status === "ready" ? "bg-emerald-400" : "bg-red-400"}`} />
                                                        )}
                                                        <span className="text-xs font-bold uppercase tracking-widest">
                                                            {episode.status || "UNKNOWN"}
                                                        </span>
                                                    </div>

                                                    {/* Title & Meta */}
                                                    <div>
                                                        <h3 className="text-3xl font-light text-zinc-100 tracking-tight leading-tight mb-3">
                                                            {episode.title || "Untitled Episode"}
                                                        </h3>
                                                        <div className="flex items-center gap-3 text-sm text-zinc-500 font-medium">
                                                            <span className="font-mono">#{episode.id}</span>
                                                            <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                                            <span>{new Date(episode.uploadedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Expand Icon */}
                                                <div className="mt-2 text-zinc-500 group-hover/card:text-zinc-300 transition-colors">
                                                    {isExpanded ? <ChevronUp /> : <ChevronDown />}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Content */}
                                        {isExpanded && (
                                            <div className="border-t border-zinc-800/50 bg-black/20 p-8 animate-in slide-in-from-top-4 duration-500">
                                                <div className="grid md:grid-cols-2 gap-8">
                                                    {/* Left Column */}
                                                    <div className="space-y-10">
                                                        <div>
                                                            <h4 className="flex items-center gap-2 text-xs font-bold text-zinc-400 mb-4 uppercase tracking-widest">
                                                                <FileText className="w-3 h-3" /> AI Summary
                                                            </h4>
                                                            <p className="text-zinc-200 leading-[1.8] text-lg font-light">
                                                                {episode.summary || "Generating summary..."}
                                                            </p>
                                                        </div>

                                                        {episode.description && (
                                                            <div>
                                                                <h4 className="flex items-center gap-2 text-xs font-bold text-zinc-400 mb-4 uppercase tracking-widest">
                                                                    Full Description
                                                                </h4>
                                                                <p className="text-zinc-400 text-sm leading-[1.7]">
                                                                    {episode.description}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {episode.videoUrl && (
                                                            <a
                                                                href={episode.videoUrl}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest border-b border-zinc-800 pb-1 hover:border-white"
                                                            >
                                                                <PlayCircle className="w-4 h-4" />
                                                                Watch Source Video
                                                            </a>
                                                        )}
                                                    </div>

                                                    {/* Right Column */}
                                                    <div className="space-y-10">
                                                        {/* Chapters */}
                                                        {episode.chapters && episode.chapters.length > 0 && (
                                                            <div>
                                                                <h4 className="flex items-center gap-2 text-xs font-bold text-zinc-400 mb-6 uppercase tracking-widest">
                                                                    <List className="w-3 h-3" /> Chapters
                                                                </h4>
                                                                <div className="space-y-0 relative border-l border-zinc-800 ml-2 pl-6">
                                                                    {episode.chapters.map((chapter, idx) => (
                                                                        <div key={idx} className="relative py-3 group/chapter">
                                                                            <div className="absolute -left-[29px] top-5 w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover/chapter:bg-zinc-500 transition-colors" />
                                                                            <div className="flex items-baseline gap-4">
                                                                                <span className="font-mono text-xs text-zinc-500 w-12 shrink-0">
                                                                                    {chapter.time}
                                                                                </span>
                                                                                <span className="text-zinc-300 text-sm font-light group-hover/chapter:text-white transition-colors">
                                                                                    {chapter.title}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Keywords */}
                                                        {keywords.length > 0 && (
                                                            <div>
                                                                <h4 className="flex items-center gap-2 text-xs font-bold text-zinc-400 mb-4 uppercase tracking-widest">
                                                                    <Tag className="w-3 h-3" /> Keywords
                                                                </h4>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {keywords.map((keyword, idx) => (
                                                                        <span
                                                                            key={idx}
                                                                            className="px-3 py-1.5 rounded-md bg-zinc-900/50 border border-zinc-800 text-xs text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-all"
                                                                        >
                                                                            #{keyword}
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
                                <div className="flex flex-col items-center justify-center py-32 text-center">
                                    <div className="w-24 h-24 bg-zinc-900/50 rounded-full flex items-center justify-center mb-8 border border-zinc-800">
                                        <FileText className="w-8 h-8 text-zinc-600" />
                                    </div>
                                    <h3 className="text-2xl font-light text-zinc-200 mb-2">No episodes yet</h3>
                                    <p className="text-zinc-500 font-light">Drop your first episode to get started</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* FAB */}
            <Link
                href="/admin/upload"
                style={styles.fab}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                <Plus className="w-8 h-8" />
            </Link>
        </div>
    );
}
