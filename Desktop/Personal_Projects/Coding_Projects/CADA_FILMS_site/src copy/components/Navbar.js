import React, { useState } from "react";
import "./Navbar.css"; // Import the CSS file

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header>
      <div className="logo-container">
        <img
          src="/logo.png"
          className={`logo ${menuOpen ? "rotate" : ""}`}
          alt="Cadafilms Logo"
          onClick={() => setMenuOpen(!menuOpen)}
        />
      </div>
      <nav className={`dropdown-menu ${menuOpen ? "show" : ""}`}>
        <ul>
          <li><a href="#hero">Home</a></li>
          <li><a href="#projects">Projects</a></li>
          <li><a href="about.html">About</a></li>
          <li><a href="store.html">Store</a></li>
          <li><a href="contact.html">Contact</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
