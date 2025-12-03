"use client";
import { useState, useRef } from "react";
import { signInWithEmailAndPassword, getMultiFactorResolver, PhoneAuthProvider, PhoneMultiFactorGenerator, RecaptchaVerifier } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Button from "@/components/Button";

// Add types for window
declare global {
    interface Window {
        recaptchaVerifier: any;
    }
}

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // MFA State
    const [mfaRequired, setMfaRequired] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [resolver, setResolver] = useState<any>(null);
    const [verificationId, setVerificationId] = useState("");
    const recaptchaContainerRef = useRef<HTMLDivElement>(null);

    const router = useRouter();

    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current!, {
                'size': 'invisible',
                'callback': () => {
                    // reCAPTCHA solved
                }
            });
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success("Welcome back!");
            router.push("/admin/upload");
        } catch (error: any) {
            if (error.code === 'auth/multi-factor-auth-required') {
                setMfaRequired(true);
                const resolver = getMultiFactorResolver(auth, error);
                setResolver(resolver);

                // Send verification code to the first enrolled phone number
                const phoneHints = resolver.hints;
                const selectedHint = phoneHints[0]; // Assuming one phone number for now

                setupRecaptcha();
                const phoneAuthProvider = new PhoneAuthProvider(auth);
                const vId = await phoneAuthProvider.verifyPhoneNumber(
                    {
                        multiFactorHint: selectedHint,
                        session: resolver.session
                    },
                    window.recaptchaVerifier
                );
                setVerificationId(vId);
                toast.info("Enter the 2FA code sent to your phone");
            } else {
                console.error(error);
                toast.error("Invalid credentials");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleMfaVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
            const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
            await resolver.resolveSignIn(multiFactorAssertion);

            toast.success("Verified! Welcome back.");
            router.push("/admin/upload");
        } catch (error: any) {
            console.error(error);
            toast.error("Invalid code");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100%' }}>
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl translate-y-1/2 pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10">
                <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {mfaRequired ? "Two-Factor Auth" : "Admin Access"}
                        </h1>
                        <p className="text-gray-400 text-sm">
                            {mfaRequired ? "Enter the code sent to your phone" : "Authorized personnel only"}
                        </p>
                    </div>

                    {!mfaRequired ? (
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 text-left">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-white/20 focus:border-white/50 outline-none transition-all placeholder-gray-500 backdrop-blur-sm"
                                    placeholder="admin@cadafilms.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 text-left">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-white/20 focus:border-white/50 outline-none transition-all placeholder-gray-500 backdrop-blur-sm"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <div ref={recaptchaContainerRef}></div>

                            <Button
                                type="submit"
                                className="w-full justify-center py-4 text-lg"
                                disabled={loading}
                            >
                                {loading ? "Verifying..." : "Enter Dashboard"}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleMfaVerify} className="space-y-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 text-left">
                                    Verification Code
                                </label>
                                <input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-white/20 focus:border-white outline-none transition-all placeholder-gray-600 text-center text-2xl tracking-widest"
                                    placeholder="123456"
                                    maxLength={6}
                                    required
                                    autoFocus
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full justify-center py-4 text-lg"
                                disabled={loading}
                            >
                                {loading ? "Verifying..." : "Verify Login"}
                            </Button>

                            <button
                                type="button"
                                onClick={() => setMfaRequired(false)}
                                className="w-full text-sm text-gray-500 hover:text-white transition-colors"
                            >
                                Back to Login
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
