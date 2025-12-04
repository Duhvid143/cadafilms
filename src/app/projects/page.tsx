"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/Button';
import { Play } from 'lucide-react';
import '@/styles/Work.css';

const projects = [
    {
        id: 1,
        title: "Neon Nights",
        category: "Music Video",
        image: "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
    },
    {
        id: 2,
        title: "Urban Explorer",
        category: "Documentary",
        image: "https://images.unsplash.com/photo-1496715976403-7e36dc43f17b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
    },
    {
        id: 3,
        title: "Future Tech",
        category: "Commercial",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
    },
    {
        id: 4,
        title: "Wilderness",
        category: "Short Film",
        image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
    },
    {
        id: 5,
        title: "Fashion Week",
        category: "Event Coverage",
        image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
    },
    {
        id: 6,
        title: "Culinary Arts",
        category: "Brand Film",
        image: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
    }
];

export default function Projects() {
    return (
        <div className="work-page">
            <div className="work-header">
                <motion.h1
                    className="work-title"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    Selected Works
                </motion.h1>
                <motion.p
                    className="work-subtitle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.3 }}
                >
                    A curated collection of visual narratives.
                </motion.p>
            </div>

            <div className="work-grid">
                {projects.map((project, index) => (
                    <motion.div
                        key={project.id}
                        className="project-card"
                        initial={{ opacity: 0, y: 100 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                    >
                        <div className="project-image-container">
                            <img src={project.image} alt={project.title} className="project-image" />
                            <div className="project-info-overlay">
                                <span className="project-category">{project.category}</span>
                                <h3 className="project-title">{project.title}</h3>
                                <Button variant="secondary" icon={Play}>
                                    Watch
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
