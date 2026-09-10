import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  User as UserIcon,
  ExternalLink,
  Image as ImageIcon,
  ShoppingBag,
  CreditCard,
  TrendingDown,
  FileText,
} from 'lucide-react';
import SEO from '@/components/SEO';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Categories', path: '/admin/categories', icon: FolderTree },
    { label: 'Gallery', path: '/admin/gallery', icon: ImageIcon },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Payments', path: '/admin/payments', icon: CreditCard },
    { label: 'Expenses', path: '/admin/expenses', icon: TrendingDown },
    { label: 'Invoices', path: '/admin/invoices', icon: FileText },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  // Helper for Breadcrumbs / Title based on path
  const getPageTitle = () => {
    const p = location.pathname;
    if (p.includes('/admin/products/add')) return 'Add New Product';
    if (p.includes('/admin/products/edit')) return 'Edit Product';
    if (p.includes('/admin/products')) return 'Product Management';
    if (p.includes('/admin/categories')) return 'Categories';
    if (p.includes('/admin/gallery')) return 'Media Gallery';
    if (p.includes('/admin/orders')) return 'Customer Orders';
    if (p.includes('/admin/payments')) return 'Payment Records';
    if (p.includes('/admin/expenses')) return 'Expense Tracker';
    if (p.includes('/admin/invoices')) return 'Invoices & Billing';
    if (p.includes('/admin/settings')) return 'Admin Settings';
    return 'Dashboard Overview';
  };

  return (
    <div className="min-h-screen bg-[#F8F5ED] flex font-sans text-[#1E2924] antialiased">
      <SEO title="Admin Console | Sharmila Leafware" noindex={true} />

      {/* Desktop Fixed Sidebar (250px) */}
      <aside className="hidden lg:flex w-64 bg-[#FAF3E8] border-r border-[#174B38]/12 flex-col shrink-0 sticky top-0 h-screen select-none z-30">
        {/* Brand Logo Header Section (Compact 90-110px width) */}
        <div className="p-5 border-b border-[#174B38]/10 flex flex-col items-center justify-center bg-white/40 backdrop-blur-xs">
          <Link to="/admin/dashboard" className="block group">
            <img
              src="/sharmila-logo.jpg"
              alt="Sharmila Leafware Logo"
              className="w-24 h-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
          <span className="mt-2 text-[10px] font-bold tracking-[0.2em] text-[#6D7C58] uppercase">
            Admin Business System
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-none">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                  isActive
                    ? 'bg-[#174B38] text-white shadow-xs scale-[1.01]'
                    : 'text-[#24352C] hover:bg-[#F3EFE3] hover:text-[#174B38]'
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? 'text-[#C7A66A]' : 'text-[#6D7C58]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Action at Bottom */}
        <div className="p-3 border-t border-[#174B38]/10 bg-white/40">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50/80 transition-colors"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Slide-over Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative w-72 max-w-[85vw] h-full bg-[#FAF3E8] flex flex-col p-5 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#174B38]/10">
              <div>
                <img src="/sharmila-logo.jpg" alt="Sharmila Leafware Logo" className="w-24 h-auto object-contain" />
                <span className="text-[9px] font-bold tracking-wider text-[#6D7C58] uppercase block mt-1">
                  Admin System
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl text-[#174B38] hover:bg-[#F3EFE3]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Nav Links */}
            <nav className="space-y-1 flex-1 overflow-y-auto py-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive ? 'bg-[#174B38] text-white shadow-xs' : 'text-[#24352C] hover:bg-[#F3EFE3]'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-[#C7A66A]' : 'text-[#6D7C58]'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Drawer Footer Actions */}
            <div className="pt-4 mt-auto border-t border-[#174B38]/10 space-y-3">
              <Link
                to="/"
                target="_blank"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#174B38] bg-white border border-[#174B38]/15 hover:bg-[#F3EFE3] transition-all"
              >
                <ExternalLink className="w-4 h-4 text-[#174B38]" />
                View Storefront
              </Link>

              <div className="flex items-center gap-2.5 p-2 bg-white/60 rounded-xl border border-[#174B38]/10">
                <div className="w-8 h-8 rounded-full bg-[#174B38] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-sans text-xs font-bold text-[#174B38] truncate">{user?.name || 'Administrator'}</p>
                  <p className="font-sans text-[10px] text-[#6D7C58] truncate">{user?.email || 'admin@sharmilaleafware.com'}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200/50"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Right Main Column Layout (Top Bar + Main Body) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Header Bar */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-[#174B38]/10 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#174B38] hover:bg-[#F8F5ED] transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <span className="font-sans text-[11px] uppercase tracking-wider text-[#6D7C58] font-bold">
                Admin Panel
              </span>
              <h2 className="font-serif text-lg font-bold text-[#174B38] leading-tight truncate">
                {getPageTitle()}
              </h2>
            </div>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#174B38] bg-[#FAF3E8] border border-[#174B38]/15 hover:bg-[#F3EFE3] transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#174B38]" />
              View Storefront
            </Link>

            <div className="w-px h-5 bg-[#174B38]/15 hidden sm:block" />

            {/* Notification Icon */}
            <button
              aria-label="Notifications"
              className="p-2 rounded-full text-[#6D7C58] hover:text-[#174B38] hover:bg-[#FAF3E8] transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C7A66A]" />
            </button>

            {/* Admin Profile User Info */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-[#174B38]/15">
              <div className="w-8 h-8 rounded-full bg-[#174B38] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="font-sans text-xs font-bold text-[#174B38]">{user?.name || 'Administrator'}</p>
                <p className="font-sans text-[10px] text-[#6D7C58]">{user?.email || 'admin@sharmilaleafware.com'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area Container (Max width ~1280px to avoid stretch) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
