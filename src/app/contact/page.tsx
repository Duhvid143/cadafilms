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
        message: '',
        website_url: '' // Honeypot field
    });

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Google Apps Script Web App URL
        const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby-6ncIAmdb-gTt95shPYApqdu3-oGdfqDEirCghU1nrPWOrvhYntRO-RvicJ7ilSfzZQ/exec";

        if (!GOOGLE_SCRIPT_URL) {
            alert("Please provide the Google Apps Script URL to connect the form.");
            setIsSubmitting(false);
            return;
        }

        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: "POST",
                mode: "no-cors", // Required for Google Apps Script
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            setSubmitStatus('success');
            setFormData({ name: '', email: '', message: '', website_url: '' });
            alert("Message sent successfully!");
        } catch (error) {
            console.error("Error sending message:", error);
            setSubmitStatus('error');
            alert("Failed to send message. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
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
                            <span className="detail-text">productionsbycada@gmail.com</span>
                        </div>
                        <div className="detail-item">
                            <MapPin className="detail-icon" />
                            <span className="detail-text">Everywhere</span>
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
                        {/* Honeypot Field - Hidden from users, visible to bots */}
                        <div style={{ display: 'none' }}>
                            <label htmlFor="website_url">Website</label>
                            <input
                                type="text"
                                id="website_url"
                                name="website_url"
                                value={formData.website_url}
                                onChange={handleChange}
                                tabIndex={-1}
                                autoComplete="off"
                            />
                        </div>

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
                        <Button type="submit" variant="secondary" style={{ width: '100%' }} icon={isSubmitting ? undefined : Send} disabled={isSubmitting}>
                            {isSubmitting ? 'Sending...' : 'Send Message'}
                        </Button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
