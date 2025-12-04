import React, { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import '@/styles/VideoPlayer.css';

interface VideoPlayerProps {
    src: string;
    poster?: string;
    autoPlay?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster, autoPlay = false }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(progress);
        }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (videoRef.current) {
            const progressBar = e.currentTarget;
            const rect = progressBar.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = (x / rect.width);
            videoRef.current.currentTime = percentage * videoRef.current.duration;
        }
    };

    const toggleFullscreen = () => {
        if (videoRef.current) {
            if (videoRef.current.requestFullscreen) {
                videoRef.current.requestFullscreen();
            }
        }
    };

    return (
        <div className="video-player-container">
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                className="video-element"
                onTimeUpdate={handleTimeUpdate}
                onClick={togglePlay}
                autoPlay={autoPlay}
                playsInline
            />

            <div className="video-controls">
                <div className="progress-bar-container" onClick={handleSeek}>
                    <div className="progress-bar" style={{ width: `${progress}%` }} />
                </div>

                <div className="controls-row">
                    <button onClick={togglePlay} className="control-btn">
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>

                    <div className="right-controls">
                        <button onClick={toggleMute} className="control-btn">
                            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>
                        <button onClick={toggleFullscreen} className="control-btn">
                            <Maximize size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
