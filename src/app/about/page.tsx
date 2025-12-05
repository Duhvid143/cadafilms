"use client";
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import '@/styles/About.css';

export default function About() {
    useEffect(() => {
        gsap.from('.founder-card', {
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power2.out',
            delay: 0.5 // Wait for page transition
        });
    }, []);

    return (
        <div className="about-page">
            <div className="about-hero">
                <motion.h1
                    className="about-title"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    Our Story
                </motion.h1>
                <motion.p
                    className="about-mission"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    CADA is a creative studio founded by Cam Cooper and David Lannon.
                    <br /><br />
                    We don’t confine ourselves to a single medium. We make whatever the idea demands to exist—films, podcasts, installations, objects, editorials, experiences, or forms that haven’t been named yet. The only constants are craft, authenticity, and stories that actually matter.
                </motion.p>
            </div>

            <section className="about-section">
                <motion.h2
                    className="section-header"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    The Core
                </motion.h2>
                <div className="values-grid">
                    {[
                        { title: "_TIUM", desc: "A broken clock that still keeps perfect time. A sharp, unfiltered take on culture, politics, and the forces fracturing the world right now. No sponsors. No script approval. No filter." },
                        { title: "MUIT", desc: "Our video podcast. Raw, long-form conversations with the people shaping what we care about. No chyrons. No cuts for time. Just real thoughts in real time." }
                    ].map((project, index) => (
                        <motion.div
                            key={index}
                            className="value-item"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <h3 className="value-title">{project.title}</h3>
                            <p className="value-desc">{project.desc}</p>
                        </motion.div>
                    ))}
                </div>
                <motion.p
                    className="about-mission"
                    style={{ marginTop: '4rem', fontSize: '1.2rem' }}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                >
                    Everything else we create—whether a commercial piece, a brand collaboration, an installation, or something that resists categorization—comes from the same place: an obsession with getting it right and making it feel true.
                </motion.p>
            </section>

            <section className="team-section">
                <h2 className="section-header text-center text-2xl uppercase tracking-widest mb-16 opacity-60">The Team</h2>
                <div className="team-grid">
                    {/* Founder 1 */}
                    <div className="founder-card text-center">
                        <a
                            href="https://www.linkedin.com/in/david-lannon/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="photo-container relative mb-8"
                        >
                            <img src="/assets/david-lannon.png" alt="David Lannon" className="photo-blob" />
                            <div className="diamond-overlay absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                        </a>
                        <h3 className="name text-4xl md:text-5xl font-bold uppercase tracking-wide mb-2">David Lannon</h3>
                        <p className="title text-lg uppercase tracking-wider opacity-70">Co-Founder</p>
                    </div>

                    {/* Diamond Divider (only on desktop) */}
                    <div className="divider md:block hidden flex justify-center items-center">
                        <svg className="diamond-divider" viewBox="0 0 50 50" width="24" height="24">
                            <polygon points="25,5 45,25 25,45 5,25" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                        </svg>
                    </div>

                    {/* Founder 2 */}
                    <div className="founder-card text-center">
                        <a
                            href="https://www.linkedin.com/in/camcoop/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="photo-container relative mb-8"
                        >
                            {/* Placeholder for Cam */}
                            <div className="photo-blob" style={{ backgroundColor: '#1a1a1a' }}></div>
                            <div className="diamond-overlay absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                        </a>
                        <h3 className="name text-4xl md:text-5xl font-bold uppercase tracking-wide mb-2">Cam Cooper</h3>
                        <p className="title text-lg uppercase tracking-wider opacity-70">Co-Founder</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
