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
                    Founded in 2020, CADA Productions was born from a passion for visual storytelling.
                    We believe that every brand, artist, and individual has a unique story to tell,
                    and our mission is to bring those stories to life through cinematic excellence.
                </motion.p>
            </div>

            <section className="about-section">
                <motion.h2
                    className="section-header"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    Core Values
                </motion.h2>
                <div className="values-grid">
                    {[
                        { title: "Innovation", desc: "We constantly push the boundaries of what's possible in filmmaking, utilizing the latest technology and techniques." },
                        { title: "Authenticity", desc: "We strive to capture the true essence of our subjects, creating content that resonates on a human level." },
                        { title: "Collaboration", desc: "We work closely with our clients, viewing every project as a partnership to achieve a shared vision." }
                    ].map((value, index) => (
                        <motion.div
                            key={index}
                            className="value-item"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <h3 className="value-title">{value.title}</h3>
                            <p className="value-desc">{value.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            <section className="team-section">
                <h2 className="section-header text-center text-2xl uppercase tracking-widest mb-16 opacity-60">The Team</h2>
                <div className="team-grid">
                    {/* Founder 1 */}
                    <div className="founder-card text-center">
                        <div className="photo-container relative mb-8">
                            <img src="/assets/david-lannon.png" alt="David Lannon" className="photo-blob" />
                            <div className="diamond-overlay absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                        <h3 className="name text-4xl md:text-5xl font-bold uppercase tracking-wide mb-2">David Lannon</h3>
                        <p className="title text-lg uppercase tracking-wider opacity-70">Co-Founder</p>
                        <p className="bio mt-6 text-sm leading-relaxed max-w-md mx-auto opacity-80">
                            David brings 10+ years in motion design, specializing in surreal narratives and VFX integration.
                        </p>
                    </div>

                    {/* Diamond Divider (only on desktop) */}
                    <div className="divider md:block hidden flex justify-center items-center">
                        <svg className="diamond-divider" viewBox="0 0 50 50" width="24" height="24">
                            <polygon points="25,5 45,25 25,45 5,25" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                        </svg>
                    </div>

                    {/* Founder 2 */}
                    <div className="founder-card text-center">
                        <div className="photo-container relative mb-8">
                            {/* Placeholder for Cam */}
                            <div className="photo-blob" style={{ backgroundColor: '#1a1a1a' }}></div>
                            <div className="diamond-overlay absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                        <h3 className="name text-4xl md:text-5xl font-bold uppercase tracking-wide mb-2">Cam Cooper</h3>
                        <p className="title text-lg uppercase tracking-wider opacity-70">Co-Founder</p>
                        <p className="bio mt-6 text-sm leading-relaxed max-w-md mx-auto opacity-80">
                            Cam's expertise in directing and sound design crafts immersive worlds for global brands.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
