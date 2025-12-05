import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/styles/globals_legacy.css"; // Import legacy global styles
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";
import SmoothScroll from "@/components/SmoothScroll";
import FaviconManager from "@/components/FaviconManager";

const inter = Inter({ subsets: ["latin"] });

// ...

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <SmoothScroll>
                    <FaviconManager />
                    <CustomCursor />
                    <Navbar />
                    {children}
                    <Footer />
                    <Toaster />
                </SmoothScroll>
            </body>
        </html>
    );
}
