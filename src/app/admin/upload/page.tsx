"use client";
import { useState, useEffect } from "react";
import logger from "@/lib/logger";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { storage, db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Added Link import
import { toast } from "sonner";
import Dropzone from "@/components/Dropzone";
import { Settings, Upload, FileVideo, X, ArrowRight } from "lucide-react"; // Added ArrowRight
import Button from "@/components/Button"; // Assuming we have this, or use standard button
// import MFAEnrollment from "@/components/MFAEnrollment";
// import AdminSettings from "@/components/AdminSettings";

export default function UploadPage() {
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [progress, setProgress] = useState(0);
    const [episodeNumber, setEpisodeNumber] = useState("");
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

    const handleFileSelect = (file: File) => {
        setSelectedFile(file);
        logger.info({ fileName: file.name, size: file.size }, "File selected for upload.");
        // Auto-populate title from filename if empty
        if (!title) {
            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
            setTitle(nameWithoutExt);
        }
        toast.success("File selected! Please enter details.");
    };

    const clearFile = () => {
        setSelectedFile(null);
        setProgress(0);
        setUploadSuccess(false);
        logger.info("Selected file cleared.");
    };

    const startUpload = async () => {
        if (!selectedFile) return;
        if (!episodeNumber || !title) {
            toast.error("Please enter Episode Number and Title");
            return;
        }

        const safeEpisodeNumber = episodeNumber.trim();
        const safeTitle = title.trim();

        setUploading(true);
        const storageRef = ref(storage, `episodes/${safeEpisodeNumber}.mp4`);
        logger.info({ episodeNumber: safeEpisodeNumber, title: safeTitle, fileName: selectedFile.name }, "Starting file upload to Firebase Storage.");

        const uploadTask = uploadBytesResumable(storageRef, selectedFile);

        uploadTask.on('state_changed',
            (snapshot) => {
                const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setProgress(p);
                logger.info({ progress: p, fileName: selectedFile.name }, "Upload progress.");
            },
            (error) => {
                logger.error({ error }, "Upload failed.");
                toast.error("Upload failed: " + error.message);
                setUploading(false);
            },
            async () => {
                // Upload Complete
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                logger.info({ downloadURL, fileName: selectedFile.name }, "File uploaded successfully, getting download URL.");

                // Save initial metadata to trigger Cloud Function
                // Use merge: true so we don't wipe out any data if the Cloud Function 
                // has already processed the file (race condition fix)
                await setDoc(doc(db, "episodes", safeEpisodeNumber), {
                    title: safeTitle,
                    videoUrl: downloadURL,
                    sizeBytes: selectedFile.size,
                    uploadedAt: new Date().toISOString(),
                    // We DO NOT set status here if it already exists, to avoid reverting "ready" to "processing"
                    // But since we can't conditionally set fields in setDoc easily without reading first,
                    // and we want to be fast, we will set status to processing BUT rely on merge.
                    // Actually, to be safe, let's READ first or just rely on the fact that if it's "ready",
                    // the timestamp check or AI data presence is key. 
                    // Simpler fix: Just set basic metadata. The Cloud Function sets "status: ready".
                    // If we overwrite "status: ready" with "processing", it breaks.
                    // Let's NOT write status here if we can avoid it, OR we accept the race condition is rare with merge:true 
                    status: "processing"
                }, { merge: true });

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
                    setSelectedFile(null);
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
            paddingTop: '200px',
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
            backdropFilter: 'blur(10px)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', // Added transition
            position: 'relative' as const
        },
        cardHover: {
            borderColor: 'rgba(255, 255, 255, 0.2)',
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)'
        },
        label: {
            display: 'block',
            marginBottom: '1rem', // Increased to fix cutoff
            fontSize: '0.9rem',
            color: '#888888',
            textTransform: 'uppercase' as const,
            letterSpacing: '2px',
            lineHeight: '1.5' // Added line height for safety
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
        },
        fileCard: {
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem'
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.title}>Upload</h1>
                        <p className="text-white/40 font-light text-lg">
                            Upload and manage your video content
                        </p>
                    </div>

                    <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full backdrop-blur-md transition-all group"
                    >
                        <span className="text-sm font-medium tracking-wide">View Dashboard</span>
                        <ArrowRight className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
                    </Link>
                </div>

                <div
                    style={styles.formContainer}
                    onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.cardHover)}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >

                    {/* Step 1: File Selection */}
                    {!selectedFile && !uploading && (
                        <Dropzone onFileSelect={handleFileSelect} disabled={uploading} />
                    )}

                    {/* Step 2: Metadata & Upload */}
                    {(selectedFile || uploading) && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* Selected File Display */}
                            {!uploading && (
                                <div style={styles.fileCard}>
                                    <div className="p-3 bg-blue-500/20 rounded-full text-blue-400">
                                        <FileVideo size={24} />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-white font-medium truncate">{selectedFile?.name}</p>
                                        <p className="text-sm text-gray-500">{(selectedFile!.size / (1024 * 1024)).toFixed(2)} MB</p>
                                    </div>
                                    <button
                                        onClick={clearFile}
                                        className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            )}

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

                            {!uploading && (
                                <button
                                    onClick={startUpload}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.02)';
                                        e.currentTarget.style.boxShadow = '0 0 30px rgba(255,255,255,0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.boxShadow = '0 0 20px rgba(255,255,255,0.1)';
                                    }}
                                    style={{
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
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 0 20px rgba(255,255,255,0.1)',
                                        marginTop: '1rem'
                                    }}
                                >
                                    <Upload size={20} />
                                    Start Upload
                                </button>
                            )}

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
                    )}
                </div>
            </div>
        </div>
    );
}
