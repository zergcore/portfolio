"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { FiUploadCloud, FiX, FiLoader, FiStar } from "react-icons/fi";
import { uploadImageAction } from "@/app/actions/uploads";

export interface ProjectImage {
  url: string;
  public_id: string;
  is_primary: boolean;
}

interface MultiImageUploadProps {
  label: string;
  images: ProjectImage[];
  onChange: (images: ProjectImage[]) => void;
  maxImages?: number;
}

export default function MultiImageUpload({ 
  label, 
  images, 
  onChange, 
  maxImages = 5 
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (images.length >= maxImages) {
      alert(`Maximum of ${maxImages} images allowed.`);
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadImageAction(formData);

      if (res.success && res.url && res.public_id) {
        const newImage: ProjectImage = {
          url: res.url,
          public_id: res.public_id,
          is_primary: images.length === 0 // First image is primary by default
        };
        onChange([...images, newImage]);
      } else {
        alert(res.error || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("An unexpected error occurred during upload");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    // If we removed the primary image, set the first remaining one as primary
    if (images[index].is_primary && newImages.length > 0) {
      newImages[0].is_primary = true;
    }
    onChange(newImages);
  };

  const setPrimary = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      is_primary: i === index
    }));
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-[var(--text-secondary)]">{label}</label>
        <span className="text-xs text-[var(--text-muted)]">{images.length} / {maxImages}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {images.map((img, index) => (
          <div key={img.public_id} className="relative aspect-video rounded-xl overflow-hidden border border-[var(--border-subtle)] group">
            <Image 
              src={img.url} 
              alt={`Project image ${index + 1}`} 
              fill 
              className="object-cover"
              unoptimized 
            />
            
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPrimary(index)}
                className={`p-2 rounded-full transition-colors ${
                  img.is_primary ? "bg-[var(--accent-yellow)] text-white" : "bg-white/20 text-white hover:bg-white/40"
                }`}
                title={img.is_primary ? "Primary Image" : "Set as Primary"}
              >
                <FiStar className={img.is_primary ? "fill-current" : ""} />
              </button>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="p-2 rounded-full bg-white/20 text-white hover:bg-[var(--color-error)] transition-colors"
                title="Remove Image"
              >
                <FiX />
              </button>
            </div>

            {img.is_primary && (
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[var(--accent-yellow)] text-black text-[10px] font-bold uppercase tracking-wider">
                Primary
              </div>
            )}
          </div>
        ))}

        {images.length < maxImages && (
          <div 
            className={`relative rounded-xl border-2 border-dashed transition-all duration-300 aspect-video flex flex-col items-center justify-center p-4 ${
              isUploading 
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
            {isUploading ? (
              <FiLoader className="w-6 h-6 text-[var(--accent-cyan)] animate-spin" />
            ) : (
              <>
                <FiUploadCloud className="w-6 h-6 text-[var(--text-muted)] mb-1" />
                <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase">Add Image</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
