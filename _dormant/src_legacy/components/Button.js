import React from 'react';
import { motion } from 'framer-motion';
import './Button.css';

const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', icon: Icon }) => {
    return (
        <motion.button
            className={`btn btn-${variant} ${className}`}
            onClick={onClick}
            type={type}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            {children}
            {Icon && <Icon className="btn-icon" size={18} />}
        </motion.button>
    );
};

export default Button;
