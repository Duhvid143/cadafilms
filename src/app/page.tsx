"use client";
import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/Button';
import { ArrowRight } from 'lucide-react';
import InteractiveLogo from '@/components/InteractiveLogo';
import ProjectSubNav from '@/components/ProjectSubNav';
import '@/styles/Home.css'; // We moved CSS here

export default function Home() {
    const router = useRouter();
    const containerRef = useRef(null);
    const [isCarouselOpen, setIsCarouselOpen] = useState(false);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '1') {
                router.push('/tium');
            } else if (e.key === '2') {
                router.push('/muit');
            } else if (e.key === 'Escape' || e.key === '0') {
                if (isCarouselOpen) setIsCarouselOpen(false);
                else router.push('/');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isCarouselOpen, router]);

    const featuredWork = [
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
        }
    ];

    return (
        <div className="home" ref={containerRef}>
            {/* <ProjectSubNav isOpen={isCarouselOpen} /> */}

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg-curve"></div>
                <div className="hero-bg-curve-2"></div>

                <motion.div
                    className="hero-content"
                    style={{ y, opacity: isCarouselOpen ? 1 : opacity }} // Keep visible when open
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1.5, opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        style={{ marginTop: '10rem', marginBottom: '2rem', zIndex: 10 }}
                    >
                        <InteractiveLogo isOpen={isCarouselOpen} works={featuredWork} />
                    </motion.div>

                    {/* Removed CADA text logo as requested */}


                    {/* Hide text and button when carousel is open to reduce clutter? 
              Or keep button to toggle close? Let's change button text. */}

                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{
                            y: 0,
                            opacity: 1,
                            translateY: isCarouselOpen ? 200 : 0 // Move down when open
                        }}
                        transition={{ duration: 1, delay: 1 }}
                        className="flex flex-col items-center gap-4"
                    >
                        {/* Home Links - Bypass Carousel */}
                        {/* <div className="home-links-container">
                            <Link href="/tium" className="subnav-link">_TIUM</Link>
                            <div className="subnav-separator" />
                            <Link href="/muit" className="subnav-link">MUIT</Link>
                        </div> */}

                        {/* <Button variant="organic" onClick={() => setIsCarouselOpen(!isCarouselOpen)}>
                            {isCarouselOpen ? "Close View" : "Explore Work"}
                        </Button> */}
                    </motion.div>
                </motion.div>
            </section>

            {/* About Preview Section - Selected Works Removed */}
            <section className="about-preview" style={{ marginTop: '0' }}>
                <div className="about-content">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="about-text-large">
                            We craft visual experiences that challenge the ordinary and embrace the avant-garde.
                        </h2>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <p className="about-desc">
                            Inspired by the fluid lines of modern architecture and the bold contrast of brutalism,
                            CADA Productions is not just a production company—it's a design philosophy.
                        </p>
                        <Button variant="secondary" onClick={() => router.push('/about')} icon={ArrowRight}>
                            Our Philosophy
                        </Button>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};
