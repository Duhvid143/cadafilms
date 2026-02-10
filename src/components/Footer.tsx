"use client";
import React from 'react';
import Link from 'next/link';
import { Instagram, Twitter, Linkedin, Mail } from 'lucide-react';
import '@/styles/Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-logo">CADA Productions</div>

                <div className="footer-links">
                    <Link href="/projects" className="footer-link">Work</Link>
                    <Link href="/about" className="footer-link">About</Link>
                    <Link href="/contact" className="footer-link">Contact</Link>
                </div>

                <div className="footer-socials">
                    <a href="https://instagram.com/cadafilms" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                        <Instagram className="social-icon" />
                    </a>
                    <a href="https://x.com/cadafilms" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
                        <Twitter className="social-icon" />
                    </a>
                    <a href="mailto:productionsbycada@gmail.com" aria-label="Email">
                        <Mail className="social-icon" />
                    </a>
                </div>

                <div className="footer-copyright">
                    &copy; {new Date().getFullYear()} CADA Productions. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
