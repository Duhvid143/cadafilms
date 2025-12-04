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
                            style={{ backgroundColor: '#111827' }} // Force bg-gray-900
                        >
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <h3 className="text-xl text-white font-semibold mb-2 tracking-wide">
                                        {uploadSuccess ? "Upload Complete!" : "Uploading Episode"}
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                        {uploadSuccess ? "AI processing started..." : "Securely transferring to CADA Cloud..."}
                                    </p>
                                </div>
                                <span className="text-4xl font-bold text-white tabular-nums tracking-tight">
                                    {Math.round(progress)}%
                                </span>
                            </div>

                            {/* Progress Bar Container */}
                            <div
                                className="w-full rounded-full h-6 overflow-hidden border border-gray-700 relative"
                                style={{ backgroundColor: '#1f2937' }} // Force bg-gray-800
                            >
                                {/* Animated Fill */}
                                <div
                                    className="h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden flex items-center justify-end pr-2"
                                    style={{
                                        width: `${Math.max(progress, 5)}%`,
                                        background: uploadSuccess
                                            ? 'linear-gradient(to right, #22c55e, #4ade80)' // Green for success
                                            : 'linear-gradient(to right, #2563eb, #60a5fa, #ffffff)' // Blue for upload
                                    }}
                                >
                                    {/* Shimmer Overlay */}
                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.5)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer"></div>

                                    {/* Glowing Leading Edge */}
                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,1)]"></div>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-center gap-3 text-sm text-gray-400 font-medium">
                                <div className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)] ${uploadSuccess ? 'bg-green-500' : 'bg-blue-500'}`}></div>
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
