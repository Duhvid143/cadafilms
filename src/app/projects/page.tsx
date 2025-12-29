import React from 'react';
import Link from 'next/link';
import '@/styles/Projects.css';

export default function Projects() {
    return (
        <div className="projects-page">
            {/* Project 1: _TIUM */}
            {/* Project 1: _TIUM */}
            <Link href="/tium" className="project-split">
                <div
                    className="project-bg"
                    style={{ backgroundImage: 'url(/assets/tium-cover.png)' }}
                />
                <div className="project-overlay" />
                <div className="project-content">
                    {/* <h2 className="project-title">_TIUM</h2> */}
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
                    style={{ backgroundImage: 'url(/assets/muit-new.jpg)' }}
                />
                <div className="project-overlay" />
                <div className="project-content">
                    {/* <h2 className="project-title">MUIT</h2> */}
                    <div className="project-desc">
                        <p>Exploring the boundaries of digital identity.</p>
                        <div className="project-btn">View Project</div>
                    </div>
                </div>
            </Link>
        </div>
    );
}
