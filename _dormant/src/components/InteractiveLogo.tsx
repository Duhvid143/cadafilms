"use client";
import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import '@/styles/InteractiveLogo.css'; // We will move CSS here

interface WorkItem {
    title: string;
    image: string;
}

interface InteractiveLogoProps {
    isOpen: boolean;
    works?: WorkItem[];
}

const InteractiveLogo = ({ isOpen, works = [] }: InteractiveLogoProps) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [hoveredProject, setHoveredProject] = useState<string | null>(null);
    const [burst, setBurst] = useState<{ x: number, y: number, id: number } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
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

    // Auto-select closest to center (front) when opening
    useEffect(() => {
        if (isOpen && works.length > 0) {
            // The petals are generated with angles.
            // Angle 90deg (PI/2) is usually bottom, 270deg (3PI/2) is top.
            // In the loop: rotation = (angle * 180) / Math.PI + 90;
            // We want the one "closest to center" visually? Or front?
            // Let's pick the first one (id 0) or the one at the bottom/front.
            // For now, let's just pick the first one to simulate "closest".
            const firstWork = works[0];
            if (firstWork) setHoveredProject(firstWork.title);
        }
    }, [isOpen, works]);

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

    const handlePetalClick = (e: React.MouseEvent, petal: { workItem: WorkItem | null }) => {
        if (isOpen && petal.workItem) {
            // Trigger burst
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            setBurst({ x: e.clientX, y: e.clientY, id: Date.now() });

            // Navigate
            if (petal.workItem.title.includes('MUIT')) router.push('/muit');
            else if (petal.workItem.title.includes('TIUM')) router.push('/tium');
            else router.push('/projects');
        }
    };

    return (
        <div
            className={`interactive-logo-container ${isOpen ? 'open' : ''}`}
            ref={containerRef}
        >
            {burst && (
                <div
                    className="click-burst"
                    style={{ left: burst.x, top: burst.y, position: 'fixed' }}
                    onAnimationEnd={() => setBurst(null)}
                />
            )}

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

                    const isHovered = isOpen && hoveredProject === petal.workItem?.title;

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
                                scale: isHovered ? 1.25 : scaleVal, // Updated scale to 1.25
                            }}
                            transition={{
                                duration: 1.2,
                                ease: [0.2, 0.8, 0.2, 1],
                                layout: { duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }
                            }}
                            onClick={(e) => handlePetalClick(e, petal)}
                            onMouseEnter={() => {
                                if (isOpen && petal.workItem) {
                                    setHoveredProject(petal.workItem.title);
                                }
                            }}
                            onMouseLeave={() => {
                                // Don't clear immediately to keep "closest" feel?
                                // Or clear. User said "Auto-select...".
                                // If I clear, it goes back to nothing.
                                // I'll keep it for now or clear if they leave the whole area.
                                // For now, standard hover behavior.
                                if (isOpen) {
                                    setHoveredProject(null);
                                }
                            }}
                        >
                            {isOpen && petal.workItem && (
                                <>
                                    <img
                                        src={petal.workItem.image}
                                        alt={petal.workItem.title}
                                        className="logo-shape-img"
                                    />
                                    {/* Title under diamond */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '120%',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            fontFamily: 'Times New Roman, serif',
                                            fontSize: '14px',
                                            color: 'white',
                                            opacity: isHovered ? 0.8 : 0,
                                            pointerEvents: 'none',
                                            whiteSpace: 'nowrap',
                                            transition: 'opacity 0.3s',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em'
                                        }}
                                    >
                                        {petal.workItem.title}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Removed fixed overlay as we moved title to diamond */}
        </div>
    );
};

export default InteractiveLogo;
