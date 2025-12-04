import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/styles/globals_legacy.css"; // Import legacy global styles
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor"; // Assuming we port this too, or omit for now if complex

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "CADA Productions",
    description: "Headless Podcast CMS",
    icons: {
        icon: [
            { url: '/assets/logo-oval-black.png', media: '(prefers-color-scheme: light)', type: 'image/png' },
            { url: '/assets/logo-oval-white.png', media: '(prefers-color-scheme: dark)', type: 'image/png' },
        ],
        apple: [
            { url: '/assets/logo-oval-black.png', media: '(prefers-color-scheme: light)', type: 'image/png' },
            { url: '/assets/logo-oval-white.png', media: '(prefers-color-scheme: dark)', type: 'image/png' },
        ]
    }
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <CustomCursor />
                <Navbar />
                {children}
                <Footer />
                <Toaster />
            </body>
        </html>
    );
}
