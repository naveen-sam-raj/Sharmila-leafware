import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { uploadImageToCloudinary } from '@/lib/api';

export interface ImageItem {
  url: string;
  public_id?: string;
  isUploading?: boolean;
  instanceId?: string;
}

interface ImageUploaderProps {
  label: string;
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  multiple?: boolean;
  maxFiles?: number;
}

export default function ImageUploader({
  label,
  images = [],
  onChange,
  multiple = false,
  maxFiles = 5,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ref to always read the LATEST images list inside async callbacks (no stale closure)
  const imagesRef = useRef<ImageItem[]>(images);
  imagesRef.current = images;

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|heic|heif|dng|bmp)$/i.test(file.name);

      if (!isImage) {
        setError(`"${file.name}" is an unsupported format. Please upload an image file.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setError(`"${file.name}" exceeds 50MB maximum file size.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      validFiles.push(file);
      if (!multiple) break;
    }

    if (validFiles.length === 0) return;

    setUploading(true);

    // Step 1: create blob URLs for INSTANT preview before server upload
    const pendingItems: ImageItem[] = validFiles.map((file) => ({
      url: URL.createObjectURL(file),
      instanceId: `${Date.now()}-${Math.random()}`,
      isUploading: true,
    }));

    // Step 2: Build updated list
    let currentList: ImageItem[];
    if (multiple) {
      const current = imagesRef.current;
      const spaceLeft = Math.max(0, maxFiles - current.length);
      currentList = [...current, ...pendingItems.slice(0, spaceLeft)];
    } else {
      const existing = imagesRef.current[0];
      if (existing?.url?.startsWith('blob:')) {
        URL.revokeObjectURL(existing.url);
      }
      currentList = [pendingItems[0]];
    }

    // Step 3: Show the blob preview IMMEDIATELY
    onChange(currentList);

    // Step 4: Upload to Cloudinary in background
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const pending = pendingItems[i];
      if (!pending) continue;

      try {
        const uploaded = await uploadImageToCloudinary(file);

        // Use imagesRef.current to avoid stale closure
        const fresh = imagesRef.current;
        const nextList = fresh.map((img) => {
          if (img.instanceId === pending.instanceId) {
            if (img.url.startsWith('blob:')) URL.revokeObjectURL(img.url);
            return {
              url: uploaded.url,
              public_id: uploaded.public_id,
              instanceId: pending.instanceId,
              isUploading: false,
            };
          }
          return img;
        });
        onChange(nextList);
      } catch (err) {
        console.error('Cloudinary upload error:', err);
        const errorMsg = err instanceof Error ? err.message : 'Upload failed';
        setError(`Upload error: ${errorMsg}. Your selected image preview is still shown.`);

        const fresh = imagesRef.current;
        const nextList = fresh.map((img) =>
          img.instanceId === pending.instanceId ? { ...img, isUploading: false } : img
        );
        onChange(nextList);
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [multiple, maxFiles, onChange]);

  const handleRemove = useCallback((index: number) => {
    const item = imagesRef.current[index];
    if (item?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(item.url);
    }
    onChange(imagesRef.current.filter((_, i) => i !== index));
  }, [onChange]);

  return (
    <div>
      <label className="block font-sans text-xs font-semibold tracking-wider text-[#1F4D36] uppercase mb-2">
        {label}
      </label>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        multiple={multiple}
        className="hidden"
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
        {images.map((img, index) => (
          <div
            key={img.instanceId || img.public_id || img.url}
            className="relative group aspect-square rounded-2xl overflow-hidden bg-[#FAF3E8]/30 border border-[#1F4D36]/20 shadow-sm flex items-center justify-center p-1"
          >
            <img
              key={img.url}
              src={img.url}
              alt={`Preview ${index + 1}`}
              className="w-full h-full object-contain"
            />

            {img.isUploading && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex flex-col items-center justify-center text-white text-[10px] font-sans gap-1.5 p-2 text-center">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Uploading...</span>
              </div>
            )}

            {!img.isUploading && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-8 h-8 rounded-full bg-white text-[#1F4D36] flex items-center justify-center hover:bg-slate-100 transition-colors shadow-md"
                  title="Change image"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors shadow-md"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {index === 0 && !multiple && (
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-sans font-bold bg-[#1F4D36] text-white">
                Main Image
              </span>
            )}
          </div>
        ))}

        {(multiple ? images.length < maxFiles : images.length === 0) && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-2xl border-2 border-dashed border-[#1F4D36]/30 bg-[#FAF3E8]/50 hover:bg-[#FAF3E8] hover:border-[#1F4D36]/60 transition-all flex flex-col items-center justify-center p-4 text-center group disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2 className="w-6 h-6 text-[#1F4D36] animate-spin mb-2" />
                <span className="font-sans text-xs font-medium text-[#1F4D36]">Processing...</span>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-[#1F4D36]/10 text-[#1F4D36] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="font-sans text-xs font-semibold text-[#1F4D36]">
                  {multiple ? 'Add Image' : 'Upload Image'}
                </span>
                <span className="font-sans text-[10px] text-[#64748B] mt-1">JPG, PNG, WebP · Max 5MB</span>
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200 mt-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
