"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Article } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export default function ArticleView({ article }: { article: Article }) {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    return (
        <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-[#050505] text-white' : 'bg-[#f4f4f4] text-black'} pb-32`}>

            <div className="pt-32 px-6 md:px-12 max-w-[1400px] mx-auto">
                {/* Toolbar */}
                <div className="flex justify-between items-center mb-8">
                    <Link
                        href="/tium"
                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 group ${isDarkMode
                                ? 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
                                : 'bg-gray-200 text-gray-600 hover:text-black hover:bg-gray-300'
                            }`}
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium text-sm">Back</span>
                    </Link>

                    <button
                        onClick={toggleTheme}
                        className={`p-2.5 rounded-full transition-all duration-300 ${isDarkMode
                                ? 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
                                : 'bg-gray-200 text-gray-600 hover:text-black hover:bg-gray-300'
                            }`}
                        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDarkMode ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                        )}
                    </button>
                </div>

                {/* Hero Image */}
                <div className="relative w-full aspect-[21/9] md:h-[60vh] rounded-3xl overflow-hidden shadow-2xl">
                    <Image
                        src={article.coverImageUrl}
                        alt={article.title}
                        fill
                        className="object-cover object-center"
                        priority
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t transition-colors duration-500 ${isDarkMode
                            ? 'from-[#050505] via-transparent to-black/20'
                            : 'from-[#000000]/60 via-transparent to-black/10'
                        }`} />

                    <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
                        {!article.hideTitleOverlay ? (
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-3xl md:text-7xl font-serif mb-6 leading-tight text-white drop-shadow-lg"
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
                            className="flex items-center gap-3 text-sm md:text-base font-medium tracking-wide uppercase text-gray-300"
                        >
                            <span>{new Date(article.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            <span className="opacity-50">&bull;</span>
                            <span>By {article.author || "TIUM_"}</span>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="max-w-[720px] mx-auto px-6 mt-16 md:mt-24"
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
