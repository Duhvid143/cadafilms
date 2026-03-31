"use client";
import { useEffect } from 'react';

const FaviconManager = () => {
    useEffect(() => {
        const updateFavicon = () => {
            const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;

            if (favicon) {
                // White logo for dark mode, Black logo for light mode
                favicon.href = isDarkMode ? '/favicon-white.png' : '/favicon-black.png';
            } else {
                // Create if it doesn't exist
                const newFavicon = document.createElement('link');
                newFavicon.rel = 'icon';
                newFavicon.href = isDarkMode ? '/favicon-white.png' : '/favicon-black.png';
                document.head.appendChild(newFavicon);
            }
        };

        // Initial check
        updateFavicon();

        // Listen for changes
        const matcher = window.matchMedia('(prefers-color-scheme: dark)');
        matcher.addEventListener('change', updateFavicon);

        return () => matcher.removeEventListener('change', updateFavicon);
    }, []);

    return null;
};

export default FaviconManager;
