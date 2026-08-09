import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Image as ImageIcon,
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { fetchGallery, deleteGalleryItem, updateGalleryStatus } from '@/lib/api';
import type { GalleryItem, GalleryCategoryEnum } from '@/types';

const CATEGORY_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All Categories' },
  { value: 'MANUFACTURING', label: 'Manufacturing' },
  { value: 'RAW_MATERIALS', label: 'Raw Materials' },
  { value: 'FINISHED_PRODUCTS', label: 'Finished Products' },
  { value: 'PACKING', label: 'Packing' },
  { value: 'WAREHOUSE', label: 'Warehouse' },
  { value: 'EXPORT_CONTAINERS', label: 'Export Containers' },
];

export const CATEGORY_LABEL_MAP: Record<string, string> = {
  MANUFACTURING: 'Manufacturing',
  RAW_MATERIALS: 'Raw Materials',
  FINISHED_PRODUCTS: 'Finished Products',
  PACKING: 'Packing',
  WAREHOUSE: 'Warehouse',
  EXPORT_CONTAINERS: 'Export Containers',
};

export default function AdminGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Delete Modal
  const [deletingItem, setDeletingItem] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchGallery({
        category: selectedCategory,
        status: selectedStatus,
        search,
        includeInactive: true,
      });
      setItems(data);
    } catch (err) {
      console.error('Error loading gallery items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, selectedCategory, selectedStatus]);

  const handleToggleStatus = async (item: GalleryItem) => {
    const id = item._id || item.id;
    if (!id) return;
    const newStatus = item.status === 'active' ? 'inactive' : 'active';
    try {
      await updateGalleryStatus(id, newStatus);
      loadData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    const id = deletingItem._id || deletingItem.id;
    if (!id) return;

    setDeleting(true);
    try {
      await deleteGalleryItem(id);
      setDeletingItem(null);
      loadData();
    } catch (err) {
      alert('Failed to delete gallery item');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#1F4D36] font-bold">Gallery Management</h1>
          <p className="font-sans text-xs text-[#64748B] mt-0.5">
            Upload and organize showcase photos across manufacturing, raw materials, finished goods, and exports
          </p>
        </div>

        <Link
          to="/admin/gallery/add"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-xs font-semibold text-white bg-[#1F4D36] hover:bg-[#163827] transition-all shadow-md shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Add Gallery Item
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-[20px] bg-white border border-[#1F4D36]/15 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or description..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/15 font-sans text-xs focus:outline-none focus:border-[#1F4D36]"
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/15 font-sans text-xs focus:outline-none focus:border-[#1F4D36]"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/15 font-sans text-xs focus:outline-none focus:border-[#1F4D36]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Gallery Table */}
      <div className="rounded-[24px] bg-white border border-[#1F4D36]/15 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-[#64748B]">Loading gallery items...</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <ImageIcon className="w-12 h-12 text-[#1F4D36]/30 mx-auto mb-3" />
            <p className="font-sans text-sm text-[#64748B] mb-3">No gallery items match your filters.</p>
            <Link
              to="/admin/gallery/add"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#1F4D36]"
            >
              <PlusCircle className="w-4 h-4" /> Add First Gallery Item
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF3E8]/60 border-b border-[#1F4D36]/10 text-[11px] font-bold uppercase tracking-wider text-[#1F4D36]">
                  <th className="py-4 px-6">Image</th>
                  <th className="py-4 px-6">Title</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Display Order</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans text-xs">
                {items.map((item) => {
                  const id = item._id || item.id;
                  const imgSrc = item.imageUrl || item.image_url || '';
                  const isActive = item.status === 'active' || !item.status;
                  const displayCat = CATEGORY_LABEL_MAP[item.category] || item.category;

                  return (
                    <tr key={id} className="hover:bg-[#FAF3E8]/20 transition-colors">
                      <td className="py-3 px-6">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#FAF3E8] border border-slate-200">
                          <img src={imgSrc} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                      </td>

                      <td className="py-3 px-6 font-semibold text-[#1F4D36] max-w-[250px] truncate">
                        {item.title}
                        {item.description && (
                          <span className="block font-normal text-[11px] text-[#64748B] truncate mt-0.5">
                            {item.description}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-6">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FAF3E8] text-[#1F4D36] border border-[#1F4D36]/15">
                          {displayCat}
                        </span>
                      </td>

                      <td className="py-3 px-6 text-[#334155] font-mono">{item.displayOrder ?? item.sort_order ?? 0}</td>

                      <td className="py-3 px-6">
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                          title="Click to toggle status"
                        >
                          {isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      <td className="py-3 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to="/#gallery"
                            target="_blank"
                            className="p-2 rounded-lg text-[#64748B] hover:text-[#1F4D36] hover:bg-[#FAF3E8] transition-colors"
                            title="View on Customer Gallery"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/admin/gallery/edit/${id}`}
                            className="p-2 rounded-lg text-[#1F4D36] bg-[#FAF3E8] hover:bg-[#F5E6C8] transition-colors"
                            title="Edit Gallery Item"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeletingItem(item)}
                            className="p-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                            title="Delete Gallery Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setDeletingItem(null)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-red-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-serif text-xl font-bold text-[#1F4D36] mb-2">Delete Gallery Item</h3>
            <p className="font-sans text-xs text-[#64748B] mb-6 leading-relaxed">
              Are you sure you want to delete <strong className="text-[#1F4D36]">"{deletingItem.title}"</strong>?
              This will remove the item from the gallery and delete its image from Cloudinary.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="flex-1 py-3 rounded-xl text-xs font-semibold text-[#64748B] bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
