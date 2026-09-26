import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'super_admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/owner/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-warm-50">
      {/* ─── Left - Food Model & Culinary Showcase Panel ─── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-stone-950">
        {/* Background Food Photography (Real Gourmet Restaurant Vibe) */}
        <img
          src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=85"
          alt="Gourmet Dining Cuisine"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.75] contrast-105"
        />

        {/* Sophisticated Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-stone-900/50" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/60" />

        {/* Floating Brand & Features Content */}
        <div className="relative z-10 w-full h-full p-12 flex flex-col justify-between text-white">
          <div>
            <Logo size="lg" className="brightness-125" />
          </div>

          <div className="max-w-lg space-y-4">
            <h2 className="text-4xl xl:text-5xl font-black text-white leading-tight drop-shadow-md">
              Elevate your dining with contactless ordering.
            </h2>

            <p className="text-stone-300 text-base leading-relaxed font-normal">
              Customers simply scan the table QR with their phone camera to view the live menu and order directly to your kitchen.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Right - Login Form ─── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white relative">
        <div className="w-full max-w-md relative animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8 flex justify-center">
            <Logo size="lg" />
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-warm-900 tracking-tight">Welcome back</h1>
            <p className="text-warm-500 text-sm mt-1.5 font-medium">Sign in to manage your restaurant orders & tables</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm animate-slide-down flex items-center gap-2 font-medium">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-warm-700 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="owner@restaurant.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-warm-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Footer link */}
          <div className="mt-8 text-center pt-6 border-t border-warm-100">
            <p className="text-warm-500 text-sm">
              New restaurant?{' '}
              <Link to="/register" className="text-brand-600 hover:text-brand-700 font-bold hover:underline">
                Register your restaurant →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
