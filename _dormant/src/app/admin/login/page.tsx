"use client";
import { useState, useRef } from "react";
import { signInWithEmailAndPassword, getMultiFactorResolver, PhoneAuthProvider, PhoneMultiFactorGenerator, RecaptchaVerifier, setPersistence, browserSessionPersistence } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
// import Button from "@/components/Button"; // Using inline styled button instead

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
            await setPersistence(auth, browserSessionPersistence);
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

    // Styles matching Upload Page
    const styles = {
        page: {
            backgroundColor: '#050505',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '2rem'
        },
        container: {
            width: '100%',
            maxWidth: '480px',
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '3rem',
            borderRadius: '30px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center'
        },
        title: {
            fontSize: '2rem',
            fontWeight: 300,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.2rem',
            marginBottom: '0.5rem',
            color: '#ffffff',
            textAlign: 'center' as const
        },
        subtitle: {
            color: '#888888',
            fontSize: '0.9rem',
            fontWeight: 300,
            marginBottom: '2.5rem',
            textAlign: 'center' as const
        },
        label: {
            display: 'block',
            marginBottom: '0.8rem',
            fontSize: '0.8rem',
            color: '#888888',
            textTransform: 'uppercase' as const,
            letterSpacing: '2px'
        },
        input: {
            width: '100%',
            padding: '1rem 1.5rem',
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            color: '#ffffff',
            fontSize: '1rem',
            outline: 'none',
            transition: 'all 0.3s ease',
            marginBottom: '1.5rem'
        },
        button: {
            width: '100%',
            padding: '1.25rem',
            borderRadius: '50px',
            background: '#ffffff',
            color: '#000000',
            fontSize: '1rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            textTransform: 'uppercase' as const,
            letterSpacing: '1px',
            transition: 'all 0.3s ease',
            boxShadow: '0 0 20px rgba(255,255,255,0.1)',
            marginTop: '1rem'
        },
        secondaryButton: {
            background: 'transparent',
            border: 'none',
            color: '#888888',
            fontSize: '0.9rem',
            cursor: 'pointer',
            marginTop: '1.5rem',
            textDecoration: 'underline',
            transition: 'color 0.2s ease'
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <h1 style={styles.title}>
                    {mfaRequired ? "Two-Factor Auth" : "Admin Access"}
                </h1>
                <p style={styles.subtitle}>
                    {mfaRequired ? "Enter the code sent to your phone" : "Authorized personnel only"}
                </p>

                {!mfaRequired ? (
                    <form onSubmit={handleLogin} style={{ width: '100%' }}>
                        <div>
                            <label style={styles.label}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={styles.input}
                                placeholder="admin@cadafilms.com"
                                required
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#ffffff';
                                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                                    e.target.style.background = 'rgba(0, 0, 0, 0.3)';
                                }}
                            />
                        </div>

                        <div>
                            <label style={styles.label}>
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={styles.input}
                                placeholder="••••••••"
                                required
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#ffffff';
                                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                                    e.target.style.background = 'rgba(0, 0, 0, 0.3)';
                                }}
                            />
                        </div>

                        <div ref={recaptchaContainerRef}></div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={styles.button}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.02)';
                                e.currentTarget.style.boxShadow = '0 0 30px rgba(255,255,255,0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 0 20px rgba(255,255,255,0.1)';
                            }}
                        >
                            {loading ? "Verifying..." : "Enter Dashboard"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleMfaVerify} style={{ width: '100%' }}>
                        <div>
                            <label style={styles.label}>
                                Verification Code
                            </label>
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                style={{ ...styles.input, textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                                placeholder="123456"
                                maxLength={6}
                                required
                                autoFocus
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#ffffff';
                                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                                    e.target.style.background = 'rgba(0, 0, 0, 0.3)';
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={styles.button}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.02)';
                                e.currentTarget.style.boxShadow = '0 0 30px rgba(255,255,255,0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 0 20px rgba(255,255,255,0.1)';
                            }}
                        >
                            {loading ? "Verifying..." : "Verify Login"}
                        </button>

                        <button
                            type="button"
                            onClick={() => setMfaRequired(false)}
                            style={styles.secondaryButton}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#888888'}
                        >
                            Back to Login
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
