import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer>
      <div className="social-links">
        <a href="https://X.com" target="_blank" rel="noopener noreferrer" aria-label="X">X</a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">Instagram</a>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">Facebook</a>
      </div>
      <p>© {new Date().getFullYear()} CADA FILMS</p>
    </footer>
  );
};

export default Footer;
