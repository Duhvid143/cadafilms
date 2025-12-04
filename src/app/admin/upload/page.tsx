"use client";
import { useState, useEffect } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { storage, db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Dropzone from "@/components/Dropzone";
import { Settings } from "lucide-react";
import MFAEnrollment from "@/components/MFAEnrollment";
import AdminSettings from "@/components/AdminSettings";

export default function UploadPage() {
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [progress, setProgress] = useState(0);
    const [episodeNumber, setEpisodeNumber] = useState("");
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                router.push("/admin/login");
            } else {
                setUser(currentUser);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    const handleUpload = async (file: File) => {
        if (!episodeNumber || !title) {
            toast.error("Please enter Episode Number and Title first");
            return;
        }

        setUploading(true);
        const storageRef = ref(storage, `episodes/${episodeNumber}.mp4`);

        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setProgress(p);
            },
            (error) => {
                console.error(error);
                toast.error("Upload failed: " + error.message);
                setUploading(false);
            },
            async () => {
                // Upload Complete
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                // Save initial metadata to trigger Cloud Function
                await setDoc(doc(db, "episodes", episodeNumber), {
                    title: title,
                    videoUrl: downloadURL,
                    sizeBytes: file.size,
                    uploadedAt: new Date().toISOString(),
                    status: "processing" // Function will update this to "ready"
                });

                toast.success("Upload Complete! AI is processing...");
                setUploadSuccess(true);
                setProgress(100);

                // Reset after delay
                setTimeout(() => {
                    setUploading(false);
                    setUploadSuccess(false);
                    setProgress(0);
                    setEpisodeNumber("");
                    setTitle("");
                }, 3000);
            }
        );
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

    // Styles matching Contact.css
    const styles = {
        page: {
            backgroundColor: '#050505',
            minHeight: '100vh',
            paddingTop: '200px', // Increased from 150px to clear navbar
            paddingBottom: '8rem',
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            width: '100%'
        },
        container: {
            maxWidth: '1200px',
            width: '100%',
            padding: '0 2rem',
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center'
        },
        header: {
            width: '100%',
            maxWidth: '800px',
            marginBottom: '4rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end'
        },
        title: {
            fontSize: '4rem',
            fontWeight: 300,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.5rem',
            marginBottom: '1rem',
            color: '#ffffff'
        },
        subtitle: {
            color: '#888888',
            fontSize: '1.1rem',
            fontWeight: 300,
            lineHeight: 1.8
        },
        formContainer: {
            width: '100%',
            maxWidth: '800px',
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '4rem',
            borderRadius: '30px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)'
        },
        label: {
            display: 'block',
            marginBottom: '0.8rem',
            fontSize: '0.9rem',
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
            transition: 'all 0.3s ease'
        },
        uploadCard: {
            marginTop: '3rem',
            padding: '2rem',
            borderRadius: '20px',
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.title}>Upload</h1>
                        <p style={styles.subtitle}>Drag and drop your video file to begin processing.</p>
                    </div>
                    {/* Settings Button - Commented out for now
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="p-3 rounded-full text-white transition-all hover:bg-white/10"
                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                        title="Account Settings"
                    >
                        <Settings size={24} />
                    </button>
                    */}
                </div>

                <div style={styles.formContainer}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <label style={styles.label}>
                                Episode ID
                            </label>
                            <input
                                type="text"
                                value={episodeNumber}
                                onChange={(e) => setEpisodeNumber(e.target.value)}
                                placeholder="e.g. 104"
                                style={styles.input}
                                disabled={uploading}
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
                                Episode Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. The Future of AI"
                                style={styles.input}
                                disabled={uploading}
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
                    </div>

                    <Dropzone onFileSelect={handleUpload} disabled={uploading} />

                    {uploading && (
                        <div style={styles.uploadCard}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>
                                        {uploadSuccess ? "Upload Complete!" : "Uploading Episode"}
                                    </h3>
                                    <p style={{ fontSize: '0.875rem', color: '#888888' }}>
                                        {uploadSuccess ? "AI processing started..." : "Securely transferring to CADA Cloud..."}
                                    </p>
                                </div>
                                <span style={{ fontSize: '2.25rem', fontWeight: 700, color: 'white' }}>
                                    {Math.round(progress)}%
                                </span>
                            </div>

                            {/* Progress Bar Container */}
                            <div style={{
                                width: '100%',
                                height: '24px',
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                borderRadius: '9999px',
                                overflow: 'hidden',
                                position: 'relative',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                {/* Animated Fill */}
                                <div style={{
                                    height: '100%',
                                    borderRadius: '9999px',
                                    transition: 'width 300ms ease-out',
                                    width: `${Math.max(progress, 5)}%`,
                                    background: uploadSuccess
                                        ? 'linear-gradient(to right, #22c55e, #4ade80)'
                                        : 'linear-gradient(to right, #2563eb, #60a5fa, #ffffff)',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end'
                                }}>
                                    {/* Shimmer Overlay */}
                                    <div className="animate-shimmer" style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.5) 50%, transparent 75%)',
                                        backgroundSize: '250% 250%'
                                    }}></div>
                                </div>
                            </div>

                            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '0.875rem', color: '#888888', fontWeight: 500 }}>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: uploadSuccess ? '#22c55e' : '#3b82f6',
                                    boxShadow: uploadSuccess ? '0 0 10px rgba(34,197,94,0.5)' : 'none'
                                }}></div>
                                {uploadSuccess ? "Success! You can close this window." : "Do not close this window"}
                            </div>
                        </div>
                    )}
                </div>

                {/* MFA and Settings - Commented out for now
                <MFAEnrollment />

                <AdminSettings
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    user={user}
                />
                */}
            </div>
        </div>
    );
}
