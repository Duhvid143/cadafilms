"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { getEpisodes, Episode } from '@/lib/episodes';
import EpisodeCard from '@/components/EpisodeCard';
import VideoPlayer from '@/components/VideoPlayer';
import '@/styles/Work.css'; // Reuse work styles for layout

export default function Muit() {
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getEpisodes();
            setEpisodes(data);
            setLoading(false);
        };
        fetchData();
    }, []);

    const handlePlay = (episode: Episode) => {
        setSelectedEpisode(episode);
    };

    const closePlayer = () => {
        setSelectedEpisode(null);
    };

    return (
        <div className="work-page">
            <div className="work-header">
                <motion.h1
                    className="work-title"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    MUIT
                </motion.h1>
                <motion.p
                    className="work-subtitle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.3 }}
                >
                    Conversations on the edge of tomorrow.
                </motion.p>
            </div>

            <div className="work-grid" style={{ columnCount: 1, maxWidth: '1000px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', color: '#666', marginTop: '4rem' }}>
                        Loading episodes...
                    </div>
                ) : episodes.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                        {episodes.map((episode, index) => (
                            <EpisodeCard
                                key={episode.id}
                                episode={episode}
                                index={index}
                                onPlay={handlePlay}
                            />
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', color: '#666', marginTop: '4rem' }}>
                        No episodes found. Check back soon.
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selectedEpisode && (
                    <motion.div
                        className="video-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closePlayer}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'rgba(0,0,0,0.9)',
                            zIndex: 2000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2rem'
                        }}
                    >
                        <motion.div
                            className="video-modal-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                width: '100%',
                                maxWidth: '1000px',
                                position: 'relative'
                            }}
                        >
                            <button
                                onClick={closePlayer}
                                style={{
                                    position: 'absolute',
                                    top: '-40px',
                                    right: 0,
                                    background: 'none',
                                    border: 'none',
                                    color: '#fff',
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={24} />
                            </button>

                            <VideoPlayer src={selectedEpisode.videoUrl} autoPlay />

                            <div style={{ marginTop: '1.5rem', color: '#fff' }}>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{selectedEpisode.title}</h2>
                                <p style={{ color: '#aaa', lineHeight: '1.6' }}>{selectedEpisode.description}</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
