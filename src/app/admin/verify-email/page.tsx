"use client";
import { useEffect, useState, Suspense } from 'react';
import { applyActionCode, checkActionCode, sendEmailVerification, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Mail, RefreshCw } from 'lucide-react';

function VerifyEmailContent() {
    const [status, setStatus] = useState<'loading' | 'pending' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const [canResend, setCanResend] = useState(true);
    const [cooldown, setCooldown] = useState(0);
    const router = useRouter();
    const searchParams = useSearchParams();
    const oobCode = searchParams.get('oobCode');

    // Handle callback link (user clicked the email link)
    useEffect(() => {
        if (!oobCode) return;

        const verify = async () => {
            try {
                await checkActionCode(auth, oobCode);
                await applyActionCode(auth, oobCode);
                // Reload user to update emailVerified
                await auth.currentUser?.reload();
                setStatus('success');
                setMessage('Your email has been verified!');
            } catch (error: any) {
                console.error(error);
                setStatus('error');
                setMessage(error.message || 'Verification failed. The link may have expired.');
            }
        };

        verify();
    }, [oobCode]);

    // Handle pending state (user redirected here because email not verified)
    useEffect(() => {
        if (oobCode) return; // Skip if handling a callback

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push('/admin/login');
                return;
            }

            if (user.emailVerified) {
                router.push('/admin/upload');
                return;
            }

            // Send verification email automatically on first visit
            try {
                await sendEmailVerification(user);
                setStatus('pending');
                setMessage(`A verification email has been sent to ${user.email}. Check your inbox and click the link to verify.`);
            } catch (error: any) {
                if (error.code === 'auth/too-many-requests') {
                    setStatus('pending');
                    setMessage(`A verification email was already sent to ${user.email}. Check your inbox and click the link to verify.`);
                } else {
                    setStatus('error');
                    setMessage(error.message || 'Failed to send verification email.');
                }
            }
        });

        return () => unsubscribe();
    }, [oobCode, router]);

    // Cooldown timer for resend button
    useEffect(() => {
        if (cooldown <= 0) {
            setCanResend(true);
            return;
        }
        setCanResend(false);
        const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    const handleResend = async () => {
        if (!auth.currentUser) return;
        setCanResend(false);
        setCooldown(60);
        try {
            await sendEmailVerification(auth.currentUser);
            setMessage(`Verification email resent to ${auth.currentUser.email}. Check your inbox.`);
        } catch (error: any) {
            setMessage(error.message || 'Failed to resend. Try again later.');
        }
    };

    const handleCheckStatus = async () => {
        if (!auth.currentUser) return;
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
            setStatus('success');
            setMessage('Your email has been verified!');
        } else {
            setMessage('Email not yet verified. Check your inbox and click the verification link.');
        }
    };

    // Styles matching the admin login page
    const styles = {
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
            alignItems: 'center',
            textAlign: 'center' as const,
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
        },
        secondaryButton: {
            width: '100%',
            padding: '1rem',
            borderRadius: '50px',
            background: 'transparent',
            color: '#888888',
            fontSize: '0.9rem',
            fontWeight: 400,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s ease',
            marginTop: '0.75rem',
        },
    };

    return (
        <div style={styles.container}>
            <div style={{ marginBottom: '1.5rem' }}>
                {status === 'loading' && <Loader2 size={48} style={{ color: '#888', animation: 'spin 1s linear infinite' }} />}
                {status === 'pending' && <Mail size={48} style={{ color: '#888' }} />}
                {status === 'success' && <CheckCircle size={48} style={{ color: '#22c55e' }} />}
                {status === 'error' && <XCircle size={48} style={{ color: '#ef4444' }} />}
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.2rem', marginBottom: '0.5rem', color: '#ffffff' }}>
                {status === 'loading' && 'Verifying...'}
                {status === 'pending' && 'Verify Email'}
                {status === 'success' && 'Verified'}
                {status === 'error' && 'Error'}
            </h1>

            <p style={{ color: '#888888', fontSize: '0.95rem', fontWeight: 300, marginBottom: '2rem', lineHeight: 1.6 }}>
                {message}
            </p>

            {status === 'success' && (
                <button
                    onClick={() => router.push('/admin/upload')}
                    style={styles.button}
                >
                    Continue to Dashboard
                </button>
            )}

            {status === 'pending' && (
                <>
                    <button
                        onClick={handleCheckStatus}
                        style={styles.button}
                    >
                        I&apos;ve Verified — Check Status
                    </button>
                    <button
                        onClick={handleResend}
                        disabled={!canResend}
                        style={{
                            ...styles.secondaryButton,
                            opacity: canResend ? 1 : 0.4,
                            cursor: canResend ? 'pointer' : 'default',
                        }}
                    >
                        <RefreshCw size={14} />
                        {canResend ? 'Resend Email' : `Resend in ${cooldown}s`}
                    </button>
                </>
            )}

            {status === 'error' && (
                <button
                    onClick={() => router.push('/admin/login')}
                    style={styles.button}
                >
                    Back to Login
                </button>
            )}
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <div style={{
            backgroundColor: '#050505',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '2rem',
        }}>
            <Suspense fallback={
                <div style={{ color: '#888', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                    Loading...
                </div>
            }>
                <VerifyEmailContent />
            </Suspense>
        </div>
    );
}
