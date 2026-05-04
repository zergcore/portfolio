"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { FiUploadCloud, FiX, FiCheckCircle, FiLoader } from "react-icons/fi";
import { uploadImageAction } from "@/app/actions/uploads";

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

export default function ImageUpload({ label, value, onChange, className = "" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large (max 5MB)");
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadImageAction(formData);

      if (res.success && res.url) {
        onChange(res.url);
      } else {
        alert(res.error || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("An unexpected error occurred during upload");
    } finally {
      setIsUploading(false);
    }
  };

  const clearImage = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-[var(--text-secondary)]">{label}</label>
      
      <div 
        className={`relative group rounded-xl border-2 border-dashed transition-all duration-300 min-h-[140px] flex flex-col items-center justify-center p-4 ${
          value 
            ? "border-[var(--accent-cyan)]/30 bg-[var(--accent-cyan)]/5" 
            : "border-[var(--border-subtle)] hover:border-[var(--accent-cyan)]/50 hover:bg-[var(--bg-elevated)]"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          disabled={isUploading}
        />

        {value ? (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-[var(--border-subtle)]">
            <Image 
              src={value} 
              alt="Preview" 
              fill 
              className="object-cover"
              unoptimized 
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                clearImage();
              }}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-20"
            >
              <FiX size={14} />
            </button>
            <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-[var(--accent-cyan)] text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <FiCheckCircle size={10} /> Verified
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-2 pointer-events-none">
            {isUploading ? (
              <>
                <FiLoader className="w-8 h-8 text-[var(--accent-cyan)] animate-spin" />
                <p className="text-sm text-[var(--text-secondary)] font-medium">Uploading to Cloudinary...</p>
              </>
            ) : (
              <>
                <div className="p-3 rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)] group-hover:text-[var(--accent-cyan)] transition-colors">
                  <FiUploadCloud size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">Click or Drag to Upload</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">PNG, JPG or WebP (max 5MB)</p>
                </div>
              </>
            )}
          </div>
        )}

        {error && (
          <p className="mt-2 text-xs text-red-400 font-medium animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
