"use client";
import { useState } from 'react';
import { verifyBeforeUpdateEmail, User, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';
import Button from './Button';
import { Settings, X, Mail, AlertTriangle, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AdminSettingsProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

export default function AdminSettings({ isOpen, onClose, user }: AdminSettingsProps) {
    const [newEmail, setNewEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    if (!isOpen || !user) return null;

    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail) return;

        setLoading(true);
        try {
            const actionCodeSettings = {
                url: `${window.location.origin}/admin/verify-email`,
                handleCodeInApp: true,
            };

            await verifyBeforeUpdateEmail(user, newEmail, actionCodeSettings);
            toast.success("Verification email sent! Please check your new inbox.");
            setNewEmail('');
            onClose();
        } catch (error: any) {
            console.error(error);
            if (error.code === 'auth/requires-recent-login') {
                toast.error("Security Requirement: Please log out and log back in to update your email.", {
                    duration: 5000,
                    action: {
                        label: "Log Out Now",
                        onClick: async () => {
                            await signOut(auth);
                            router.push('/admin/login');
                        }
                    }
                });
            } else {
                toast.error(error.message || "Failed to send verification email");
            }
        } finally {
            setLoading(false);
        }
    };

    // Styles matching the new Upload Page (Glassmorphism)
    const styles = {
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(5px)',
            position: 'fixed' as const,
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        },
        modal: {
            background: 'rgba(20, 20, 20, 0.95)', // Slightly darker for modal readability
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '480px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        },
        title: {
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'white',
            letterSpacing: '0.05em',
            textTransform: 'uppercase' as const
        },
        content: {
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '1.5rem'
        },
        label: {
            display: 'block',
            fontSize: '0.75rem',
            fontWeight: 500,
            color: '#888888',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.1em',
            marginBottom: '0.5rem'
        },
        readOnlyField: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            color: '#cccccc',
            fontSize: '0.9rem'
        },
        input: {
            width: '100%',
            padding: '0.75rem 1rem',
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: 'white',
            fontSize: '1rem',
            outline: 'none',
            transition: 'all 0.2s ease'
        },
        infoBox: {
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start'
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg text-gray-400" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <Settings size={20} />
                        </div>
                        <h2 style={styles.title}>Account Settings</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/5"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div style={styles.content}>
                    <div>
                        <label style={styles.label}>
                            Current Email
                        </label>
                        <div style={styles.readOnlyField}>
                            <Mail size={18} />
                            <span>{user.email}</span>
                            {user.emailVerified && (
                                <span className="ml-auto text-xs text-green-400 px-2 py-1 rounded-full" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                                    Verified
                                </span>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleUpdateEmail} className="space-y-4">
                        <div>
                            <label style={styles.label}>
                                Update Email Address
                            </label>
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="new-email@example.com"
                                style={styles.input}
                                required
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                    e.target.style.background = 'rgba(0, 0, 0, 0.4)';
                                }}
                            />
                        </div>

                        <div style={styles.infoBox}>
                            <AlertTriangle className="text-blue-400 shrink-0 mt-0.5" size={18} />
                            <p className="text-sm text-blue-200/80 leading-relaxed">
                                For security, we will send a verification link to your <strong>new</strong> email address.
                                Your email won't change until you click that link.
                            </p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                                className="flex-1"
                                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="flex-1">
                                {loading ? "Sending..." : "Verify & Update"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
