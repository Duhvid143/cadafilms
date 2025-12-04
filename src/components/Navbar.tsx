"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import gsap from 'gsap';
import Lenis from '@studio-freight/lenis';
import '@/styles/Navbar.css';

const Navbar = () => {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const lastScrollY = useRef(0);
    const navRef = useRef<HTMLElement>(null);
    const logoRef = useRef<HTMLImageElement>(null);
    const linksRef = useRef<(HTMLAnchorElement | null)[]>([]);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const activeLineRef = useRef<HTMLDivElement>(null);

    // 10. Entrance Animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(logoRef.current, {
                y: -20,
                opacity: 0,
                duration: 0.6,
                ease: "power2.out"
            });

            gsap.from(linksRef.current, {
                y: -20,
                opacity: 0,
                duration: 0.6,
                stagger: 0.08,
                ease: "power2.out",
                delay: 0.2
            });
        }, navRef);

        return () => ctx.revert();
    }, []);

    // 15. Smart Hide-on-Scroll (using window scroll for simplicity as Lenis events can be tricky to hook globally without context)
    // Ideally we hook into the global Lenis instance, but window scroll works with Lenis too.
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > 100 && currentScrollY > lastScrollY.current) {
                setIsHidden(true);
            } else {
                setIsHidden(false);
            }
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 1. Active Link Indicator
    useEffect(() => {
        const activeLink = linksRef.current.find(link => link?.getAttribute('href') === pathname);
        if (activeLink && activeLineRef.current) {
            const { left, width } = activeLink.getBoundingClientRect();
            const navRect = navRef.current?.getBoundingClientRect();
            if (navRect) {
                gsap.to(activeLineRef.current, {
                    left: left - navRect.left,
                    width: width,
                    scaleX: 1,
                    duration: 0.4,
                    ease: "power2.out"
                });
            }
        } else if (activeLineRef.current) {
            gsap.to(activeLineRef.current, { scaleX: 0, duration: 0.3 });
        }
    }, [pathname]);

    // 8. HOME Reset Logic
    const handleHomeClick = () => {
        // Reset logic placeholder (carousel, scene, etc.)
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // If we had access to the scene/carousel state, we'd reset it here.
    };

    // 11. Bullet Dots Animation
    const handleLinkHover = (index: number, isEnter: boolean) => {
        // Logic to animate adjacent dots would go here if we rendered dots between links.
        // For now, implementing the requested hover effect on the link itself.
        const link = linksRef.current[index];
        if (link) {
            if (isEnter) {
                gsap.to(link, { y: -2, scale: 1.02, color: "#fff", duration: 0.3 });
            } else {
                gsap.to(link, { y: 0, scale: 1, color: "#a1a1aa", duration: 0.3 });
            }
        }
    };

    // 14. Mobile Menu Animation
    useEffect(() => {
        if (isMobileMenuOpen) {
            gsap.fromTo(mobileMenuRef.current,
                { scale: 0.95, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.3, ease: "power2.out" }
            );
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [isMobileMenuOpen]);

    const navLinks = [
        { name: 'HOME', path: '/' },
        { name: 'PROJECTS', path: '/projects' },
        { name: 'ABOUT', path: '/about' },
        { name: 'CONTACT', path: '/contact' }
    ];

    return (
        <>
            <nav
                ref={navRef}
                className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl transition-transform duration-500 ${isHidden ? '-translate-y-[150%]' : 'translate-y-0'}`}
                role="navigation"
            >
                <div className="flex items-center justify-between rounded-full border border-white/10 bg-black/70 backdrop-blur-xl px-6 py-3 shadow-2xl">
                    {/* 5. Responsive Logo */}
                    <Link href="/" onClick={handleHomeClick} className="flex items-center">
                        <img
                            ref={logoRef}
                            src="/assets/logo-text-white.png"
                            alt="CADA"
                            className="h-6 sm:h-8 w-auto object-contain"
                        />
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-8 relative">
                        {navLinks.map((link, i) => (
                            <Link
                                key={link.name}
                                href={link.path}
                                ref={el => { linksRef.current[i] = el }}
                                className={`text-xs sm:text-sm font-medium tracking-widest text-zinc-400 transition-colors duration-400 hover:text-white relative group py-2`}
                                onMouseEnter={() => handleLinkHover(i, true)}
                                onMouseLeave={() => handleLinkHover(i, false)}
                                aria-current={pathname === link.path ? 'page' : undefined}
                                onClick={link.name === 'HOME' ? handleHomeClick : undefined}
                            >
                                {link.name}
                                {/* 2. Glow Effect */}
                                <span className="absolute inset-0 -z-10 scale-0 rounded-full bg-white/20 blur-md transition-transform duration-300 group-hover:scale-150" />
                            </Link>
                        ))}
                        {/* 1. Active Line */}
                        <div
                            ref={activeLineRef}
                            className="absolute bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none"
                        />
                    </div>

                    {/* 3. Mobile Hamburger */}
                    <button
                        className="md:hidden text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                        onClick={() => setIsMobileMenuOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu size={20} />
                    </button>
                </div>
            </nav>

            {/* 3. Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                    onKeyDown={(e) => e.key === 'Escape' && setIsMobileMenuOpen(false)}
                >
                    <div
                        ref={mobileMenuRef}
                        className="flex flex-col items-center gap-8"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-8 right-8 text-white p-2"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <X size={32} />
                        </button>

                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.path}
                                className="text-3xl font-light tracking-widest text-white hover:text-zinc-400 transition-colors"
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    if (link.name === 'HOME') handleHomeClick();
                                }}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
