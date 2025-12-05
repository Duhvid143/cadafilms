"use client";
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import '@/styles/Navbar.css';
import ProjectSubNav from './ProjectSubNav';

const Navbar = () => {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProjectsHovered, setIsProjectsHovered] = useState(false);

    // Refs for GSAP
    const navRef = useRef<HTMLElement>(null);
    const logoRef = useRef<HTMLDivElement>(null);
    const linksRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const mobileLinksRef = useRef<HTMLDivElement>(null);

    // Initial Entrance Animation
    useEffect(() => {
        const tl = gsap.timeline();

        tl.fromTo(navRef.current,
            { y: -100, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
        )
            .fromTo(logoRef.current,
                { x: -20, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
                "-=0.5"
            )
            .fromTo(linksRef.current?.children || [],
                { y: -20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" },
                "-=0.6"
            );
    }, []);

    // Mobile Menu Animation
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
            gsap.to(mobileMenuRef.current, {
                opacity: 1,
                pointerEvents: 'all',
                duration: 0.5,
                ease: "power2.out"
            });
            gsap.fromTo(mobileLinksRef.current?.children || [],
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, delay: 0.2, ease: "power2.out" }
            );
        } else {
            document.body.style.overflow = '';
            gsap.to(mobileMenuRef.current, {
                opacity: 0,
                pointerEvents: 'none',
                duration: 0.5,
                ease: "power2.in"
            });
        }
    }, [isMobileMenuOpen]);

    const navLinks = [
        { name: 'HOME', href: '/' },
        { name: 'PROJECTS', href: '/projects' },
        { name: 'ABOUT', href: '/about' },
        { name: 'CONTACT', href: '/contact' },
    ];

    return (
        <>
            <nav className="navbar-container" ref={navRef}>
                <div className="navbar-pill">
                    {/* Logo - Right Side on Desktop */}
                    <div className="nav-logo" ref={logoRef}>
                        <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                            <img src="/assets/logo-cada-new.png" alt="CADA" className="logo-image" />
                        </Link>
                    </div>

                    {/* Desktop Links - Left Side */}
                    <div className="nav-links-desktop" ref={linksRef}>
                        {navLinks.map((link) => (
                            <div
                                key={link.name}
                                className="nav-item-wrapper"
                                onMouseEnter={() => link.name === 'PROJECTS' && setIsProjectsHovered(true)}
                                onMouseLeave={() => link.name === 'PROJECTS' && setIsProjectsHovered(false)}
                            >
                                <Link
                                    href={link.href}
                                    className={`nav-link ${pathname === link.href ? 'active' : ''}`}
                                >
                                    {link.name}
                                    {pathname === link.href && (
                                        <span className="active-line" />
                                    )}
                                </Link>
                                {link.name === 'PROJECTS' && (
                                    <div
                                        className="subnav-wrapper"
                                        ref={(el) => {
                                            if (el) {
                                                gsap.to(el, {
                                                    width: isProjectsHovered ? "auto" : 0,
                                                    opacity: isProjectsHovered ? 1 : 0,
                                                    marginLeft: isProjectsHovered ? "1rem" : 0,
                                                    duration: 0.4,
                                                    ease: "power2.out"
                                                });
                                            }
                                        }}
                                    >
                                        <ProjectSubNav isOpen={isProjectsHovered} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
                        <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div className="mobile-menu-overlay" ref={mobileMenuRef}>
                <div className="mobile-menu-content" ref={mobileLinksRef}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="mobile-nav-link"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Navbar;
