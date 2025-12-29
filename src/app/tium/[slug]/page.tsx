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
        <div className="min-h-screen bg-[#050505] text-white pb-20">
            {/* Hero Image */}
            <div className="relative w-full h-[25vh] md:h-[60vh] overflow-hidden">
                <img
                    src={article.coverImageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/30" />

                <div className="absolute top-8 left-8 z-10">
                    <Link href="/tium" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/60 backdrop-blur-md px-4 py-2 rounded-full">
                        <ArrowLeft size={20} />
                        <span>Back</span>
                    </Link>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 max-w-5xl mx-auto">
                    {!article.hideTitleOverlay && (
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-light mb-4 text-white leading-tight"
                        >
                            {article.title}
                        </motion.h1>
                    )}
                    {article.hideTitleOverlay && <h1 className="sr-only">{article.title}</h1>}

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-4 text-gray-400 text-sm md:text-base"
                    >
                        <span>{new Date(article.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        <span>•</span>
                        <span>By {article.author || "TIUM_"}</span>
                    </motion.div>
                </div>
            </div>

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="max-w-3xl mx-auto px-6 md:px-0 mt-12"
            >
                <article className="prose prose-invert prose-lg max-w-none">
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', color: '#e0e0e0', fontSize: '1.1rem' }}>
                        {article.content}
                    </div>
                </article>
            </motion.div>
        </div>
    );
}
