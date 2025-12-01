import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logoText from '../assets/logo-text-black.png'; // Using black text logo and inverting it in CSS
import './Navbar.css';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

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
            <Link to="/" className="navbar-logo-container" onClick={closeMenu}>
                <img src={logoText} alt="CADA" className="navbar-logo-img" />
            </Link>

            <div className="mobile-menu-btn" onClick={toggleMenu}>
                {isOpen ? <X /> : <Menu />}
            </div>

            <ul className={`navbar-links ${isOpen ? 'open' : ''}`}>
                {['Home', 'Work', 'About', 'Contact'].map((item) => (
                    <li key={item}>
                        <Link
                            to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                            className={`nav-link ${location.pathname === (item === 'Home' ? '/' : `/${item.toLowerCase()}`) ? 'active' : ''}`}
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
