import React from 'react';
import { Instagram, Twitter, Linkedin, Mail } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-logo">CADA Productions</div>

                <div className="footer-links">
                    <a href="/work" className="footer-link">Work</a>
                    <a href="/about" className="footer-link">About</a>
                    <a href="/contact" className="footer-link">Contact</a>
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
