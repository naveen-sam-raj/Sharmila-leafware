import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, Loader2, AlertCircle } from 'lucide-react';
import { fetchProducts, fetchOrderById, updateOrder } from '@/lib/api';
import { formatIndianCurrency } from '@/lib/numberToWords';
import type { Product, OrderItem } from '@/types';

export default function AdminEditOrder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [orderId, setOrderId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [orderStatus, setOrderStatus] = useState('NEW');

  // Items List
  const [items, setItems] = useState<OrderItem[]>([]);

  // Adjustments
  const [discount, setDiscount] = useState('0');
  const [transportCharge, setTransportCharge] = useState('0');
  const [paidAmount, setPaidAmount] = useState('0');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);
      try {
        const [prodRes, ordData] = await Promise.all([
          fetchProducts({ limit: 100 }),
          fetchOrderById(id),
        ]);

        setAvailableProducts(prodRes.products || []);

        if (!ordData) {
          setError('Order not found');
          return;
        }

        setOrderId(ordData.orderId);
        setCustomerName(ordData.customerName);
        setCompanyName(ordData.companyName || '');
        setPhone(ordData.phone);
        setWhatsapp(ordData.whatsapp || '');
        setEmail(ordData.email || '');
        setAddress(ordData.address || '');
        setGstNumber(ordData.gstNumber || '');
        setNotes(ordData.notes || '');
        setOrderStatus(ordData.orderStatus || 'NEW');

        setDiscount(String(ordData.discount || 0));
        setTransportCharge(String(ordData.transportCharge || 0));
        setPaidAmount(String(ordData.paidAmount || 0));
        setItems(ordData.items || []);
      } catch (err) {
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleProductSelect = (index: number, selectedId: string) => {
    const prod = availableProducts.find((p) => (p._id || p.id) === selectedId);
    if (!prod) return;

    const newItems = [...items];
    const qty = newItems[index].quantity || 1;
    const price = prod.price || 0;

    newItems[index] = {
      product: selectedId,
      productName: prod.name,
      size: prod.size || '',
      quantity: qty,
      unitPrice: price,
      total: qty * price,
    };
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: 'quantity' | 'unitPrice' | 'size', value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index] };

    if (field === 'quantity') {
      item.quantity = Math.max(1, Number(value) || 1);
    } else if (field === 'unitPrice') {
      item.unitPrice = Math.max(0, Number(value) || 0);
    } else if (field === 'size') {
      item.size = value;
    }

    item.total = item.quantity * item.unitPrice;
    newItems[index] = item;
    setItems(newItems);
  };

  const handleAddItem = () => {
    const firstProd = availableProducts[0];
    const newId = firstProd ? firstProd._id || firstProd.id || '' : '';
    const newName = firstProd ? firstProd.name : 'Custom Item';
    const newSize = firstProd ? firstProd.size || '' : '';
    const newPrice = firstProd ? firstProd.price || 10 : 10;

    setItems([
      ...items,
      {
        product: newId,
        productName: newName,
        size: newSize,
        quantity: 100,
        unitPrice: newPrice,
        total: 100 * newPrice,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return alert('Order must have at least one product item.');
    setItems(items.filter((_, i) => i !== index));
  };

  const calculatedSubtotal = items.reduce((sum, item) => sum + item.total, 0);
  const numDiscount = Math.max(0, Number(discount) || 0);
  const numTransport = Math.max(0, Number(transportCharge) || 0);
  const grandTotal = Math.max(0, calculatedSubtotal - numDiscount + numTransport);
  const numPaid = Math.max(0, Number(paidAmount) || 0);
  const balance = Math.max(0, grandTotal - numPaid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!id) return;
    if (!customerName.trim()) return setError('Please enter customer name.');
    if (!phone.trim()) return setError('Please enter phone number.');

    setSubmitting(true);

    try {
      await updateOrder(id, {
        customerName: customerName.trim(),
        companyName: companyName.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        email: email.trim(),
        address: address.trim(),
        gstNumber: gstNumber.trim(),
        items,
        discount: numDiscount,
        transportCharge: numTransport,
        paidAmount: numPaid,
        orderStatus: orderStatus as any,
        notes: notes.trim(),
      });

      navigate('/admin/orders');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-[#1F4D36]">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
        <span className="font-sans text-xs font-semibold">Loading order details...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/admin/orders"
          className="p-2 rounded-xl text-[#1F4D36] bg-white border border-[#1F4D36]/15 hover:bg-[#FAF3E8] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-serif text-3xl text-[#1F4D36] font-bold">Edit Order #{orderId}</h1>
          <p className="font-sans text-xs text-[#64748B] mt-0.5">
            Modify order items, pricing, transport charges, or order status
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Customer Information */}
        <div className="p-6 sm:p-8 rounded-[24px] bg-white border border-[#1F4D36]/15 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-serif text-xl font-bold text-[#1F4D36]">Customer Information</h2>
            <div>
              <label className="text-xs font-semibold text-[#1F4D36] mr-2">Order Status:</label>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-[#FAF3E8] border border-[#1F4D36]/20 font-sans text-xs font-bold text-[#1F4D36]"
              >
                <option value="NEW">NEW</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="PACKED">PACKED</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1.5">
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1.5">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1.5">
                Phone Number *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1.5">
                WhatsApp Number
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
              />
            </div>
          </div>
        </div>

        {/* Order Products Table */}
        <div className="p-6 sm:p-8 rounded-[24px] bg-white border border-[#1F4D36]/15 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-serif text-xl font-bold text-[#1F4D36]">Order Products</h2>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1F4D36] bg-[#FAF3E8] hover:bg-[#F5E6C8]"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => {
              const currentProdId =
                typeof item.product === 'object' && item.product
                  ? item.product._id || item.product.id
                  : item.product || item.productId || '';

              return (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-xl bg-[#FAF3E8]/30 border border-[#1F4D36]/15 items-center"
                >
                  <div className="sm:col-span-5">
                    <label className="block text-[10px] font-bold uppercase text-[#1F4D36] mb-1">Product</label>
                    <select
                      value={currentProdId}
                      onChange={(e) => handleProductSelect(idx, e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#1F4D36]/20 font-sans text-xs focus:outline-none focus:border-[#1F4D36]"
                    >
                      {availableProducts.map((p) => (
                        <option key={p._id || p.id} value={p._id || p.id}>
                          {p.name} ({p.size}) — ₹{p.price}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-[#1F4D36] mb-1">Size</label>
                    <input
                      type="text"
                      value={item.size || ''}
                      onChange={(e) => handleItemChange(idx, 'size', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#1F4D36]/20 font-sans text-xs focus:outline-none focus:border-[#1F4D36]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-[#1F4D36] mb-1">Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#1F4D36]/20 font-sans text-xs focus:outline-none focus:border-[#1F4D36]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-[#1F4D36] mb-1">Unit Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#1F4D36]/20 font-sans text-xs focus:outline-none focus:border-[#1F4D36]"
                    />
                  </div>

                  <div className="sm:col-span-1 flex items-center justify-end pt-3 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Calculations */}
        <div className="p-6 sm:p-8 rounded-[24px] bg-white border border-[#1F4D36]/15 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1.5">
                  Discount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
                />
              </div>

              <div>
                <label className="block font-sans text-xs font-semibold uppercase text-[#1F4D36] mb-1.5">
                  Transport / Courier Charge (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={transportCharge}
                  onChange={(e) => setTransportCharge(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 font-sans text-sm focus:outline-none focus:border-[#1F4D36]"
                />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF3E8] border border-[#1F4D36]/15 space-y-3 font-sans text-xs">
              <div className="flex justify-between text-[#64748B]">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-[#1F4D36]">{formatIndianCurrency(calculatedSubtotal)}</span>
              </div>
              {numDiscount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span className="font-semibold">- {formatIndianCurrency(numDiscount)}</span>
                </div>
              )}
              {numTransport > 0 && (
                <div className="flex justify-between text-[#64748B]">
                  <span>Transport / Courier:</span>
                  <span className="font-semibold">+ {formatIndianCurrency(numTransport)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-[#1F4D36]/15 flex justify-between font-serif text-lg font-bold text-[#1F4D36]">
                <span>Grand Total:</span>
                <span>{formatIndianCurrency(grandTotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-800 font-semibold pt-1">
                <span>Total Paid Amount:</span>
                <span>{formatIndianCurrency(numPaid)}</span>
              </div>
              <div className="flex justify-between font-semibold pt-1 text-amber-900">
                <span>Balance Due:</span>
                <span>{formatIndianCurrency(balance)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <Link
              to="/admin/orders"
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
                  Updating Order...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Update Order
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
