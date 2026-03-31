"use client";
import { useState, useRef } from 'react';
import { RecaptchaVerifier, multiFactor, PhoneAuthProvider, PhoneMultiFactorGenerator } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';
import Button from './Button';
import { ShieldCheck, Phone, Lock } from 'lucide-react';

export default function MFAEnrollment() {
    const [step, setStep] = useState<'initial' | 'phone' | 'code'>('initial');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationId, setVerificationId] = useState('');
    const [loading, setLoading] = useState(false);
    const recaptchaContainerRef = useRef<HTMLDivElement>(null);

    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current!, {
                'size': 'invisible',
                'callback': () => {
                    // reCAPTCHA solved, allow signInWithPhoneNumber.
                }
            });
        }
    };

    const sendVerificationCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            setupRecaptcha();
            const appVerifier = window.recaptchaVerifier;
            const session = await multiFactor(auth.currentUser!).getSession();
            const phoneInfoOptions = {
                phoneNumber: phoneNumber,
                session: session
            };
            const phoneAuthProvider = new PhoneAuthProvider(auth);
            const vId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, appVerifier);
            setVerificationId(vId);
            setStep('code');
            toast.success("Verification code sent!");
        } catch (err: unknown) {
            const error = err as Error;
            console.error(error);
            toast.error(error.message || "Failed to send code");
        } finally {
            setLoading(false);
        }
    };

    const verifyAndEnroll = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
            const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
            await multiFactor(auth.currentUser!).enroll(multiFactorAssertion, "Admin Phone");
            toast.success("2FA Enabled Successfully!");
            setStep('initial'); // Or 'success' state
        } catch (error) {
            console.error(error);
            toast.error("Invalid code or enrollment failed");
        } finally {
            setLoading(false);
        }
    };

    if (step === 'initial') {
        return (
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm mt-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-900/30 rounded-full text-blue-400">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Two-Factor Authentication</h3>
                            <p className="text-gray-400 text-sm">Secure your account with SMS verification.</p>
                        </div>
                    </div>
                    <Button onClick={() => setStep('phone')} variant="secondary">
                        Enable 2FA
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 backdrop-blur-sm mt-8 max-w-md mx-auto">
            <div className="text-center mb-6">
                <div className="inline-flex p-3 bg-blue-900/30 rounded-full text-blue-400 mb-4">
                    {step === 'phone' ? <Phone size={24} /> : <Lock size={24} />}
                </div>
                <h3 className="text-xl font-bold text-white">
                    {step === 'phone' ? "Add Phone Number" : "Verify Code"}
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                    {step === 'phone'
                        ? "We'll send a verification code to this number."
                        : `Enter the code sent to ${phoneNumber}`
                    }
                </p>
            </div>

            {step === 'phone' ? (
                <form onSubmit={sendVerificationCode} className="space-y-4">
                    <div>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+1 555 555 5555"
                            className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-600 text-center text-lg tracking-wide"
                            required
                        />
                    </div>
                    <div ref={recaptchaContainerRef}></div>
                    <div className="flex gap-3">
                        <Button type="button" variant="secondary" onClick={() => setStep('initial')} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="flex-1">
                            {loading ? "Sending..." : "Send Code"}
                        </Button>
                    </div>
                </form>
            ) : (
                <form onSubmit={verifyAndEnroll} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            placeholder="123456"
                            className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-600 text-center text-2xl tracking-widest letter-spacing-2"
                            maxLength={6}
                            required
                        />
                    </div>
                    <div className="flex gap-3">
                        <Button type="button" variant="secondary" onClick={() => setStep('phone')} className="flex-1">
                            Back
                        </Button>
                        <Button type="submit" disabled={loading} className="flex-1">
                            {loading ? "Verifying..." : "Verify & Enable"}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}

// Add types for window
declare global {
    interface Window {
        recaptchaVerifier: any;
    }
}
