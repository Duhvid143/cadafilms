"use client";
import React from 'react';
import { motion } from 'framer-motion';
import '@/styles/Button.css'; // We will move CSS here

import { LucideIcon } from 'lucide-react';

interface ButtonProps {
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'; // Added common variants
    className?: string;
    icon?: LucideIcon;
    disabled?: boolean;
    style?: React.CSSProperties;
}

const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', icon: Icon, disabled, style }: ButtonProps) => {
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
