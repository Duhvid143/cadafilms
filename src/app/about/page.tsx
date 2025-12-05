"use client";
import React from 'react';
import { motion } from 'framer-motion';
import '@/styles/About.css';

export default function About() {
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

            <section className="about-section">
                <motion.h2
                    className="section-header"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    The Team
                </motion.h2>
                <div className="team-grid">
                    {[
                        { name: "Alex Cadence", role: "Director", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
                        { name: "Sarah Davis", role: "Producer", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
                        { name: "Michael Chen", role: "Cinematographer", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
                        { name: "Jessica Lee", role: "Editor", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" }
                    ].map((member, index) => (
                        <motion.div
                            key={index}
                            className="team-member"
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <img src={member.img} alt={member.name} className="member-img" />
                            <h3 className="member-name">{member.name}</h3>
                            <span className="member-role">{member.role}</span>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
}
