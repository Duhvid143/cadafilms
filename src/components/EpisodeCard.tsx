import React from 'react';
import { motion } from 'framer-motion';
import { Play, Calendar } from 'lucide-react';
import { Episode } from '@/lib/episodes';
import '@/styles/EpisodeCard.css';

interface EpisodeCardProps {
    episode: Episode;
    onPlay: (episode: Episode) => void;
    index: number;
}

const EpisodeCard: React.FC<EpisodeCardProps> = ({ episode, onPlay, index }) => {
    const formattedDate = new Date(episode.processedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <motion.div
            className="episode-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <div className="episode-content">
                <div className="episode-meta">
                    <Calendar size={14} />
                    <span>{formattedDate}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.7em', opacity: 0.7 }}>[{episode.status}]</span>
                </div>

                <h3 className="episode-title">{episode.title}</h3>
                <p className="episode-summary">{episode.summary}</p>

                <div className="episode-tags">
                    {episode.keywords?.slice(0, 3).map((keyword, i) => (
                        <span key={i} className="episode-tag">#{keyword}</span>
                    ))}
                </div>

                <button className="play-button" onClick={() => onPlay(episode)}>
                    <Play size={16} fill="currentColor" />
                    <span>Watch Episode</span>
                </button>
            </div>
        </motion.div>
    );
};

export default EpisodeCard;
