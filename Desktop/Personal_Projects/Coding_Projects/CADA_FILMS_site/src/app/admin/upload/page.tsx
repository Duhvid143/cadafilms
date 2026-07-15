"use client";
import { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { storage, db } from "@/lib/firebase";
import { toast } from "sonner";
import Dropzone from "@/components/Dropzone";

export default function UploadPage() {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [episodeNumber, setEpisodeNumber] = useState("");
    const [title, setTitle] = useState("");

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
                toast.error("Upload failed");
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

    return (
        <div className="min-h-screen bg-gray-50 p-10">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-8">
                <h1 className="text-3xl font-bold mb-8 text-gray-900">Sunday Upload</h1>

                <div className="space-y-6 mb-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Episode Number (ID)
                        </label>
                        <input
                            type="text"
                            value={episodeNumber}
                            onChange={(e) => setEpisodeNumber(e.target.value)}
                            placeholder="e.g. 104"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            disabled={uploading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Episode Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. The Future of AI"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            disabled={uploading}
                        />
                    </div>
                </div>

                <Dropzone onFileSelect={handleUpload} disabled={uploading} />

                {uploading && (
                    <div className="mt-8 space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Uploading...</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
