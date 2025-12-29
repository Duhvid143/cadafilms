"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Article } from '@/types';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import '@/styles/Work.css'; // Reusing work styles

export default function ArticlePage({ params }: { params: { slug: string } }) {
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const q = query(collection(db, "articles"), where("slug", "==", params.slug));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const doc = querySnapshot.docs[0];
                    setArticle({ id: doc.id, ...doc.data() } as Article);
                } else {
                    console.log("No such article!");
                }
            } catch (error) {
                console.error("Error fetching article:", error);
            } finally {
                setLoading(false);
            }
        };

        if (params.slug) {
            fetchArticle();
        }
    }, [params.slug]);

    const [isDarkMode, setIsDarkMode] = useState(true);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
                Loading...
            </div>
        );
    }

    if (!article) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center gap-4">
                <h1 className="text-2xl">Article not found</h1>
                <Link href="/tium" className="text-gray-400 hover:text-white underline">Back to TIUM_</Link>
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-[#050505] text-white' : 'bg-[#f4f4f4] text-black'} pb-32`}>
            {/* Navigation Bar */}
            <div className="fixed top-0 left-0 w-full z-50 px-6 py-6 flex justify-between items-start pointer-events-none">
                <Link
                    href="/tium"
                    className={`pointer-events-auto flex items-center gap-2 px-5 py-3 rounded-full backdrop-blur-md transition-all duration-300 group shadow-lg ${isDarkMode
                            ? 'bg-black/40 text-white hover:bg-black/60 border border-white/10'
                            : 'bg-white/40 text-black hover:bg-white/60 border border-black/5'
                        }`}
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium tracking-wide text-sm">Back</span>
                </Link>

                <button
                    onClick={toggleTheme}
                    className={`pointer-events-auto p-3 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg ${isDarkMode
                            ? 'bg-black/40 text-white hover:bg-white/10 border border-white/10'
                            : 'bg-white/40 text-black hover:bg-black/5 border border-black/5'
                        }`}
                    title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    {isDarkMode ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                    )}
                </button>
            </div>

            {/* Hero Image */}
            <div className="relative w-full h-[35vh] md:h-[65vh] overflow-hidden">
                <img
                    src={article.coverImageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover object-center"
                />
                <div className={`absolute inset-0 bg-gradient-to-t transition-colors duration-500 ${isDarkMode
                        ? 'from-[#050505] via-transparent to-black/40'
                        : 'from-[#f4f4f4] via-transparent to-black/10'
                    }`} />

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-16 max-w-4xl mx-auto">
                    {!article.hideTitleOverlay ? (
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`text-3xl md:text-6xl font-serif mb-6 leading-tight ${isDarkMode ? 'text-white' : 'text-black'}`}
                        >
                            {article.title}
                        </motion.h1>
                    ) : (
                        <h1 className="sr-only">{article.title}</h1>
                    )}

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className={`flex items-center gap-3 text-sm md:text-base font-medium tracking-wide uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                        <span>{new Date(article.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        <span className="opacity-50">•</span>
                        <span>By {article.author || "TIUM_"}</span>
                    </motion.div>
                </div>
            </div>

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="max-w-[680px] mx-auto px-6 mt-16 md:mt-24"
            >
                <article className={`prose max-w-none ${isDarkMode ? 'prose-invert' : ''}`}>
                    <div style={{
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.8',
                        fontSize: '1.25rem',
                        fontFamily: '"Times New Roman", Times, serif',
                        color: isDarkMode ? '#d1d1d1' : '#1a1a1a'
                    }}>
                        {article.content}
                    </div>
                </article>
            </motion.div>
        </div>
    );
}
