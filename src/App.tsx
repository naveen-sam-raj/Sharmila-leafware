import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ScrollToTop from '@/components/ScrollToTop';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import Home from '@/pages/Home';
import AboutPage from '@/pages/AboutPage';
import ProductsPage from '@/pages/ProductsPage';
import WhyUsPage from '@/pages/WhyUsPage';
import QualityPage from '@/pages/QualityPage';
import ExportPage from '@/pages/ExportPage';
import ContactPage from '@/pages/ContactPage';
import ProductDetail from '@/pages/ProductDetail';
import AdminLogin from '@/pages/AdminLogin';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminAddProduct from '@/pages/admin/AdminAddProduct';
import AdminEditProduct from '@/pages/admin/AdminEditProduct';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminGallery from '@/pages/admin/AdminGallery';
import AdminAddGallery from '@/pages/admin/AdminAddGallery';
import AdminEditGallery from '@/pages/admin/AdminEditGallery';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminAddOrder from '@/pages/admin/AdminAddOrder';
import AdminEditOrder from '@/pages/admin/AdminEditOrder';
import AdminPayments from '@/pages/admin/AdminPayments';
import AdminExpenses from '@/pages/admin/AdminExpenses';
import AdminInvoices from '@/pages/admin/AdminInvoices';
import AdminSettings from '@/pages/admin/AdminSettings';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public Admin Login */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Console Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/products/add" element={<AdminAddProduct />} />
              <Route path="/admin/products/edit/:id" element={<AdminEditProduct />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/gallery" element={<AdminGallery />} />
              <Route path="/admin/gallery/add" element={<AdminAddGallery />} />
              <Route path="/admin/gallery/edit/:id" element={<AdminEditGallery />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/orders/add" element={<AdminAddOrder />} />
              <Route path="/admin/orders/edit/:id" element={<AdminEditOrder />} />
              <Route path="/admin/payments" element={<AdminPayments />} />
              <Route path="/admin/expenses" element={<AdminExpenses />} />
              <Route path="/admin/invoices" element={<AdminInvoices />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>
          </Route>

          {/* Customer Facing Website Routes */}
          <Route
            path="*"
            element={
              <>
                <Navbar />
                <main className="min-h-screen">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/why-us" element={<WhyUsPage />} />
                    <Route path="/quality" element={<QualityPage />} />
                    <Route path="/export" element={<ExportPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/products/:slug" element={<ProductDetail />} />
                  </Routes>
                </main>
                <Footer />
                <WhatsAppButton />
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
