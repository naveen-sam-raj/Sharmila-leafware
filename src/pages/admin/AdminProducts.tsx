import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package,
  PlusCircle,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { fetchProducts, fetchCategories, deleteProduct, updateProductStatus } from '@/lib/api';
import type { Product, Category } from '@/types';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  // Delete modal state
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catsRes] = await Promise.all([
        fetchProducts({
          search,
          category: selectedCategory,
          status: selectedStatus,
          sort,
          page,
          limit: 10,
          includeInactive: true,
        }),
        fetchCategories(true),
      ]);

      setProducts(prodRes.products || []);
      setPagination(prodRes.pagination || { total: 0, page: 1, pages: 1 });
      setCategories(catsRes || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, selectedCategory, selectedStatus, sort, page]);

  const handleToggleStatus = async (p: Product) => {
    const id = p._id || p.id;
    if (!id) return;
    const newStatus = p.status === 'active' ? 'inactive' : 'active';
    try {
      await updateProductStatus(id, newStatus);
      loadData();
    } catch (err) {
      alert('Failed to update product status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    const id = deletingProduct._id || deletingProduct.id;
    if (!id) return;

    setDeleting(true);
    try {
      await deleteProduct(id);
      setDeletingProduct(null);
      loadData();
    } catch (err) {
      alert('Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#174B38]/10 shadow-xs">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#174B38] font-bold">Manage Products</h1>
          <p className="font-sans text-xs text-[#6D7C58] mt-1">
            Search, filter, edit, activate/deactivate, and manage catalog inventory
          </p>
        </div>

        <Link
          to="/admin/products/add"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-xs font-semibold text-white bg-[#174B38] hover:bg-[#123B2C] transition-all shadow-xs shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-[20px] bg-white border border-[#1F4D36]/15 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or size..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/15 font-sans text-xs focus:outline-none focus:border-[#1F4D36]"
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/15 font-sans text-xs focus:outline-none focus:border-[#1F4D36]"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c._id || c.id} value={c._id || c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/15 font-sans text-xs focus:outline-none focus:border-[#1F4D36]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/15 font-sans text-xs focus:outline-none focus:border-[#1F4D36]"
          >
            <option value="latest">Sort by Latest</option>
            <option value="name_asc">Name: A to Z</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-[24px] bg-white border border-[#1F4D36]/15 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-[#64748B]">Loading products table...</div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-12 h-12 text-[#1F4D36]/30 mx-auto mb-3" />
            <p className="font-sans text-sm text-[#64748B] mb-3">No products match your filters.</p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('all');
                setSelectedStatus('all');
              }}
              className="text-xs font-semibold text-[#1F4D36] underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF3E8]/60 border-b border-[#1F4D36]/10 text-[11px] font-bold uppercase tracking-wider text-[#1F4D36]">
                  <th className="py-4 px-6">Image</th>
                  <th className="py-4 px-6">Product Name</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Size</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans text-xs">
                {products.map((p) => {
                  const id = p._id || p.id;
                  const catName =
                    typeof p.category === 'object' && p.category ? p.category.name : 'Uncategorized';
                  const imgSrc = p.thumbnail || p.image_url || '';
                  const isActive = p.status === 'active' || !p.status;

                  return (
                    <tr key={id} className="hover:bg-[#FAF3E8]/20 transition-colors">
                      {/* Image */}
                      <td className="py-3 px-6">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#FAF3E8] border border-slate-200">
                          <img src={imgSrc} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                      </td>

                      {/* Product Name */}
                      <td className="py-3 px-6 font-semibold text-[#1F4D36] max-w-[200px] truncate">
                        {p.name}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-6">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FAF3E8] text-[#1F4D36] border border-[#1F4D36]/15">
                          {catName}
                        </span>
                      </td>

                      {/* Size */}
                      <td className="py-3 px-6 text-[#334155]">{p.size}</td>

                      {/* Status */}
                      <td className="py-3 px-6">
                        <button
                          onClick={() => handleToggleStatus(p)}
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

                      {/* Actions */}
                      <td className="py-3 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/products/${p.slug}`}
                            target="_blank"
                            className="p-2 rounded-lg text-[#64748B] hover:text-[#1F4D36] hover:bg-[#FAF3E8] transition-colors"
                            title="View on Storefront"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/admin/products/edit/${id}`}
                            className="p-2 rounded-lg text-[#1F4D36] bg-[#FAF3E8] hover:bg-[#F5E6C8] transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeletingProduct(p)}
                            className="p-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                            title="Delete Product"
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

        {/* Pagination Footer */}
        {pagination.pages > 1 && (
          <div className="p-4 bg-[#FAF3E8]/30 border-t border-[#1F4D36]/10 flex items-center justify-between">
            <span className="font-sans text-xs text-[#64748B]">
              Page {pagination.page} of {pagination.pages} ({pagination.total} total items)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setDeletingProduct(null)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-red-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-serif text-xl font-bold text-[#1F4D36] mb-2">Delete Product</h3>
            <p className="font-sans text-xs text-[#64748B] mb-6 leading-relaxed">
              Are you sure you want to delete <strong className="text-[#1F4D36]">"{deletingProduct.name}"</strong>?
              This action will permanently delete the product and its associated Cloudinary images.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
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
