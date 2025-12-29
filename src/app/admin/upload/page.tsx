"use client";
import { useState, useEffect, Suspense } from "react";
import logger from "@/lib/logger";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc, getDoc, collection, addDoc } from "firebase/firestore";
import { storage, db, auth } from "@/lib/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import Dropzone from "@/components/Dropzone";
import { Upload, FileVideo, FileText, X, LayoutDashboard, LogOut, Mic } from "lucide-react";
import AdminAuthGuard from "@/components/AdminAuthGuard";
import { Episode } from "@/types";

type UploadType = 'podcast' | 'article';

function UploadContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // -- Global State --
    const [uploadType, setUploadType] = useState<UploadType>('podcast');
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // -- Podcast State --
    const [episodeNumber, setEpisodeNumber] = useState("");
    const [podcastTitle, setPodcastTitle] = useState("");
    const [uploadSuccess, setUploadSuccess] = useState(false);

    // -- Article State --
    const [articleTitle, setArticleTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [content, setContent] = useState("");

    // Initialize from URL query param
    useEffect(() => {
        const typeParam = searchParams.get('type');
        if (typeParam === 'article') {
            setUploadType('article');
        } else {
            setUploadType('podcast');
        }
    }, [searchParams]);

    // Update URL when toggling (optional, but good for bookmarking)
    const handleTypeChange = (type: UploadType) => {
        setUploadType(type);
        const newUrl = `/admin/upload?type=${type}`;
        window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);

        // Reset file selection when switching types to avoid confusion
        setSelectedFile(null);
        setProgress(0);
        setUploadSuccess(false);
    };

    const handleFileSelect = (file: File) => {
        setSelectedFile(file);
        logger.info({ fileName: file.name, size: file.size, type: uploadType }, "File selected.");

        // Auto-populate title if empty (for podcast)
        if (uploadType === 'podcast' && !podcastTitle) {
            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
            setPodcastTitle(nameWithoutExt);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setProgress(0);
        setUploadSuccess(false);
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            toast.success("Logged out successfully");
            router.push("/admin/login");
        } catch (error) {
            toast.error("Error logging out");
        }
    };

    // --- Podcast Logic ---
    const startPodcastUpload = async () => {
        if (!selectedFile) return;
        if (!episodeNumber || !podcastTitle) {
            toast.error("Please enter Episode Number and Title");
            return;
        }

        const safeEpisodeNumber = episodeNumber.trim();
        const safeTitle = podcastTitle.trim();

        setUploading(true);
        const storageRef = ref(storage, `episodes/${safeEpisodeNumber}.mp4`);

        const uploadTask = uploadBytesResumable(storageRef, selectedFile);

        uploadTask.on('state_changed',
            (snapshot) => {
                const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setProgress(p);
            },
            (error) => {
                logger.error({ error }, "Upload failed.");
                toast.error("Upload failed: " + error.message);
                setUploading(false);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                const docRef = doc(db, "episodes", safeEpisodeNumber);
                const docSnap = await getDoc(docRef);

                const dataToSet: Partial<Episode> = {
                    title: safeTitle,
                    videoUrl: downloadURL,
                    sizeBytes: selectedFile.size,
                    uploadedAt: new Date().toISOString(),
                };

                if (!docSnap.exists() || docSnap.data()?.status !== 'ready') {
                    dataToSet.status = "processing";
                }

                await setDoc(docRef, dataToSet, { merge: true });

                toast.success("Upload Complete! AI is processing...");
                setUploadSuccess(true);
                setProgress(100);

                setTimeout(() => {
                    setUploading(false);
                    setUploadSuccess(false);
                    setProgress(0);
                    setEpisodeNumber("");
                    setPodcastTitle("");
                    setSelectedFile(null);
                }, 3000);
            }
        );
    };

    // --- Article Logic ---
    const handleArticleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setArticleTitle(val);
        setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    };

    const publishArticle = async () => {
        if (!articleTitle || !slug || !content || !selectedFile) {
            toast.error("Please fill in all fields and select a cover image.");
            return;
        }

        setUploading(true);

        try {
            const storageRef = ref(storage, `articles/${slug}/${selectedFile.name}`);
            const uploadTask = uploadBytesResumable(storageRef, selectedFile);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setProgress(p);
                },
                (error) => {
                    toast.error("Image upload failed: " + error.message);
                    setUploading(false);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                    await addDoc(collection(db, "articles"), {
                        title: articleTitle.trim(),
                        slug: slug.trim(),
                        coverImageUrl: downloadURL,
                        content: content,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    });

                    toast.success("Article published successfully!");
                    setUploading(false);

                    // Reset
                    setArticleTitle("");
                    setSlug("");
                    setContent("");
                    setSelectedFile(null);
                    setProgress(0);
                }
            );

        } catch (error: any) {
            toast.error("Failed to publish: " + error.message);
            setUploading(false);
        }
    };

    // Styles
    const styles = {
        page: {
            backgroundColor: '#050505',
            minHeight: '100vh',
            paddingTop: '180px',
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
            marginBottom: '3rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end'
        },
        title: {
            fontSize: '4rem',
            fontWeight: 300,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.5rem',
            marginBottom: '0.5rem',
            color: '#ffffff',
            lineHeight: 1
        },
        toggleContainer: {
            display: 'inline-flex',
            gap: '1rem',
            marginBottom: '1rem',
            padding: '4px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '9999px',
            border: '1px solid rgba(255,255,255,0.1)'
        },
        toggleBtn: (isActive: boolean) => ({
            padding: '8px 24px',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: 600,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            background: isActive ? '#ffffff' : 'transparent',
            color: isActive ? '#000000' : 'rgba(255,255,255,0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        }),
        formContainer: {
            width: '100%',
            maxWidth: '800px',
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '4rem',
            borderRadius: '30px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative' as const
        },
        label: {
            display: 'block',
            marginBottom: '1rem',
            fontSize: '0.9rem',
            color: '#888888',
            textTransform: 'uppercase' as const,
            letterSpacing: '2px',
            lineHeight: '1.5'
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
        textarea: {
            width: '100%',
            padding: '1rem 1.5rem',
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            color: '#ffffff',
            fontSize: '1rem',
            outline: 'none',
            transition: 'all 0.3s ease',
            minHeight: '300px',
            lineHeight: '1.6',
            resize: 'vertical' as const
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
        },
        fab: {
            position: 'fixed' as const,
            bottom: '40px',
            right: '40px',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            color: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 30px rgba(255,255,255,0.2)',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            zIndex: 50
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.title}>Upload</h1>
                        <div style={styles.toggleContainer}>
                            <button
                                onClick={() => handleTypeChange('podcast')}
                                style={styles.toggleBtn(uploadType === 'podcast')}
                            >
                                <Mic size={16} />
                                Podcast
                            </button>
                            <button
                                onClick={() => handleTypeChange('article')}
                                style={styles.toggleBtn(uploadType === 'article')}
                            >
                                <FileText size={16} />
                                Article
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(10px)',
                            padding: '12px 24px',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            outline: 'none'
                        }}
                        onMouseEnter={(e) => Object.assign(e.currentTarget.style, { background: 'rgba(255,255,255,0.15)', color: '#fff' })}
                        onMouseLeave={(e) => Object.assign(e.currentTarget.style, { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.8)' })}
                    >
                        <span>Logout</span>
                        <LogOut size={14} />
                    </button>
                </div>

                <div style={styles.formContainer}>
                    {/* ==================== PODCAST FORM ==================== */}
                    {uploadType === 'podcast' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {!selectedFile && !uploading && (
                                <Dropzone onFileSelect={handleFileSelect} disabled={uploading} />
                            )}

                            {(selectedFile || uploading) && (
                                <>
                                    {!uploading && (
                                        <div style={styles.fileCard}>
                                            <div className="p-3 bg-blue-500/20 rounded-full text-blue-400">
                                                <FileVideo size={24} />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-white font-medium truncate">{selectedFile?.name}</p>
                                                <p className="text-sm text-gray-500">{(selectedFile!.size / (1024 * 1024)).toFixed(2)} MB</p>
                                            </div>
                                            <button onClick={clearFile} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                                                <X size={20} />
                                            </button>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                        <div>
                                            <label style={styles.label}>Episode ID</label>
                                            <input
                                                type="text"
                                                value={episodeNumber}
                                                onChange={(e) => setEpisodeNumber(e.target.value)}
                                                placeholder="e.g. 104"
                                                style={styles.input}
                                                disabled={uploading}
                                            />
                                        </div>
                                        <div>
                                            <label style={styles.label}>Episode Title</label>
                                            <input
                                                type="text"
                                                value={podcastTitle}
                                                onChange={(e) => setPodcastTitle(e.target.value)}
                                                placeholder="e.g. The Future of AI"
                                                style={styles.input}
                                                disabled={uploading}
                                            />
                                        </div>
                                    </div>

                                    {!uploading && (
                                        <button
                                            onClick={startPodcastUpload}
                                            style={{
                                                width: '100%', padding: '1.25rem', borderRadius: '50px',
                                                background: '#ffffff', color: '#000000', fontSize: '1rem', fontWeight: 600,
                                                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                gap: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', transition: 'all 0.3s ease', marginTop: '1rem'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                            <Upload size={20} />
                                            Start Upload
                                        </button>
                                    )}

                                    {uploading && (
                                        <div style={{ marginTop: '3rem', padding: '2rem', borderRadius: '20px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                                                <div>
                                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>
                                                        {uploadSuccess ? "Upload Complete!" : "Uploading Episode"}
                                                    </h3>
                                                    <p style={{ fontSize: '0.875rem', color: '#888888' }}>
                                                        {uploadSuccess ? "AI processing started..." : "Securely transferring to CADA Cloud..."}
                                                    </p>
                                                </div>
                                                <span style={{ fontSize: '2.25rem', fontWeight: 700, color: 'white' }}>{Math.round(progress)}%</span>
                                            </div>
                                            <div style={{ width: '100%', height: '24px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '9999px', overflow: 'hidden', position: 'relative' }}>
                                                <div style={{
                                                    height: '100%', borderRadius: '9999px', transition: 'width 300ms ease-out', width: `${Math.max(progress, 5)}%`,
                                                    background: uploadSuccess ? 'linear-gradient(to right, #22c55e, #4ade80)' : 'linear-gradient(to right, #2563eb, #60a5fa, #ffffff)'
                                                }}></div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* ==================== ARTICLE FORM ==================== */}
                    {uploadType === 'article' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <label style={styles.label}>Article Title</label>
                            <input
                                type="text"
                                value={articleTitle}
                                onChange={handleArticleTitleChange}
                                placeholder="e.g. The Philosophy of TIUM"
                                style={{ ...styles.input, marginBottom: '2rem' }}
                                disabled={uploading}
                            />

                            <label style={styles.label}>Slug (Auto-generated)</label>
                            <input
                                type="text"
                                value={slug}
                                readOnly
                                style={{ ...styles.input, color: '#666', marginBottom: '2rem' }}
                                disabled
                            />

                            <label style={styles.label}>Cover Image</label>
                            {!selectedFile ? (
                                <Dropzone
                                    onFileSelect={handleFileSelect}
                                    disabled={uploading}
                                    accept={{ 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] }}
                                    label="Drag & drop cover image"
                                    subLabel="JPG, PNG, WEBP"
                                />
                            ) : (
                                <div style={styles.fileCard}>
                                    <div className="p-3 bg-blue-500/20 rounded-full text-blue-400">
                                        <FileText size={24} />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-white font-medium truncate">{selectedFile.name}</p>
                                        <p className="text-sm text-gray-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                    </div>
                                    <button onClick={clearFile} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors" disabled={uploading}>
                                        <X size={20} />
                                    </button>
                                </div>
                            )}

                            <div style={{ marginTop: '2rem' }}>
                                <label style={styles.label}>Content</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Write your article here..."
                                    style={styles.textarea}
                                    disabled={uploading}
                                />
                            </div>

                            <button
                                onClick={publishArticle}
                                disabled={uploading}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                style={{
                                    width: '100%', padding: '1.25rem', borderRadius: '50px', background: '#ffffff', color: '#000000', fontSize: '1rem', fontWeight: 600,
                                    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                                    textTransform: 'uppercase', letterSpacing: '1px', transition: 'all 0.3s ease', marginTop: '1rem', opacity: uploading ? 0.7 : 1
                                }}
                            >
                                <Upload size={20} />
                                {uploading ? (progress < 100 ? `Uploading Image ${Math.round(progress)}%` : "Saving...") : "Publish Article"}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* View Dashboard FAB */}
            <Link
                href={{ pathname: '/admin/dashboard', query: { type: uploadType } }}
                style={styles.fab}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                title="View Dashboard"
            >
                <LayoutDashboard className="w-8 h-8" />
            </Link>
        </div>
    );
}

export default function UploadPage() {
    return (
        <AdminAuthGuard>
            <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
                <UploadContent />
            </Suspense>
        </AdminAuthGuard>
    );
}
