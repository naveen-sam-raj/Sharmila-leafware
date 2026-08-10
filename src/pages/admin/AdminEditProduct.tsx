import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import { fetchCategories, fetchProductBySlug, updateProduct, deleteImageFromCloudinary } from '@/lib/api';
import type { Category, Product } from '@/types';
import ImageUploader from '@/components/admin/ImageUploader';

export default function AdminEditProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [size, setSize] = useState('');
  const [shape, setShape] = useState('Round');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  // Images State
  const [thumbnailImage, setThumbnailImage] = useState<Array<{ url: string; public_id?: string }>>([]);
  const [galleryImages, setGalleryImages] = useState<Array<{ url: string; public_id?: string }>>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);
      try {
        const [catsData, productData] = await Promise.all([
          fetchCategories(true),
          fetchProductBySlug(id),
        ]);

        setCategories(catsData);

        if (!productData) {
          setError('Product not found.');
          return;
        }

        setProduct(productData);
        setName(productData.name);

        const catVal =
          typeof productData.category === 'object' && productData.category
            ? productData.category._id || productData.category.id || ''
            : (productData.category as string) || productData.category_id || '';
        setCategoryId(catVal);

        setSubCategory(productData.subCategory || '');
        setSize(productData.size || (productData.sizes ? productData.sizes[0] : '10 Inch'));
        setShape(productData.shape || 'Round');
        setDescription(productData.description || '');
        setStatus(productData.status || 'active');

        // Images setup
        const thumbUrl = productData.thumbnail || productData.image_url || '';
        if (thumbUrl) {
          setThumbnailImage([{ url: thumbUrl, public_id: productData.cloudinaryPublicIds?.[0] }]);
        }

        const gallery = (productData.images || productData.gallery_urls || []).slice(1);
        const galleryPublicIds = (productData.cloudinaryPublicIds || []).slice(1);

        setGalleryImages(
          gallery.map((url, i) => ({
            url,
            public_id: galleryPublicIds[i],
          }))
        );
      } catch (err) {
        setError('Failed to load product data.');
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
    if (!name.trim()) return setError('Product name is required');
    if (!categoryId) return setError('Please select a category');
    if (!size.trim()) return setError('Please enter size');
    if (!description.trim()) return setError('Please enter product description');
    if (thumbnailImage.length === 0) return setError('Please upload at least one main product image');

    setSubmitting(true);

    try {
      const allImageUrls = [thumbnailImage[0].url, ...galleryImages.map((g) => g.url)];
      const newPublicIds = [
        thumbnailImage[0].public_id,
        ...galleryImages.map((g) => g.public_id),
      ].filter(Boolean) as string[];

      // Check if any old Cloudinary public IDs were removed and safely delete them
      const oldPublicIds = product?.cloudinaryPublicIds || [];
      const removedPublicIds = oldPublicIds.filter((pid) => !newPublicIds.includes(pid));

      for (const pid of removedPublicIds) {
        try {
          await deleteImageFromCloudinary(pid);
        } catch (delErr) {
          console.warn('Failed to delete removed image from Cloudinary:', pid);
        }
      }

      await updateProduct(id, {
        name: name.trim(),
        category: categoryId,
        subCategory: subCategory.trim(),
        size: size.trim(),
        shape,
        description: description.trim(),
        thumbnail: thumbnailImage[0].url,
        images: allImageUrls,
        cloudinaryPublicIds: newPublicIds,
        status,
      });

      navigate('/admin/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-[#1F4D36]">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
        <span className="font-sans text-xs font-semibold">Loading product details...</span>
      </div>
    );
  }

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
            <h1 className="font-serif text-3xl text-[#1F4D36] font-bold">Edit Product</h1>
            <p className="font-sans text-xs text-[#64748B] mt-0.5">
              Update size, images, description, or status for "{product?.name}"
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
              className="w-full px-4 py-3.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36] focus:bg-white"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-[#1F4D36] mb-2">
              Category *
            </label>
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
              className="w-full px-4 py-3.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36] focus:bg-white resize-y"
            />
          </div>

          {/* Image Upload Section */}
          <div className="md:col-span-2 pt-4 border-t border-slate-100 space-y-6">
            <h3 className="font-serif text-lg font-bold text-[#1F4D36]">Product Images</h3>

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

        {/* Actions */}
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
                Updating Product...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Update Product
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
