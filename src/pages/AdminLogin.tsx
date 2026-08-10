import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, ArrowLeft, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import SEO from '@/components/SEO';
import { useAuth } from '@/context/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter both email address and password.');
      return;
    }

    setSubmitting(true);
    const { error: errMessage } = await signIn(email.trim(), password);
    setSubmitting(false);

    if (errMessage) {
      setError(errMessage);
    } else {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#FAF3E8]">
      <SEO title="Admin Login | Sharmila Leafware" noindex={true} />
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1F4D36]/5 blur-[140px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        {/* Prominent Official Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block group">
            <img
              src="/sharmila-logo.jpg"
              alt="Sharmila Leafware Official Logo"
              className="w-48 sm:w-56 h-auto mx-auto object-contain drop-shadow-sm group-hover:scale-102 transition-transform"
            />
          </Link>
        </div>

        {/* Login Card */}
        <div className="p-8 rounded-[24px] bg-white border border-[#1F4D36]/15 shadow-xl">
          <div className="text-center mb-6">
            <h2 className="font-serif text-2xl text-[#1F4D36] font-semibold">Admin Login</h2>
            <p className="font-sans text-xs text-[#64748B] mt-1">
              Sign in to access your business management dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-sans text-xs font-semibold tracking-wider text-[#1F4D36] uppercase mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" strokeWidth={1.5} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 text-[#1F4D36] font-sans text-sm focus:border-[#1F4D36] focus:bg-white focus:outline-none transition-all shadow-xs"
                  placeholder="admin@sharmilaleafware.com"
                />
              </div>
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold tracking-wider text-[#1F4D36] uppercase mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" strokeWidth={1.5} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-[#FAF3E8]/40 border border-[#1F4D36]/20 text-[#1F4D36] font-sans text-sm focus:border-[#1F4D36] focus:bg-white focus:outline-none transition-all shadow-xs"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1F4D36] transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-sans">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-sans text-xs font-semibold uppercase tracking-wider text-white bg-[#1F4D36] hover:bg-[#163827] active:scale-[0.99] disabled:opacity-50 transition-all shadow-md"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Seed hint box */}
          <div className="mt-6 p-3 rounded-xl bg-[#FAF3E8] border border-[#1F4D36]/10 text-center">
            <p className="font-sans text-[11px] text-[#64748B]">
              Default Admin: <span className="font-semibold text-[#1F4D36]">admin@sharmilaleafware.com</span>
              <br />
              Password: <span className="font-semibold text-[#1F4D36]">Admin@123</span>
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 font-sans text-xs text-[#64748B] hover:text-[#1F4D36] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Storefront
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
