"use client";

import { useEffect, useState, Suspense } from "react";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    ExternalLink,
    FileText,
    List,
    Tag,
    Loader2,
    ChevronDown,
    ChevronUp,
    PlayCircle,
    Plus,
    Youtube,
    Twitter,
    LogOut,
    Mic,
    Trash2,
    Eye
} from "lucide-react";
import { toast } from "sonner";
import AdminAuthGuard from "@/components/AdminAuthGuard";

import { Episode, Article } from "@/types";

type ViewType = 'podcast' | 'article';

function DashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // -- State --
    const [viewType, setViewType] = useState<ViewType>('podcast');
    const [loading, setLoading] = useState(true);

    // Podcast State
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [expandedEpisode, setExpandedEpisode] = useState<string | null>(null);

    // Article State
    const [articles, setArticles] = useState<Article[]>([]);

    useEffect(() => {
        const typeParam = searchParams.get('type');
        if (typeParam === 'article') {
            setViewType('article');
        } else {
            setViewType('podcast');
        }
    }, [searchParams]);

    // Update URL when toggling
    const handleTypeChange = (type: ViewType) => {
        setViewType(type);
        const newUrl = `/admin/dashboard?type=${type}`;
        window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
    };

    // -- Fetch Data --
    useEffect(() => {
        setLoading(true);

        // Subscribe to Episodes
        const qEpisodes = query(collection(db, "episodes"));
        const unsubEpisodes = onSnapshot(qEpisodes, (snapshot) => {
            const episodesData: Episode[] = [];
            snapshot.forEach((doc) => {
                episodesData.push({ id: doc.id, ...doc.data() } as Episode);
            });
            episodesData.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
            setEpisodes(episodesData);
            if (viewType === 'podcast') setLoading(false);
        });

        // Subscribe to Articles
        const qArticles = query(collection(db, "articles"));
        const unsubArticles = onSnapshot(qArticles, (snapshot) => {
            const articlesData: Article[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                articlesData.push({ id: doc.id, ...data } as Article);
            });
            articlesData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setArticles(articlesData);
            if (viewType === 'article') setLoading(false);
        });

        return () => {
            unsubEpisodes();
            unsubArticles();
        };
    }, []); // Run subscriptions once, filtering visual loading state based on viewType

    // Effect to update loading state when viewType changes (instant if data already there)
    useEffect(() => {
        // Just a small timeout to simulate switch or strictly controlled by data presence
        setLoading(false);
    }, [viewType, episodes, articles]);


    const handleLogout = async () => {
        try {
            await auth.signOut();
            toast.success("Logged out successfully");
            router.push("/admin/login");
        } catch (error) {
            toast.error("Error logging out");
        }
    };

    // -- Podcast Helpers --
    const toggleExpand = (id: string) => {
        setExpandedEpisode(expandedEpisode === id ? null : id);
    };

    const getKeywords = (ep: Episode): string[] => {
        if (Array.isArray(ep.keywords)) return ep.keywords;
        if (typeof ep.keywords === 'string') {
            if (ep.keywords.includes(',')) {
                return ep.keywords.split(',').map(s => s.trim());
            }
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

    // -- Article Helpers --
    const deleteArticle = async (id: string) => {
        if (!confirm("Are you sure you want to delete this article? This cannot be undone.")) return;
        try {
            await deleteDoc(doc(db, "articles", id));
            toast.success("Article deleted");
        } catch (error: any) {
            toast.error("Failed to delete article: " + error.message);
        }
    };

    const styles = {
        page: {
            backgroundColor: '#09090b',
            minHeight: '100vh',
            paddingTop: '180px',
            paddingBottom: '8rem',
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            width: '100%',
            fontFamily: 'var(--font-sans)',
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
            color: '#ffffff',
            lineHeight: 1
        },
        subtitle: {
            color: '#a1a1aa',
            fontSize: '1.1rem',
            fontWeight: 300,
        },
        contentContainer: {
            width: '100%',
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '2rem'
        },
        card: {
            backgroundColor: 'rgba(24, 24, 27, 0.6)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid #27272a',
            borderRadius: '24px',
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative' as const,
        },
        cardHover: {
            borderColor: '#52525b',
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)'
        },
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
            backgroundColor: '#3f3f46',
            color: '#ffffff',
            border: '1px solid #71717a',
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
        toggleContainer: {
            display: 'inline-flex',
            gap: '1rem',
            marginBottom: '1rem',
            padding: '4px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '9999px',
            border: '1px solid rgba(255,255,255,0.1)'
        },
        toggleBtn: (isActive: boolean) => ({
            padding: '8px 24px',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: 600,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            background: isActive ? '#ffffff' : 'transparent',
            color: isActive ? '#000000' : 'rgba(255,255,255,0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        }),
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.title}>
                            Dashboard
                        </h1>
                        <div style={styles.toggleContainer}>
                            <button
                                onClick={() => handleTypeChange('podcast')}
                                style={styles.toggleBtn(viewType === 'podcast')}
                            >
                                <Mic size={16} />
                                Podcasts
                            </button>
                            <button
                                onClick={() => handleTypeChange('article')}
                                style={styles.toggleBtn(viewType === 'article')}
                            >
                                <FileText size={16} />
                                Articles
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <a
                            href={`https://firebasestorage.googleapis.com/v0/b/cada-f5b39.firebasestorage.app/o/public%2Ffeed.xml?alt=media&t=${new Date().getTime()}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-6 py-3 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-full backdrop-blur-md transition-all group"
                        >
                            <span className="text-xs font-medium tracking-widest uppercase text-zinc-300 group-hover:text-white">RSS Feed</span>
                            <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-white transition-colors" />
                        </a>

                        <button
                            onClick={handleLogout}
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(10px)',
                                padding: '12px 24px',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                outline: 'none'
                            }}
                            onMouseEnter={(e) => Object.assign(e.currentTarget.style, { background: 'rgba(255,255,255,0.15)', color: '#fff' })}
                            onMouseLeave={(e) => Object.assign(e.currentTarget.style, { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.8)' })}
                        >
                            <span>Logout</span>
                            <LogOut size={14} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div style={styles.contentContainer}>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-96 gap-4">
                            <Loader2 className="w-8 h-8 text-zinc-600 animate-spin" />
                            <p className="text-zinc-500 font-light tracking-wide">Loading...</p>
                        </div>
                    ) : (
                        <>
                            {/* ==================== PODCAST VIEW ==================== */}
                            {viewType === 'podcast' && (
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
                                                onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.cardHover)}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = '#27272a';
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                {/* Hover Action Bar */}
                                                <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-20">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); copyYouTubeData(episode); }}
                                                        style={styles.copyButton}
                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#52525b'}
                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3f3f46'}
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
                                                <div style={{ padding: '40px', cursor: 'pointer', position: 'relative', zIndex: 10 }} onClick={() => toggleExpand(episode.id)}>
                                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                                        <div className="flex flex-col items-start gap-4">
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
                                                                <span className="text-xs font-bold capitalize tracking-wide">
                                                                    {episode.status || "Unknown"}
                                                                </span>
                                                            </div>

                                                            {/* Title & Meta */}
                                                            <div>
                                                                <h3 className="text-3xl font-light text-zinc-100 tracking-tight leading-tight mb-3">
                                                                    {episode.title || "Untitled Episode"}
                                                                </h3>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.875rem', color: '#71717a', fontWeight: 500 }}>
                                                                    <span className="font-mono text-zinc-400">#{episode.id}</span>
                                                                    <span style={{ width: '1px', height: '12px', backgroundColor: '#3f3f46' }} />
                                                                    <span>{new Date(episode.uploadedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="mt-2 text-zinc-500 group-hover/card:text-zinc-300 transition-colors">
                                                            {isExpanded ? <ChevronUp /> : <ChevronDown />}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Expanded Content */}
                                                {isExpanded && (
                                                    <div className="border-t border-zinc-800/50 bg-black/20 animate-in slide-in-from-top-4 duration-500" style={{ padding: '40px' }}>
                                                        <div className="grid md:grid-cols-2 gap-8">
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
                                                                        <h4 className="flex items-center gap-2 text-xs font-bold text-zinc-400 mb-4 uppercase tracking-widest">Full Description</h4>
                                                                        <p className="text-zinc-400 text-sm leading-[1.7]">{episode.description}</p>
                                                                    </div>
                                                                )}
                                                                {episode.videoUrl && (
                                                                    <a href={episode.videoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest border-b border-zinc-800 pb-1 hover:border-white">
                                                                        <PlayCircle className="w-4 h-4" /> Watch Source Video
                                                                    </a>
                                                                )}
                                                            </div>

                                                            <div className="space-y-10">
                                                                {episode.chapters && episode.chapters.length > 0 && (
                                                                    <div>
                                                                        <h4 className="flex items-center gap-2 text-xs font-bold text-zinc-400 mb-6 uppercase tracking-widest"><List className="w-3 h-3" /> Chapters</h4>
                                                                        <div className="space-y-0 relative border-l border-zinc-800 ml-2 pl-6">
                                                                            {episode.chapters.map((chapter, idx) => (
                                                                                <div key={idx} className="relative py-3 group/chapter">
                                                                                    <div className="absolute -left-[29px] top-5 w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover/chapter:bg-zinc-500 transition-colors" />
                                                                                    <div className="flex items-baseline gap-4">
                                                                                        <span className="font-mono text-xs text-zinc-500 w-12 shrink-0">{chapter.time}</span>
                                                                                        <span className="text-zinc-300 text-sm font-light group-hover/chapter:text-white transition-colors">{chapter.title}</span>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {keywords.length > 0 && (
                                                                    <div>
                                                                        <h4 className="flex items-center gap-2 text-xs font-bold text-zinc-400 mb-4 uppercase tracking-widest"><Tag className="w-3 h-3" /> Keywords</h4>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {keywords.map((keyword, idx) => (
                                                                                <span key={idx} className="px-3 py-1.5 rounded-md bg-zinc-900/50 border border-zinc-800 text-xs text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-all">#{keyword}</span>
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
                                                <Mic className="w-8 h-8 text-zinc-600" />
                                            </div>
                                            <h3 className="text-2xl font-light text-zinc-200 mb-2">No episodes yet</h3>
                                            <p className="text-zinc-500 font-light">Upload your first podcast episode</p>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* ==================== ARTICLE VIEW ==================== */}
                            {viewType === 'article' && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                                        {articles.map((article) => (
                                            <div
                                                key={article.id}
                                                className="group relative flex flex-col overflow-hidden rounded-3xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-all hover:-translate-y-1 hover:shadow-2xl"
                                            >
                                                {/* Image */}
                                                <div className="aspect-[4/3] w-full relative overflow-hidden bg-zinc-900">
                                                    <img
                                                        src={article.coverImageUrl}
                                                        alt={article.title}
                                                        className="object-cover w-full h-full opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                                                    {/* Actions Overlay */}
                                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Link
                                                            href={`/tium/${article.slug}`}
                                                            target="_blank"
                                                            className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors"
                                                            title="View Public Page"
                                                        >
                                                            <Eye size={16} />
                                                        </Link>
                                                        <button
                                                            onClick={() => deleteArticle(article.id)}
                                                            className="p-2 bg-red-500/10 hover:bg-red-500/20 backdrop-blur-md rounded-full text-red-500 transition-colors"
                                                            title="Delete Article"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="p-6 flex flex-col flex-1">
                                                    <h3 className="text-xl font-light text-white mb-2 line-clamp-2">
                                                        {article.title}
                                                    </h3>
                                                    <div className="mt-auto pt-4 flex items-center justify-between text-xs text-zinc-500 font-mono uppercase tracking-wider">
                                                        <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                                                        {/* <span>{article.slug}</span> */}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {articles.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-32 text-center w-full">
                                            <div className="w-24 h-24 bg-zinc-900/50 rounded-full flex items-center justify-center mb-8 border border-zinc-800">
                                                <FileText className="w-8 h-8 text-zinc-600" />
                                            </div>
                                            <h3 className="text-2xl font-light text-zinc-200 mb-2">No articles yet</h3>
                                            <p className="text-zinc-500 font-light">Publish your first article for TIUM</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* FAB - Links to correct Upload type */}
            <Link
                href={{ pathname: '/admin/upload', query: { type: viewType } }}
                style={styles.fab}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                <Plus className="w-8 h-8" />
            </Link>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <AdminAuthGuard>
            <Suspense fallback={
                <div className="flex flex-col items-center justify-center h-screen bg-[#09090b]">
                    <Loader2 className="w-8 h-8 text-zinc-600 animate-spin" />
                </div>
            }>
                <DashboardContent />
            </Suspense>
        </AdminAuthGuard>
    );
}
