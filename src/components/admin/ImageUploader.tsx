import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { uploadImageToCloudinary } from '@/lib/api';

interface ImageUploaderProps {
  label: string;
  images: Array<{ url: string; public_id?: string }>;
  onChange: (images: Array<{ url: string; public_id?: string }>) => void;
  multiple?: boolean;
  maxFiles?: number;
}

export default function ImageUploader({
  label,
  images,
  onChange,
  multiple = false,
  maxFiles = 5,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);

    try {
      const newImages = [...images];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // File validation
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`"${file.name}" exceeds maximum allowed file size of 5MB.`);
        }
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
          throw new Error(`"${file.name}" is an unsupported file format. Please upload JPG, PNG, or WebP.`);
        }

        const uploaded = await uploadImageToCloudinary(file);
        if (multiple) {
          if (newImages.length < maxFiles) {
            newImages.push({ url: uploaded.url, public_id: uploaded.public_id });
          }
        } else {
          newImages[0] = { url: uploaded.url, public_id: uploaded.public_id };
          break;
        }
      }
      onChange(newImages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div>
      <label className="block font-sans text-xs font-semibold tracking-wider text-[#1F4D36] uppercase mb-2">
        {label}
      </label>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        multiple={multiple}
        className="hidden"
      />

      {/* Image Preview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
        {images.map((img, index) => (
          <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden bg-white border border-[#1F4D36]/20 shadow-sm">
            <img src={img.url} alt={`Uploaded ${index + 1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors shadow-md"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {index === 0 && !multiple && (
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-sans font-bold bg-[#1F4D36] text-white">
                Main Image
              </span>
            )}
          </div>
        ))}

        {/* Upload Button Box */}
        {(multiple ? images.length < maxFiles : images.length === 0) && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-2xl border-2 border-dashed border-[#1F4D36]/30 bg-[#FAF3E8]/50 hover:bg-[#FAF3E8] hover:border-[#1F4D36]/60 transition-all flex flex-col items-center justify-center p-4 text-center group"
          >
            {uploading ? (
              <>
                <Loader2 className="w-6 h-6 text-[#1F4D36] animate-spin mb-2" />
                <span className="font-sans text-xs font-medium text-[#1F4D36]">Uploading...</span>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-[#1F4D36]/10 text-[#1F4D36] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="font-sans text-xs font-semibold text-[#1F4D36]">
                  {multiple ? 'Add Image' : 'Upload Image'}
                </span>
                <span className="font-sans text-[10px] text-[#64748B] mt-1">JPG, PNG, WebP (Max 5MB)</span>
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200 mt-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
