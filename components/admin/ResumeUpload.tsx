"use client";

import { useState, useRef } from "react";
import { uploadResumeAction } from "@/app/actions/uploads";
import {
  FiUploadCloud,
  FiX,
  FiFileText,
  FiLoader,
  FiExternalLink,
} from "react-icons/fi";

interface ResumeUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

export default function ResumeUpload({
  label,
  value,
  onChange,
  className = "",
}: ResumeUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Only PDF files are accepted.");
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large (max 10MB)");
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadResumeAction(formData);

      if (res.success && res.url) {
        onChange(res.url);
      } else {
        setError(res.error || "Upload failed");
      }
    } catch (err) {
      console.error("Resume upload error:", err);
      setError("An unexpected error occurred during upload");
    } finally {
      setIsUploading(false);
    }
  };

  const clearResume = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Extract a display name from the URL
  const getFileName = (url: string) => {
    try {
      const parts = url.split("/");
      const raw = parts[parts.length - 1];
      return decodeURIComponent(raw);
    } catch {
      return "resume.pdf";
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-(--text-secondary)">
        {label}
      </label>

      <div
        className={`relative group rounded-xl border-2 border-dashed transition-all duration-300 min-h-[100px] flex flex-col items-center justify-center p-4 ${
          value
            ? "border-(--accent-violet)/30 bg-(--accent-violet)/5"
            : "border-(--border-subtle) hover:border-(--accent-violet)/50 hover:bg-(--bg-elevated)"
        }`}
      >
        {!value && (
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            disabled={isUploading}
          />
        )}

        {value ? (
          <div className="flex items-center gap-4 w-full">
            {/* PDF Icon */}
            <div className="shrink-0 w-12 h-12 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <FiFileText className="w-6 h-6 text-red-400" />
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {getFileName(value)}
              </p>
              <p className="text-xs text-(--text-muted) mt-0.5">
                PDF Document • Uploaded to Cloudinary
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-(--text-secondary) hover:text-(--accent-cyan) hover:bg-(--accent-cyan)/10 transition-colors"
                title="Preview PDF"
              >
                <FiExternalLink size={16} />
              </a>
              <label
                className="p-2 rounded-lg text-(--text-secondary) hover:text-(--accent-violet) hover:bg-(--accent-violet)/10 transition-colors cursor-pointer"
                title="Replace PDF"
              >
                <FiUploadCloud size={16} />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="application/pdf"
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  clearResume();
                }}
                className="p-2 rounded-lg text-(--text-secondary) hover:text-red-400 hover:bg-red-400/10 transition-colors"
                title="Remove PDF"
              >
                <FiX size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-2 pointer-events-none">
            {isUploading ? (
              <>
                <FiLoader className="w-8 h-8 text-(--accent-violet) animate-spin" />
                <p className="text-sm text-(--text-secondary) font-medium">
                  Uploading resume...
                </p>
              </>
            ) : (
              <>
                <div className="p-3 rounded-full bg-(--bg-elevated) text-(--text-muted) group-hover:text-(--accent-violet) transition-colors">
                  <FiFileText size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Click to Upload Resume
                  </p>
                  <p className="text-xs text-(--text-muted) mt-1">
                    PDF only (max 10MB)
                  </p>
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
