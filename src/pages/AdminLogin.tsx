import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      setError(error);
    } else {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-luxury-bg" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-luxury-green/8 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative w-full max-w-md"
      >
        {/* Official Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-10">
          <div className="p-2 rounded-full border border-[#C8A45D]/60 bg-white/50 shadow-sm">
            <img src="/logo-transparent.png" alt="Sharmila Leafware Logo" className="h-16 w-auto object-contain" />
          </div>
        </Link>

        <div className="p-8 rounded-3xl glass-gold">
          <h1 className="font-serif text-3xl text-luxury-ink text-center mb-2">Admin Login</h1>
          <p className="font-sans text-sm text-luxury-ink-muted text-center mb-8">Sign in to manage your catalogue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-sans text-xs tracking-[0.2em] text-luxury-green uppercase mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-luxury-green/50" strokeWidth={1.5} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/50 border border-luxury-green/20 text-luxury-ink font-sans text-sm focus:border-luxury-green/50 focus:outline-none focus:shadow-[0_0_20px_rgba(23,165,137,0.15)] transition-all"
                  placeholder="sharmilaleafware@gmail.com"
                />
              </div>
            </div>

            <div>
              <label className="block font-sans text-xs tracking-[0.2em] text-luxury-green uppercase mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-luxury-green/50" strokeWidth={1.5} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/50 border border-luxury-green/20 text-luxury-ink font-sans text-sm focus:border-luxury-green/50 focus:outline-none focus:shadow-[0_0_20px_rgba(23,165,137,0.15)] transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <p className="font-sans text-sm text-red-400/80 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-gold w-full disabled:opacity-50"
            >
              {submitting ? 'Signing in...' : 'Sign In'}
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <Link to="/" className="mt-6 flex items-center justify-center gap-2 font-sans text-xs text-luxury-ink-muted/70 hover:text-luxury-gold transition-colors">
            <ArrowLeft className="w-3 h-3" /> Back to website
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
