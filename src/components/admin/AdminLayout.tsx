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

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#1F4D36]/10 px-4 lg:px-8 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-[#1F4D36] hover:bg-[#FAF3E8] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo on top header */}
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <img src="/sharmila-logo.jpg" alt="Sharmila Leafware Logo" className="h-10 sm:h-12 w-auto object-contain" />
          </Link>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#1F4D36] bg-[#FAF3E8] hover:bg-[#F5E6C8] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Storefront
          </Link>

          <div className="w-px h-6 bg-slate-200 hidden sm:block" />

          {/* Notifications */}
          <button className="p-2 rounded-full text-[#64748B] hover:text-[#1F4D36] hover:bg-[#FAF3E8] transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C8A45D]" />
          </button>

          {/* Admin User Profile */}
          <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
            <div className="w-9 h-9 rounded-full bg-[#1F4D36]/10 border border-[#1F4D36]/20 flex items-center justify-center text-[#1F4D36]">
              <UserIcon className="w-5 h-5" />
            </div>
            <div className="hidden md:block leading-none">
              <p className="font-sans text-xs font-semibold text-[#1F4D36]">{user?.name || 'Administrator'}</p>
              <p className="font-sans text-[10px] text-[#64748B] mt-0.5">{user?.email}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex relative">
        {/* Desktop Sidebar with Official Logo at Top */}
        <aside className="hidden lg:flex w-64 bg-white border-r border-[#1F4D36]/10 flex-col p-4 shrink-0">
          <div className="pb-4 mb-3 border-b border-[#1F4D36]/10 text-center">
            <Link to="/admin/dashboard" className="inline-block group">
              <img
                src="/sharmila-logo.jpg"
                alt="Sharmila Leafware Logo"
                className="w-44 h-auto mx-auto object-contain transition-transform group-hover:scale-102"
              />
            </Link>
          </div>

          <div className="px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-[#64748B] uppercase mb-1">
            Business System
          </div>

          <nav className="space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#1F4D36] text-white shadow-sm'
                      : 'text-[#334155] hover:bg-[#FAF3E8] hover:text-[#1F4D36]'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-[#C8A45D]' : 'text-[#64748B]'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 mt-auto border-t border-slate-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              Logout
            </button>
          </div>
        </aside>

        {/* Mobile Slide-over Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
            <aside className="relative w-72 max-w-[80vw] h-full bg-white flex flex-col p-6 shadow-2xl overflow-y-auto">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <img src="/sharmila-logo.jpg" alt="Sharmila Leafware Logo" className="h-10 w-auto object-contain" />
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive ? 'bg-[#1F4D36] text-white' : 'text-[#334155] hover:bg-[#FAF3E8]'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="pt-6 mt-auto border-t border-slate-100">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
