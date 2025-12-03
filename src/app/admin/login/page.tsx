"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Button from "@/components/Button";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success("Welcome back!");
            router.push("/admin/upload");
        } catch (error: any) {
            console.error(error);
            toast.error("Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl translate-y-1/2 pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10">
                <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Admin Access</h1>
                        <p className="text-gray-400 text-sm">Authorized personnel only</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-white/20 focus:border-white outline-none transition-all placeholder-gray-600"
                                placeholder="admin@cadafilms.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-white/20 focus:border-white outline-none transition-all placeholder-gray-600"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full justify-center py-4 text-lg"
                            disabled={loading}
                        >
                            {loading ? "Verifying..." : "Enter Dashboard"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
