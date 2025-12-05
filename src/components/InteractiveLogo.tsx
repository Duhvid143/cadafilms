"use client";
import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import '@/styles/InteractiveLogo.css'; // We will move CSS here

const InteractiveLogo = ({ isOpen, works = [] }: any) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [hoveredProject, setHoveredProject] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (containerRef.current && !isOpen) {
                const rect = containerRef.current.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                setMousePos({ x, y });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [isOpen]);

    // Animate title overlay
    useEffect(() => {
        if (titleRef.current) {
            if (hoveredProject) {
                gsap.to(titleRef.current, {
                    y: 0,
                    opacity: 1,
                    duration: 0.4,
                    ease: "power2.out"
                });
            } else {
                gsap.to(titleRef.current, {
                    y: 20,
                    opacity: 0,
                    duration: 0.3,
                    ease: "power2.in"
                });
            }
        }
    }, [hoveredProject]);

    // Generate petals/diamonds
    const numPetals = 16;
    // Base radius
    const baseRadiusX = 100;
    const baseRadiusY = 140;

    // Expanded radius (Oval)
    const expandedRadiusX = 300;
    const expandedRadiusY = 420;

    const petals = [];

    for (let i = 0; i < numPetals; i++) {
        const angle = (i / numPetals) * 2 * Math.PI;

        // Interpolate radius based on isOpen
        const currentRadiusX = isOpen ? expandedRadiusX : baseRadiusX;
        const currentRadiusY = isOpen ? expandedRadiusY : baseRadiusY;

        const x = Math.cos(angle) * currentRadiusX;
        const y = Math.sin(angle) * currentRadiusY;

        // Point outwards
        const rotation = (angle * 180) / Math.PI + 90;

        // Assign a work item to this petal if available
        // We cycle through works if there are fewer works than petals
        const workItem = works.length > 0 ? works[i % works.length] : null;

        petals.push({ id: i, x, y, rotation, angle, workItem });
    }

    return (
        <div
            className={`interactive-logo-container ${isOpen ? 'open' : ''}`}
            ref={containerRef}
        >
            <div className="carousel-rotator">
                {petals.map((petal) => {
                    let moveX = 0;
                    let moveY = 0;
                    let rotateVal = 0;
                    let scaleVal = 1;

                    if (!isOpen) {
                        const dx = mousePos.x - petal.x;
                        const dy = mousePos.y - petal.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const maxDist = 300;
                        const influence = Math.max(0, 1 - dist / maxDist);

                        moveX = -(dx * influence * 0.2);
                        moveY = -(dy * influence * 0.2);

                        const rotateInfluence = (Math.atan2(dy, dx) * 180 / Math.PI) - petal.rotation;
                        rotateVal = rotateInfluence * influence * 0.5;
                        scaleVal = 1 + influence * 0.2;
                    }

                    return (
                        <motion.div
                            key={petal.id}
                            className={`logo-shape ${isOpen ? 'custom-cursor-diamond' : ''}`}
                            style={{
                                left: `calc(50% + ${petal.x}px - ${isOpen ? 60 : 20}px)`,
                                top: `calc(50% + ${petal.y}px - ${isOpen ? 100 : 40}px)`,
                            }}
                            animate={{
                                x: isOpen ? 0 : moveX,
                                y: isOpen ? 0 : moveY,
                                rotate: petal.rotation + rotateVal,
                                scale: (isOpen && hoveredProject === petal.workItem?.title) ? 1.2 : scaleVal,
                            }}
                            transition={{
                                duration: 1.2,
                                ease: [0.2, 0.8, 0.2, 1],
                                layout: { duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }
                            }}
                            onClick={() => {
                                if (isOpen && petal.workItem) {
                                    // Mock opening project modal - for now push to route or log
                                    // Assuming _TIUM or MUIT based on title or random for demo
                                    if (petal.workItem.title.includes('MUIT')) router.push('/muit');
                                    else if (petal.workItem.title.includes('TIUM')) router.push('/tium');
                                    else router.push('/projects');
                                }
                            }}
                            onMouseEnter={() => {
                                if (isOpen && petal.workItem) {
                                    setHoveredProject(petal.workItem.title);
                                }
                            }}
                            onMouseLeave={() => {
                                if (isOpen) {
                                    setHoveredProject(null);
                                }
                            }}
                        >
                            {isOpen && petal.workItem && (
                                <img
                                    src={petal.workItem.image}
                                    alt={petal.workItem.title}
                                    className="logo-shape-img"
                                />
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Project Title Overlay */}
            <div className="project-title-overlay" ref={titleRef}>
                {hoveredProject}
            </div>
        </div>
    );
};

export default InteractiveLogo;
