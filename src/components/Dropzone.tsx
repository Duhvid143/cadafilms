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
            'video/quicktime': ['.mov']
        },
        maxFiles: 1,
        disabled
    });

    return (
        <div
            {...getRootProps()}
            className={`
        border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors
        ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
        >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center gap-4">
                <UploadCloud className="w-12 h-12 text-gray-400" />
                {isDragActive ? (
                    <p className="text-lg text-blue-500">Drop the video here...</p>
                ) : (
                    <div className="space-y-1">
                        <p className="text-lg font-medium text-gray-700">
                            Drag & drop your episode here
                        </p>
                        <p className="text-sm text-gray-500">
                            or click to select (MP4, MOV)
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
