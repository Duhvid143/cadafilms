"use client";
import { useState, useEffect } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { storage, db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Dropzone from "@/components/Dropzone";
import Button from "@/components/Button";
import { Upload, Settings } from "lucide-react";
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

    return (
        <div className="min-h-screen w-full bg-black flex flex-col items-center px-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', width: '100%', paddingTop: '250px' }}>
            <div className="w-full max-w-3xl">
                <div className="mb-10 flex items-end justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Upload Episode</h1>
                        <p className="text-gray-400">Drag and drop your video file to begin processing.</p>
                    </div>
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="p-3 bg-gray-900 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-all border border-gray-800"
                        title="Account Settings"
                    >
                        <Settings size={24} />
                    </button>
                </div>

                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 backdrop-blur-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Episode Number (ID)
                            </label>
                            <input
                                type="text"
                                value={episodeNumber}
                                onChange={(e) => setEpisodeNumber(e.target.value)}
                                placeholder="e.g. 104"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-white/20 focus:border-white/50 outline-none transition-all placeholder-gray-500 backdrop-blur-sm"
                                disabled={uploading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Episode Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. The Future of AI"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-white/20 focus:border-white/50 outline-none transition-all placeholder-gray-500 backdrop-blur-sm"
                                disabled={uploading}
                            />
                        </div>
                    </div>

                    <Dropzone onFileSelect={handleUpload} disabled={uploading} />

                    {uploading && (
                        <div
                            className="mt-12 p-8 rounded-2xl shadow-2xl border border-gray-800"
                            style={{
                                backgroundColor: '#111827', // bg-gray-900
                                marginTop: '3rem',
                                padding: '2rem',
                                borderRadius: '1rem',
                                border: '1px solid #1f2937'
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-end',
                                    marginBottom: '1.5rem'
                                }}
                            >
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>
                                        {uploadSuccess ? "Upload Complete!" : "Uploading Episode"}
                                    </h3>
                                    <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                                        {uploadSuccess ? "AI processing started..." : "Securely transferring to CADA Cloud..."}
                                    </p>
                                </div>
                                <span style={{ fontSize: '2.25rem', fontWeight: 700, color: 'white' }}>
                                    {Math.round(progress)}%
                                </span>
                            </div>

                            {/* Progress Bar Container */}
                            <div
                                style={{
                                    width: '100%',
                                    height: '24px',
                                    backgroundColor: '#374151', // bg-gray-700
                                    borderRadius: '9999px',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    border: '1px solid #4b5563'
                                }}
                            >
                                {/* Animated Fill */}
                                <div
                                    style={{
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
                                    }}
                                >
                                    {/* Shimmer Overlay */}
                                    <div className="animate-shimmer" style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.5) 50%, transparent 75%)',
                                        backgroundSize: '250% 250%'
                                    }}></div>
                                </div>
                            </div>

                            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '0.875rem', color: '#9ca3af', fontWeight: 500 }}>
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

                <MFAEnrollment />

                <AdminSettings
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    user={user}
                />
            </div>
        </div>
    );
}
