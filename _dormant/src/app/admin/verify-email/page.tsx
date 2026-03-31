"use client";
import { useEffect, useState, Suspense } from 'react';
import { applyActionCode, checkActionCode } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/Button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

function VerifyEmailContent() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email...');
    const router = useRouter();
    const searchParams = useSearchParams();
    const oobCode = searchParams.get('oobCode');

    useEffect(() => {
        if (!oobCode) {
            setStatus('error');
            setMessage('Invalid verification link.');
            return;
        }

        const verify = async () => {
            try {
                // Check if the code is valid
                await checkActionCode(auth, oobCode);
                // Apply the code (this actually updates the email)
                await applyActionCode(auth, oobCode);

                setStatus('success');
                setMessage('Your email has been successfully updated!');
            } catch (error: any) {
                console.error(error);
                setStatus('error');
                setMessage(error.message || 'Verification failed. The link may have expired.');
            }
        };

        verify();
    }, [oobCode]);

    return (
        <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
            <div className="flex justify-center mb-6">
                {status === 'loading' && (
                    <div className="p-4 bg-blue-900/20 rounded-full">
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    </div>
                )}
                {status === 'success' && (
                    <div className="p-4 bg-green-900/20 rounded-full">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                )}
                {status === 'error' && (
                    <div className="p-4 bg-red-900/20 rounded-full">
                        <XCircle className="w-12 h-12 text-red-500" />
                    </div>
                )}
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">
                {status === 'loading' && 'Verifying...'}
                {status === 'success' && 'Email Verified!'}
                {status === 'error' && 'Verification Failed'}
            </h1>

            <p className="text-gray-400 mb-8">
                {message}
            </p>

            <Button
                onClick={() => router.push('/admin/login')}
                className="w-full justify-center"
            >
                Back to Login
            </Button>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl translate-y-1/2 pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10">
                <Suspense fallback={
                    <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-blue-900/20 rounded-full">
                                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Loading...</h1>
                    </div>
                }>
                    <VerifyEmailContent />
                </Suspense>
            </div>
        </div>
    );
}
