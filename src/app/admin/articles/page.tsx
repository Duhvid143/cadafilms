"use client";
import { useState } from "react";
import logger from "@/lib/logger";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { storage, db, auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import Dropzone from "@/components/Dropzone";
import { Upload, FileText, LayoutDashboard, LogOut, X } from "lucide-react";
import AdminAuthGuard from "@/components/AdminAuthGuard";

export default function ArticlesPage() {
    const [uploading, setUploading] = useState(false);
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [content, setContent] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);

    const router = useRouter();

    const handleFileSelect = (file: File) => {
        setSelectedFile(file);
        logger.info({ fileName: file.name, size: file.size }, "Cover image selected.");
    };

    const clearFile = () => {
        setSelectedFile(null);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setTitle(val);
        // Auto-generate slug
        setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    };

    const publishArticle = async () => {
        if (!title || !slug || !content || !selectedFile) {
            toast.error("Please fill in all fields and select a cover image.");
            return;
        }

        setUploading(true);

        try {
            // 1. Upload Cover Image
            const storageRef = ref(storage, `articles/${slug}/${selectedFile.name}`);
            const uploadTask = uploadBytesResumable(storageRef, selectedFile);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setProgress(p);
                },
                (error) => {
                    logger.error({ error }, "Image upload failed.");
                    toast.error("Image upload failed: " + error.message);
                    setUploading(false);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                    // 2. Save Article to Firestore
                    await addDoc(collection(db, "articles"), {
                        title: title.trim(),
                        slug: slug.trim(),
                        coverImageUrl: downloadURL,
                        content: content,
                        createdAt: new Date().toISOString(), // Use simple string for consistency with type
                        updatedAt: new Date().toISOString()
                    });

                    toast.success("Article published successfully!");
                    setUploading(false);
                    // Reset form
                    setTitle("");
                    setSlug("");
                    setContent("");
                    setSelectedFile(null);
                    setProgress(0);
                }
            );

        } catch (error: any) {
            logger.error({ error }, "Error publishing article");
            toast.error("Failed to publish: " + error.message);
            setUploading(false);
        }
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

    // Reuse Upload Page Styles for consistency
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
            transition: 'all 0.3s ease',
            marginBottom: '2rem'
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
            marginBottom: '2rem',
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
        <AdminAuthGuard>
            <div style={styles.page}>
                <div style={styles.container}>
                    <div style={styles.header}>
                        <div>
                            <h1 style={styles.title}>Articles</h1>
                            <p className="text-white/40 font-light text-lg">
                                Publish new content for TIUM
                            </p>
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
                        >
                            <span>Logout</span>
                            <LogOut size={14} />
                        </button>
                    </div>

                    <div style={styles.formContainer}>
                        {/* Title & Slug */}
                        <label style={styles.label}>Article Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={handleTitleChange}
                            placeholder="e.g. The Philosophy of TIUM"
                            style={styles.input}
                            disabled={uploading}
                        />

                        <label style={styles.label}>Slug (Auto-generated)</label>
                        <input
                            type="text"
                            value={slug}
                            readOnly
                            style={{ ...styles.input, color: '#666' }}
                            disabled
                        />

                        {/* Cover Image */}
                        <label style={styles.label}>Cover Image</label>
                        {!selectedFile ? (
                            <Dropzone onFileSelect={handleFileSelect} disabled={uploading} />
                        ) : (
                            <div style={styles.fileCard}>
                                <div className="p-3 bg-blue-500/20 rounded-full text-blue-400">
                                    <FileText size={24} />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-white font-medium truncate">{selectedFile.name}</p>
                                    <p className="text-sm text-gray-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                </div>
                                <button
                                    onClick={clearFile}
                                    className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                                    disabled={uploading}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        )}

                        {/* Content */}
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
                                marginTop: '1rem',
                                opacity: uploading ? 0.7 : 1
                            }}
                        >
                            <Upload size={20} />
                            {uploading ? (progress < 100 ? `Uploading Image ${Math.round(progress)}%` : "Saving...") : "Publish Article"}
                        </button>

                    </div>
                </div>

                {/* View Dashboard FAB */}
                <Link
                    href="/admin/dashboard"
                    style={styles.fab}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    title="View Dashboard"
                >
                    <LayoutDashboard className="w-8 h-8" />
                </Link>
            </div>
        </AdminAuthGuard>
    );
}
