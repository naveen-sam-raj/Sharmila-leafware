import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  Loader2,
  Grid,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '@/lib/api';
import type { Category } from '@/types';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Delete Confirmation Modal State
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await fetchCategories(true);
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setImage('');
    setStatus('active');
    setModalError(null);
    setShowModal(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setImage(cat.image || '');
    setStatus(cat.status || 'active');
    setModalError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setModalError('Category name is required');
      return;
    }

    setSubmitting(true);
    setModalError(null);

    try {
      if (editingCategory) {
        const id = editingCategory._id || editingCategory.id;
        if (!id) throw new Error('Category ID missing');
        await updateCategory(id, { name: name.trim(), image, status });
      } else {
        await createCategory({ name: name.trim(), image, status });
      }

      setShowModal(false);
      loadCategories();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (cat: Category) => {
    const id = cat._id || cat.id;
    if (!id) return;
    const newStatus = cat.status === 'active' ? 'inactive' : 'active';
    try {
      await updateCategory(id, { name: cat.name, image: cat.image, status: newStatus });
      loadCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update category status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    const id = deletingCategory._id || deletingCategory.id;
    if (!id) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteCategory(id);
      setDeletingCategory(null);
      loadCategories();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#1F4D36] font-bold">Category Management</h1>
          <p className="font-sans text-xs text-[#64748B] mt-1">
            Organize product lines for your Areca leaf tableware collections.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-xs font-semibold text-white bg-[#1F4D36] hover:bg-[#163827] transition-all shadow-md"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-[#64748B]">Loading categories...</div>
      ) : categories.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-[#1F4D36]/15">
          <FolderTree className="w-12 h-12 text-[#1F4D36]/30 mx-auto mb-3" />
          <p className="font-sans text-sm text-[#64748B] mb-4">No categories found.</p>
          <button onClick={openAddModal} className="btn-primary-forest text-xs">
            + Add New Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const isActive = cat.status === 'active' || !cat.status;
            return (
              <motion.div
                key={cat._id || cat.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-[24px] bg-white border border-[#1F4D36]/15 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#FAF3E8] border border-[#1F4D36]/15 flex items-center justify-center text-[#1F4D36]">
                      <Grid className="w-6 h-6" />
                    </div>
                    <button
                      onClick={() => handleToggleStatus(cat)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      }`}
                      title="Click to toggle status"
                    >
                      {isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-[#1F4D36] mb-1">{cat.name}</h3>
                  <p className="font-sans text-xs text-[#64748B] mb-4 font-mono bg-[#FAF3E8]/50 px-2 py-1 rounded-md inline-block">
                    slug: /{cat.slug}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#1F4D36] bg-[#FAF3E8] hover:bg-[#F5E6C8] transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      setDeletingCategory(cat);
                      setDeleteError(null);
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#1F4D36]/15">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="font-serif text-xl font-bold text-[#1F4D36]">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-[#1F4D36] mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Round Plates"
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
                />
              </div>

              <div>
                <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-[#1F4D36] mb-1.5">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
                >
                  <option value="active">Active (Visible on public store)</option>
                  <option value="inactive">Inactive (Hidden)</option>
                </select>
              </div>

              {modalError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl text-xs font-semibold text-[#64748B] bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl text-xs font-semibold text-white bg-[#1F4D36] hover:bg-[#163827] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setDeletingCategory(null)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-red-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-serif text-xl font-bold text-[#1F4D36] mb-2">Delete Category</h3>
            <p className="font-sans text-xs text-[#64748B] mb-4 leading-relaxed">
              Are you sure you want to delete the category{' '}
              <strong className="text-[#1F4D36]">"{deletingCategory.name}"</strong>?
            </p>

            {deleteError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs mb-4">
                {deleteError}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
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
