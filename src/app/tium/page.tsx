"use client";
import React from 'react';
import { motion } from 'framer-motion';
import '@/styles/Work.css';

export default function Tium() {
    return (
        <div className="work-page">
            <div className="work-header">
                <motion.h1
                    className="work-title"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    _TIUM
                </motion.h1>
                <motion.p
                    className="work-subtitle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.3 }}
                >
                    Coming Soon
                </motion.p>
            </div>
        </div>
    );
}
