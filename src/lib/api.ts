import type {
  Category,
  Product,
  GalleryItem,
  Order,
  Payment,
  Expense,
  BusinessSettings,
  DashboardStats,
} from '@/types';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('sharmila_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/$/, '');
  }
  if (import.meta.env.DEV) {
    return 'http://localhost:5000';
  }
  return '';
};

export const API_BASE_URL = getApiBaseUrl();

export async function safeParseJson(res: Response): Promise<any> {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    if (text.trim().startsWith('<')) {
      throw new Error(`API request returned non-JSON response (${res.status}). Verify API proxy configuration.`);
    }
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(text || `API request failed with status ${res.status}`);
    }
  }
  return await res.json();
}

// Fetch categories
export async function fetchCategories(includeInactive = false): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/categories${includeInactive ? '?includeInactive=true' : ''}`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return await res.json();
  } catch (err) {
    console.warn('API error, returning empty category list:', err);
    return [];
  }
}

// Fetch gallery items
export async function fetchGallery(params?: {
  category?: string;
  includeInactive?: boolean;
  search?: string;
  status?: string;
}): Promise<GalleryItem[]> {
  try {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.includeInactive) query.append('includeInactive', 'true');
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);

    const res = await fetch(`${API_BASE_URL}/api/gallery?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch gallery items');
    const data = await res.json();

    return data.map((item: any) => ({
      ...item,
      id: item._id || item.id,
      image_url: item.imageUrl || item.image_url,
      sort_order: item.displayOrder !== undefined ? item.displayOrder : item.sort_order || 0,
    }));
  } catch (err) {
    console.warn('API error fetching gallery:', err);
    return [];
  }
}

// Fetch products
export async function fetchProducts(params?: {
  search?: string;
  category?: string;
  status?: string;
  sort?: string;
  page?: number;
  limit?: number;
  includeInactive?: boolean;
}): Promise<{ products: Product[]; pagination: { total: number; page: number; pages: number } }> {
  try {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category) query.append('category', params.category);
    if (params?.status) query.append('status', params.status);
    if (params?.sort) query.append('sort', params.sort);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.includeInactive) query.append('includeInactive', 'true');

    const res = await fetch(`${API_BASE_URL}/api/products?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    const data = await res.json();

    if (Array.isArray(data)) {
      return { products: data, pagination: { total: data.length, page: 1, pages: 1 } };
    }
    return data;
  } catch (err) {
    console.warn('API error fetching products:', err);
    return { products: [], pagination: { total: 0, page: 1, pages: 1 } };
  }
}

// Fetch single product
export async function fetchProductBySlug(idOrSlug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products/${encodeURIComponent(idOrSlug)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('API error fetching product by slug:', err);
    return null;
  }
}

// Create product
export async function createProduct(productData: Partial<Product>): Promise<Product> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(productData),
    });

    const data = await safeParseJson(res);
    if (!res.ok) {
      throw new Error(`Server Error (${res.status}): ${data.message || 'Failed to create product'}`);
    }
    return data;
  } catch (err) {
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      throw new Error('Network Connection Error ("Failed to fetch"): Unable to reach backend server (/api/products). Check backend status or CORS settings.');
    }
    throw err;
  }
}

// Update product
export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(updates),
    });

    const data = await safeParseJson(res);
    if (!res.ok) {
      throw new Error(`Server Error (${res.status}): ${data.message || 'Failed to update product'}`);
    }
    return data;
  } catch (err) {
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      throw new Error(`Network Connection Error ("Failed to fetch"): Unable to reach backend server (/api/products/${id}). Check backend status or CORS settings.`);
    }
    throw err;
  }
}

// Toggle product status
export async function updateProductStatus(id: string, status: 'active' | 'inactive'): Promise<Product> {
  const res = await fetch(`${API_BASE_URL}/api/products/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ status }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update product status');
  return data;
}

// Delete product
export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Failed to delete product');
  }
}

// Category CRUD
export async function createCategory(categoryData: Partial<Category>): Promise<Category> {
  const res = await fetch(`${API_BASE_URL}/api/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(categoryData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create category');
  return data;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
  const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update category');
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete category');
}

// Gallery CRUD
export async function createGalleryItem(itemData: Partial<GalleryItem>): Promise<GalleryItem> {
  const res = await fetch(`${API_BASE_URL}/api/gallery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(itemData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create gallery item');
  return data;
}

export async function updateGalleryItem(id: string, updates: Partial<GalleryItem>): Promise<GalleryItem> {
  const res = await fetch(`${API_BASE_URL}/api/gallery/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update gallery item');
  return data;
}

export async function updateGalleryStatus(id: string, status: 'active' | 'inactive'): Promise<GalleryItem> {
  const res = await fetch(`${API_BASE_URL}/api/gallery/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update status');
  return data;
}

export async function deleteGalleryItem(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/gallery/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Failed to delete gallery item');
  }
}

// Upload & Cloudinary
export async function uploadImageToCloudinary(file: File): Promise<{ url: string; public_id: string }> {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: formData,
  });

  const data = await safeParseJson(res);
  if (!res.ok) throw new Error(data.message || 'Image upload failed');
  return data;
}

export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  if (!publicId) return;
  await fetch(`${API_BASE_URL}/api/upload?public_id=${encodeURIComponent(publicId)}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
}

// ORDERS API SERVICES
export async function fetchOrders(params?: {
  search?: string;
  paymentStatus?: string;
  orderStatus?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<{ orders: Order[]; pagination: { total: number; page: number; pages: number } }> {
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  if (params?.paymentStatus) query.append('paymentStatus', params.paymentStatus);
  if (params?.orderStatus) query.append('orderStatus', params.orderStatus);
  if (params?.startDate) query.append('startDate', params.startDate);
  if (params?.endDate) query.append('endDate', params.endDate);
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));

  const res = await fetch(`${API_BASE_URL}/api/orders?${query.toString()}`, {
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error('Failed to fetch orders');
  const data = await res.json();
  if (Array.isArray(data)) {
    return { orders: data, pagination: { total: data.length, page: 1, pages: 1 } };
  }
  return data;
}

export async function fetchOrderById(id: string): Promise<Order | null> {
  const res = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
    headers: getAuthHeader(),
  });
  if (!res.ok) return null;
  return await res.json();
}

export async function createOrder(orderData: Partial<Order>): Promise<Order> {
  const res = await fetch(`${API_BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(orderData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create order');
  return data;
}

export async function updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
  const res = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update order');
  return data;
}

export async function recordOrderPayment(
  orderId: string,
  paymentDetails: { amount: number; paymentMethod: string; referenceNumber?: string; notes?: string }
): Promise<{ order: Order; payment: Payment }> {
  const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(paymentDetails),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to record payment');
  return data;
}

export async function updateOrderStatus(
  id: string,
  statuses: { orderStatus?: string; paymentStatus?: string }
): Promise<Order> {
  const res = await fetch(`${API_BASE_URL}/api/orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(statuses),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update order status');
  return data;
}

export async function cancelOrder(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Failed to cancel order');
  }
}

// PAYMENTS API SERVICES
export async function fetchPayments(params?: { startDate?: string; endDate?: string; limit?: number }): Promise<Payment[]> {
  const query = new URLSearchParams();
  if (params?.startDate) query.append('startDate', params.startDate);
  if (params?.endDate) query.append('endDate', params.endDate);
  if (params?.limit) query.append('limit', String(params.limit));

  const res = await fetch(`${API_BASE_URL}/api/payments?${query.toString()}`, {
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error('Failed to fetch payments');
  return await res.json();
}

// EXPENSES API SERVICES
export async function fetchExpenses(params?: {
  category?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Expense[]> {
  const query = new URLSearchParams();
  if (params?.category) query.append('category', params.category);
  if (params?.search) query.append('search', params.search);
  if (params?.startDate) query.append('startDate', params.startDate);
  if (params?.endDate) query.append('endDate', params.endDate);

  const res = await fetch(`${API_BASE_URL}/api/expenses?${query.toString()}`, {
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error('Failed to fetch expenses');
  return await res.json();
}

export async function createExpense(expenseData: Partial<Expense>): Promise<Expense> {
  const res = await fetch(`${API_BASE_URL}/api/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(expenseData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add expense');
  return data;
}

export async function updateExpense(id: string, updates: Partial<Expense>): Promise<Expense> {
  const res = await fetch(`${API_BASE_URL}/api/expenses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update expense');
  return data;
}

export async function deleteExpense(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/expenses/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Failed to delete expense');
  }
}

// BUSINESS SETTINGS SERVICES
export async function fetchSettings(): Promise<BusinessSettings> {
  const res = await fetch(`${API_BASE_URL}/api/settings`);
  if (!res.ok) throw new Error('Failed to fetch business settings');
  return await res.json();
}

export async function updateSettings(updates: Partial<BusinessSettings>): Promise<BusinessSettings> {
  const res = await fetch(`${API_BASE_URL}/api/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update business settings');
  return data;
}

// DASHBOARD STATS SERVICE
export async function fetchDashboardStats(range = 'this_month', startDate?: string, endDate?: string): Promise<DashboardStats> {
  const query = new URLSearchParams();
  query.append('range', range);
  if (startDate) query.append('startDate', startDate);
  if (endDate) query.append('endDate', endDate);

  const res = await fetch(`${API_BASE_URL}/api/dashboard/stats?${query.toString()}`, {
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
  return await res.json();
}
