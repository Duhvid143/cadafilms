import React from 'react';
import Link from 'next/link';
import '@/styles/Projects.css';

export default function Projects() {
    return (
        <div className="projects-page">
            {/* Project 1: _TIUM */}
            <Link href="/tium" className="project-split">
                <div
                    className="project-bg"
                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)' }}
                />
                <div className="project-overlay" />
                <div className="project-content">
                    <h2 className="project-title">_TIUM</h2>
                    <div className="project-desc">
                        <p>A cinematic journey through light and sound.</p>
                        <div className="project-btn">View Project</div>
                    </div>
                </div>
            </Link>

            {/* Project 2: MUIT */}
            <Link href="/muit" className="project-split">
                <div
                    className="project-bg"
                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1496715976403-7e36dc43f17b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)' }}
                />
                <div className="project-overlay" />
                <div className="project-content">
                    <h2 className="project-title">MUIT</h2>
                    <div className="project-desc">
                        <p>Exploring the boundaries of digital identity.</p>
                        <div className="project-btn">View Project</div>
                    </div>
                </div>
            </Link>
        </div>
    );
}
