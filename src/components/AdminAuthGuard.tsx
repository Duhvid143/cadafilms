"use client";

import { useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface AdminAuthGuardProps {
    children: ReactNode;
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                setAuthenticated(false);
                router.push("/admin/login");
            } else {
                setAuthenticated(true);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white flex-col gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-white/50" />
                <span className="text-white/30 font-light tracking-widest text-sm uppercase">Verifying Access</span>
            </div>
        );
    }

    if (!authenticated) {
        return null; // Don't verify or render children while redirecting
    }

    return <>{children}</>;
}
