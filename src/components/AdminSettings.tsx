"use client";
import { useState } from 'react';
import { verifyBeforeUpdateEmail, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';
import Button from './Button';
import { Settings, X, Mail, AlertTriangle } from 'lucide-react';

interface AdminSettingsProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

export default function AdminSettings({ isOpen, onClose, user }: AdminSettingsProps) {
    const [newEmail, setNewEmail] = useState('');
    const [loading, setLoading] = useState(false);

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
            toast.error(error.message || "Failed to send verification email");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-800 rounded-lg text-gray-400">
                            <Settings size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Account Settings</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                            Current Email
                        </label>
                        <div className="flex items-center gap-3 px-4 py-3 bg-black/50 border border-gray-800 rounded-lg text-gray-300">
                            <Mail size={18} />
                            <span>{user.email}</span>
                            {user.emailVerified && (
                                <span className="ml-auto text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded-full">
                                    Verified
                                </span>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleUpdateEmail} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                Update Email Address
                            </label>
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="new-email@example.com"
                                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-600"
                                required
                            />
                        </div>

                        <div className="bg-blue-900/20 border border-blue-900/50 rounded-lg p-4 flex gap-3 items-start">
                            <AlertTriangle className="text-blue-400 shrink-0 mt-0.5" size={18} />
                            <p className="text-sm text-blue-200/80">
                                For security, we will send a verification link to your <strong>new</strong> email address.
                                Your email won't change until you click that link.
                            </p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
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
