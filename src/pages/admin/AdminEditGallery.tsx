import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import { fetchGallery, updateGalleryItem, deleteImageFromCloudinary } from '@/lib/api';
import type { GalleryCategoryEnum, GalleryItem } from '@/types';
import ImageUploader from '@/components/admin/ImageUploader';

const CATEGORY_OPTIONS: Array<{ value: GalleryCategoryEnum; label: string }> = [
  { value: 'FINISHED_PRODUCTS', label: 'Finished Products' },
  { value: 'MANUFACTURING', label: 'Manufacturing' },
  { value: 'RAW_MATERIALS', label: 'Raw Materials' },
  { value: 'PACKING', label: 'Packing' },
  { value: 'WAREHOUSE', label: 'Warehouse' },
  { value: 'EXPORT_CONTAINERS', label: 'Export Containers' },
];

export default function AdminEditGallery() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<GalleryItem | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GalleryCategoryEnum>('FINISHED_PRODUCTS');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('1');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const [galleryImages, setGalleryImages] = useState<Array<{ url: string; public_id?: string }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);
      try {
        const list = await fetchGallery({ includeInactive: true });
        const target = list.find((g) => g._id === id || g.id === id);

        if (!target) {
          setError('Gallery item not found');
          return;
        }

        setItem(target);
        setTitle(target.title);
        setCategory(target.category as GalleryCategoryEnum);
        setDescription(target.description || '');
        setDisplayOrder(String(target.displayOrder ?? target.sort_order ?? 1));
        setStatus(target.status || 'active');

        const imgUrl = target.imageUrl || target.image_url || '';
        if (imgUrl) {
          setGalleryImages([{ url: imgUrl, public_id: target.cloudinaryPublicId }]);
        }
      } catch (err) {
        setError('Failed to load gallery item');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!id) return;
    if (galleryImages.length === 0) return setError('Please upload a gallery image.');
    if (!title.trim()) return setError('Please enter a title.');

    setSubmitting(true);

    try {
      const newImg = galleryImages[0];
      const oldPid = item?.cloudinaryPublicId;

      // Safe destroy old image if replaced
      if (oldPid && newImg.public_id && oldPid !== newImg.public_id) {
        try {
          await deleteImageFromCloudinary(oldPid);
        } catch (delErr) {
          console.warn('Failed to cleanup old image:', oldPid);
        }
      }

      await updateGalleryItem(id, {
        title: title.trim(),
        description: description.trim(),
        category,
        imageUrl: newImg.url,
        cloudinaryPublicId: newImg.public_id || '',
        displayOrder: Number(displayOrder) || 1,
        status,
      });

      navigate('/admin/gallery');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update gallery item');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-[#1F4D36]">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
        <span className="font-sans text-xs font-semibold">Loading item details...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/admin/gallery"
          className="p-2 rounded-xl text-[#1F4D36] bg-white border border-[#1F4D36]/15 hover:bg-[#FAF3E8] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-serif text-3xl text-[#1F4D36] font-bold">Edit Gallery Item</h1>
          <p className="font-sans text-xs text-[#64748B] mt-0.5">
            Update image, category, title, or display order for "{item?.title}"
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-[24px] bg-white border border-[#1F4D36]/15 shadow-sm space-y-6">
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Cloudinary Image Uploader */}
        <ImageUploader
          label="Gallery Image (Cloudinary Upload) *"
          images={galleryImages}
          onChange={setGalleryImages}
          multiple={false}
        />

        <div>
          <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-[#1F4D36] mb-2">
            Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36] focus:bg-white"
          />
        </div>

        <div>
          <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-[#1F4D36] mb-2">
            Gallery Category *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as GalleryCategoryEnum)}
            className="w-full px-4 py-3.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36] focus:bg-white"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-[#1F4D36] mb-2">
            Description (Optional)
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36] focus:bg-white resize-y"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-[#1F4D36] mb-2">
              Display Order
            </label>
            <input
              type="number"
              min="0"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36] focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-[#1F4D36] mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
              className="w-full px-4 py-3.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36] focus:bg-white"
            >
              <option value="active">Active (Visible on customer gallery)</option>
              <option value="inactive">Inactive (Hidden)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
          <Link
            to="/admin/gallery"
            className="px-6 py-3.5 rounded-xl font-sans text-xs font-semibold text-[#64748B] bg-slate-100 hover:bg-slate-200"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-sans text-xs font-semibold text-white bg-[#1F4D36] hover:bg-[#163827] disabled:opacity-50 shadow-md"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating Item...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Update Item
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
