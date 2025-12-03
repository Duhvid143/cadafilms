"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/Button';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import '@/styles/Contact.css';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        // Handle form submission logic here
        console.log('Form submitted:', formData);
        alert('Message sent! (This is a demo)');
        setFormData({ name: '', email: '', message: '' });
    };

    return (
        <div className="contact-page">
            <div className="contact-container">
                <motion.div
                    className="contact-info"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="contact-title">Get in Touch</h1>
                    <p className="contact-text">
                        Have a project in mind? We'd love to hear from you.
                        Whether it's a music video, commercial, or documentary,
                        let's create something amazing together.
                    </p>

                    <div className="contact-details">
                        <div className="detail-item">
                            <Mail className="detail-icon" />
                            <span className="detail-text">hello@cadaproductions.com</span>
                        </div>
                        <div className="detail-item">
                            <Phone className="detail-icon" />
                            <span className="detail-text">+1 (555) 123-4567</span>
                        </div>
                        <div className="detail-item">
                            <MapPin className="detail-icon" />
                            <span className="detail-text">123 Creative Ave, Los Angeles, CA</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="contact-form-container"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className="form-input"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="form-input"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="message" className="form-label">Message</label>
                            <textarea
                                id="message"
                                name="message"
                                className="form-textarea"
                                value={formData.message}
                                onChange={handleChange}
                                required
                            ></textarea>
                        </div>
                        <Button type="submit" style={{ width: '100%' }} icon={Send}>
                            Send Message
                        </Button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
