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
                setUploading(false);
                setProgress(0);
                setEpisodeNumber("");
                setTitle("");
            }
        );
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-black pt-32 pb-20 px-4">
            <div className="max-w-3xl mx-auto">
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
                                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-white/20 focus:border-white outline-none transition-all placeholder-gray-600"
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
                                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-white/20 focus:border-white outline-none transition-all placeholder-gray-600"
                                disabled={uploading}
                            />
                        </div>
                    </div>

                    <Dropzone onFileSelect={handleUpload} disabled={uploading} />

                    {uploading && (
                        <div className="mt-8 space-y-3">
                            <div className="flex justify-between text-sm text-gray-400">
                                <span>Uploading to Cloud Storage...</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-white h-full rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 text-center mt-2">
                                Please do not close this window until upload is complete.
                            </p>
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
