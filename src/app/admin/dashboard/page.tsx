"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
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

    useEffect(() => {
        const q = query(collection(db, "episodes"));
        // Note: If you have a timestamp field, you can add orderBy("uploadedAt", "desc")
        // But for now, let's just fetch all and sort client-side if needed or rely on default order

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const episodesData: Episode[] = [];
            snapshot.forEach((doc) => {
                episodesData.push({ id: doc.id, ...doc.data() } as Episode);
            });
            // Sort by uploadedAt desc if possible
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

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white/20">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-48 pb-12">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                    <div>
                        <Link
                            href="/admin/upload"
                            className="inline-flex items-center text-sm text-white/40 hover:text-white transition-colors mb-4 group"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Upload
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white mb-2">
                            Dashboard
                        </h1>
                        <p className="text-white/40 font-light text-lg">
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
                </header>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {episodes.map((episode) => (
                            <div
                                key={episode.id}
                                className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/[0.07] transition-all duration-300"
                            >
                                <div
                                    className="p-6 cursor-pointer"
                                    onClick={() => toggleExpand(episode.id)}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
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
                                                <h3 className="text-xl font-light text-white group-hover:text-blue-200 transition-colors">
                                                    {episode.title || "Untitled Episode"}
                                                </h3>
                                                <div className="flex items-center gap-3 text-sm text-white/40 mt-1">
                                                    <span className="font-mono text-xs opacity-60">ID: {episode.id}</span>
                                                    <span>•</span>
                                                    <span>{new Date(episode.uploadedAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${episode.status === "ready"
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
                                    <div className="border-t border-white/5 bg-black/20 p-6 animate-in slide-in-from-top-2 duration-200">
                                        <div className="grid md:grid-cols-2 gap-8">
                                            {/* Left Column: Summary & Description */}
                                            <div className="space-y-6">
                                                <div>
                                                    <h4 className="flex items-center gap-2 text-sm font-medium text-white/60 mb-3 uppercase tracking-wider">
                                                        <FileText className="w-4 h-4" /> Summary
                                                    </h4>
                                                    <p className="text-white/80 leading-relaxed font-light">
                                                        {episode.summary || "No summary available yet."}
                                                    </p>
                                                </div>

                                                {episode.description && (
                                                    <div>
                                                        <h4 className="flex items-center gap-2 text-sm font-medium text-white/60 mb-3 uppercase tracking-wider">
                                                            Description
                                                        </h4>
                                                        <p className="text-white/60 text-sm leading-relaxed font-light">
                                                            {episode.description}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right Column: Chapters & Keywords */}
                                            <div className="space-y-6">
                                                {episode.chapters && episode.chapters.length > 0 && (
                                                    <div>
                                                        <h4 className="flex items-center gap-2 text-sm font-medium text-white/60 mb-3 uppercase tracking-wider">
                                                            <List className="w-4 h-4" /> Chapters
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {episode.chapters.map((chapter, idx) => (
                                                                <div key={idx} className="flex items-start gap-3 text-sm group/chapter">
                                                                    <span className="font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded text-xs">
                                                                        {chapter.time}
                                                                    </span>
                                                                    <span className="text-white/70 group-hover/chapter:text-white transition-colors">
                                                                        {chapter.title}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {episode.keywords && episode.keywords.length > 0 && (
                                                    <div>
                                                        <h4 className="flex items-center gap-2 text-sm font-medium text-white/60 mb-3 uppercase tracking-wider">
                                                            <Tag className="w-4 h-4" /> Keywords
                                                        </h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {episode.keywords.map((keyword, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60 hover:bg-white/10 hover:text-white transition-colors"
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
                            <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 border-dashed">
                                <p className="text-white/40 font-light">No episodes found. Upload one to get started.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
