import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import { fetchCategories, createProduct } from '@/lib/api';
import type { Category } from '@/types';
import ImageUploader from '@/components/admin/ImageUploader';

export default function AdminAddProduct() {
  const navigate = useNavigate();

  // Categories list
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  // Form Fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [size, setSize] = useState('10 Inch');
  const [shape, setShape] = useState('Round');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  // Images State (Cloudinary uploaded)
  const [thumbnailImage, setThumbnailImage] = useState<Array<{ url: string; public_id?: string }>>([]);
  const [galleryImages, setGalleryImages] = useState<Array<{ url: string; public_id?: string }>>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCats() {
      try {
        const data = await fetchCategories(true);
        setCategories(data);
        if (data.length > 0) {
          setCategoryId(data[0]._id || data[0].id || '');
        }
      } catch (err) {
        console.error('Error fetching categories for dropdown:', err);
      } finally {
        setLoadingCats(false);
      }
    }
    loadCats();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) return setError('Product name is required');
    if (!categoryId) return setError('Please select a category');
    if (!size.trim()) return setError('Please enter size');
    if (!description.trim()) return setError('Please enter product description');
    if (thumbnailImage.length === 0) return setError('Please upload at least one main product image');

    setSubmitting(true);

    try {
      const allImageUrls = [thumbnailImage[0].url, ...galleryImages.map((g) => g.url)];
      const publicIds = [
        thumbnailImage[0].public_id,
        ...galleryImages.map((g) => g.public_id),
      ].filter(Boolean) as string[];

      await createProduct({
        name: name.trim(),
        category: categoryId,
        subCategory: subCategory.trim(),
        size: size.trim(),
        shape,
        description: description.trim(),
        thumbnail: thumbnailImage[0].url,
        images: allImageUrls,
        cloudinaryPublicIds: publicIds,
        status,
      });

      navigate('/admin/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 rounded-xl text-[#1F4D36] bg-white border border-[#1F4D36]/15 hover:bg-[#FAF3E8] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-serif text-3xl text-[#1F4D36] font-bold">Add New Product</h1>
            <p className="font-sans text-xs text-[#64748B] mt-0.5">
              Create a new eco-friendly product listing for Sharmila Leafware
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-[24px] bg-white border border-[#1F4D36]/15 shadow-sm space-y-6">
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div className="md:col-span-2">
            <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-[#1F4D36] mb-2">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 10 Inch Round Areca Leaf Plate"
              className="w-full px-4 py-3.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36] focus:bg-white"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-[#1F4D36] mb-2">
              Category *
            </label>
            {loadingCats ? (
              <div className="py-3 text-xs text-[#64748B]">Loading categories...</div>
            ) : (
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36] focus:bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat._id || cat.id} value={cat._id || cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Sub Category */}
          <div>
            <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-[#1F4D36] mb-2">
              Sub Category (Optional)
            </label>
            <input
              type="text"
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              placeholder="e.g. Catering / Dinnerware"
              className="w-full px-4 py-3.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36] focus:bg-white"
            />
          </div>

          {/* Size */}
          <div>
            <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-[#1F4D36] mb-2">
              Size *
            </label>
            <input
              type="text"
              required
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="e.g. 10 Inch / 25 cm"
              className="w-full px-4 py-3.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36] focus:bg-white"
            />
          </div>

          {/* Shape */}
          <div>
            <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-[#1F4D36] mb-2">
              Shape
            </label>
            <select
              value={shape}
              onChange={(e) => setShape(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36] focus:bg-white"
            >
              <option value="Round">Round</option>
              <option value="Square">Square</option>
              <option value="Rectangle">Rectangle</option>
              <option value="Compartment">Compartment</option>
              <option value="Bowl">Bowl</option>
              <option value="Tray">Tray</option>
            </select>
          </div>


          {/* Description */}
          <div className="md:col-span-2">
            <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-[#1F4D36] mb-2">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Premium quality natural areca leaf plate suitable for functions, catering and food service."
              className="w-full px-4 py-3.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36] focus:bg-white resize-y"
            />
          </div>

          {/* Image Upload Section */}
          <div className="md:col-span-2 pt-4 border-t border-slate-100 space-y-6">
            <h3 className="font-serif text-lg font-bold text-[#1F4D36]">Product Images (Cloudinary Upload)</h3>

            {/* Main Thumbnail Image */}
            <ImageUploader
              label="Main Product Image (Thumbnail) *"
              images={thumbnailImage}
              onChange={setThumbnailImage}
              multiple={false}
            />

            {/* Additional Images */}
            <ImageUploader
              label="Additional Gallery Images (Optional)"
              images={galleryImages}
              onChange={setGalleryImages}
              multiple={true}
              maxFiles={4}
            />
          </div>

          {/* Status */}
          <div className="md:col-span-2 pt-4 border-t border-slate-100">
            <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-[#1F4D36] mb-2">
              Publication Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
              className="w-full px-4 py-3.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36] focus:bg-white"
            >
              <option value="active">Active (Visible on public store)</option>
              <option value="inactive">Inactive (Draft / Hidden)</option>
            </select>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
          <Link
            to="/admin/products"
            className="px-6 py-3.5 rounded-xl font-sans text-xs font-semibold text-[#64748B] bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-sans text-xs font-semibold text-white bg-[#1F4D36] hover:bg-[#163827] disabled:opacity-50 transition-all shadow-md"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Product...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Product
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
