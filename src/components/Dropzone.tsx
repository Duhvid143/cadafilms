"use client";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone"; // Need to install react-dropzone
import { UploadCloud } from "lucide-react";

interface DropzoneProps {
    onFileSelect: (file: File) => void;
    disabled?: boolean;
}

export default function Dropzone({ onFileSelect, disabled }: DropzoneProps) {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles?.length > 0) {
            onFileSelect(acceptedFiles[0]);
        }
    }, [onFileSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'video/mp4': ['.mp4'],
            'video/quicktime': ['.mov'],
            'audio/mpeg': ['.mp3']
        },
        maxFiles: 1,
        disabled
    });

    return (
        <div
            {...getRootProps()}
            className={`
        border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300
        ${isDragActive ? 'border-white bg-white/5 scale-[1.02]' : 'border-gray-700 hover:border-gray-500 hover:bg-white/5'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
        >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-4">
                <div className={`p-4 rounded-full ${isDragActive ? 'bg-white/10' : 'bg-gray-800'}`}>
                    <UploadCloud className={`w-8 h-8 ${isDragActive ? 'text-white' : 'text-gray-400'}`} />
                </div>
                <div>
                    <p className="text-lg font-medium text-white">
                        {isDragActive ? "Drop it like it's hot" : "Drag & drop your episode here"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        or click to select (MP4, MOV, MP3)
                    </p>
                </div>
            </div>
        </div>
    );
}
