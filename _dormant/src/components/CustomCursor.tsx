"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import '@/styles/globals_legacy.css'; // Ensure styles are available

const CustomCursor = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const mouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button')) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener("mousemove", mouseMove);
        window.addEventListener("mouseover", handleMouseOver);

        return () => {
            window.removeEventListener("mousemove", mouseMove);
            window.removeEventListener("mouseover", handleMouseOver);
        };
    }, []);

    const variants = {
        default: {
            x: mousePosition.x - 20,
            y: mousePosition.y - 20,
            height: 40,
            width: 40,
            backgroundColor: "transparent",
            border: "1px solid rgba(255, 255, 255, 0.5)"
        },
        hover: {
            x: mousePosition.x - 30,
            y: mousePosition.y - 30,
            height: 60,
            width: 60,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.8)",
            mixBlendMode: "difference" as any
        }
    };

    const dotVariants = {
        default: {
            x: mousePosition.x - 4,
            y: mousePosition.y - 4,
        },
        hover: {
            x: mousePosition.x - 4,
            y: mousePosition.y - 4,
            backgroundColor: "transparent"
        }
    };

    return (
        <>
            <motion.div
                className="cursor-outline"
                variants={variants}
                animate={isHovering ? "hover" : "default"}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
                style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 9999, borderRadius: '50%' }}
            />
            <motion.div
                className="cursor-dot"
                variants={dotVariants}
                animate={isHovering ? "hover" : "default"}
                transition={{ type: "spring", stiffness: 1000, damping: 50 }}
                style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 9999, width: '8px', height: '8px', backgroundColor: 'white', borderRadius: '50%' }}
            />
        </>
    );
};

export default CustomCursor;
