"use client";
import React from 'react';
import Link from 'next/link';
import { Instagram, Twitter, Linkedin, Mail } from 'lucide-react';
import '@/styles/Footer.css'; // We moved CSS here

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-logo">CADA Productions</div>

                <div className="footer-links">
                    <Link href="/work" className="footer-link">Work</Link>
                    <Link href="/about" className="footer-link">About</Link>
                    <Link href="/contact" className="footer-link">Contact</Link>
                </div>

                <div className="footer-socials">
                    <Instagram className="social-icon" />
                    <Twitter className="social-icon" />
                    <Linkedin className="social-icon" />
                    <Mail className="social-icon" />
                </div>

                <div className="footer-copyright">
                    &copy; {new Date().getFullYear()} CADA Productions. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
