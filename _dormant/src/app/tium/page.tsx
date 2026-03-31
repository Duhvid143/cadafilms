"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Article } from '@/types';
import Link from 'next/link';
import '@/styles/Work.css';

export default function Tium() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const q = query(collection(db, "articles"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                const fetchedArticles: Article[] = [];
                querySnapshot.forEach((doc) => {
                    fetchedArticles.push({ id: doc.id, ...doc.data() } as Article);
                });
                setArticles(fetchedArticles);
            } catch (error) {
                console.error("Error fetching articles:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, []);

    return (
        <div className="work-page">
            <div className="work-header">
                <motion.h1
                    className="work-title"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    TIUM_
                </motion.h1>
                <motion.p
                    className="work-subtitle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.3 }}
                >
                    Explorations in thought and design.
                </motion.p>
            </div>

            <div className="work-grid" style={{ columnCount: 1, maxWidth: '1200px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', color: '#666', marginTop: '4rem' }}>
                        Loading articles...
                    </div>
                ) : articles.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                        {articles.map((article, index) => (
                            <Link href={`/tium/${article.slug}`} key={article.id} style={{ textDecoration: 'none' }}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                                    style={{ aspectRatio: '4/3', display: 'flex', flexDirection: 'column' }}
                                >
                                    {/* Cover Image */}
                                    <div className="relative h-2/3 w-full overflow-hidden">
                                        <img
                                            src={article.coverImageUrl}
                                            alt={article.title}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                transition: 'transform 0.5s ease'
                                            }}
                                            className="group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 flex flex-col justify-end flex-grow relative">
                                        <h2 className="text-2xl font-light text-white mb-2 line-clamp-2">
                                            {article.title}
                                        </h2>
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>Read Article</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', color: '#666', marginTop: '4rem' }}>
                        No articles found.
                    </div>
                )}
            </div>
        </div>
    );
}
