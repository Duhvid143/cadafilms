"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import '@/styles/Navbar.css'; // We moved CSS here

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const closeMenu = () => {
        setIsOpen(false);
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <Link href="/" className="navbar-logo-container" onClick={closeMenu}>
                <img src="/assets/logo-text-black.png" alt="CADA" className="navbar-logo-img" />
            </Link>

            <div className="mobile-menu-btn" onClick={toggleMenu}>
                {isOpen ? <X /> : <Menu />}
            </div>

            <ul className={`navbar-links ${isOpen ? 'open' : ''}`}>
                <li key="Home">
                    <Link
                        href="/"
                        className={`nav-link ${pathname === '/' ? 'active' : ''}`}
                        onClick={closeMenu}
                    >
                        Home
                    </Link>
                </li>
                <li key="Projects" className="dropdown-container">
                    <Link
                        href="/projects"
                        className={`nav-link ${pathname === '/projects' ? 'active' : ''}`}
                        onClick={closeMenu}
                    >
                        Projects
                    </Link>
                    <div className="dropdown-menu">
                        <Link href="/tium" className="dropdown-item" onClick={closeMenu}>
                            _TIUM
                        </Link>
                        <Link href="/muit" className="dropdown-item" onClick={closeMenu}>
                            MUIT
                        </Link>
                    </div>
                </li>
                <li key="About">
                    <Link
                        href="/about"
                        className={`nav-link ${pathname === '/about' ? 'active' : ''}`}
                        onClick={closeMenu}
                    >
                        About
                    </Link>
                </li>
                <li key="Contact">
                    <Link
                        href="/contact"
                        className={`nav-link ${pathname === '/contact' ? 'active' : ''}`}
                        onClick={closeMenu}
                    >
                        Contact
                    </Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
