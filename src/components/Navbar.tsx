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
                {['Home', 'Work', 'About', 'Contact'].map((item) => (
                    <li key={item}>
                        <Link
                            href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                            className={`nav-link ${pathname === (item === 'Home' ? '/' : `/${item.toLowerCase()}`) ? 'active' : ''}`}
                            onClick={closeMenu}
                        >
                            {item}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Navbar;
