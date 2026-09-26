import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    restaurantName: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData.name, formData.email, formData.password, formData.restaurantName);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50 px-4">
        <div className="w-full max-w-md animate-scale-in">
          <div className="card p-10 text-center bg-white border border-warm-200 shadow-xl rounded-3xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-50 flex items-center justify-center border-4 border-emerald-100">
              <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-warm-900 mb-2">Registration Successful! 🎉</h2>
            <p className="text-warm-500 mb-8 text-sm leading-relaxed">
              Your restaurant has been created. Our super admin will review and activate your account shortly.
            </p>
            <Link to="/login" className="btn-primary inline-flex items-center gap-2 font-bold !py-3 !px-6">
              Go to Sign In
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-warm-50">
      {/* ─── Left - Food Model & Culinary Showcase Panel ─── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-stone-950">
        <img
          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=85"
          alt="Modern Gourmet Restaurant"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.75] contrast-105"
        />

        {/* Sophisticated Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-stone-900/50" />

        <div className="relative z-10 w-full h-full p-12 flex flex-col justify-between text-white">
          <div>
            <Logo size="lg" className="brightness-125" />
          </div>

          <div className="max-w-lg space-y-4">
            <h2 className="text-4xl xl:text-5xl font-black text-white leading-tight drop-shadow-md">
              Start contactless ordering for your tables.
            </h2>

            <p className="text-stone-300 text-base leading-relaxed font-normal">
              Empower your dining room with instant table QR codes, digital menus, and live kitchen order management.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Right - Register Form ─── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white relative">
        <div className="w-full max-w-md relative animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8 flex justify-center">
            <Logo size="lg" />
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-warm-900 tracking-tight">Register Restaurant</h1>
            <p className="text-warm-500 text-sm mt-1.5 font-medium">Create your restaurant account to get started</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                Restaurant Name
              </label>
              <input
                type="text"
                name="restaurantName"
                value={formData.restaurantName}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. Royal Spice Bistro"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-warm-700 uppercase tracking-wider mb-2">
                Owner / Manager Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. Rajesh Kumar"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-warm-700 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="At least 6 characters"
                minLength="6"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
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
              Already have an account?{' '}
              <Link to="/login" className="text-brand-600 hover:text-brand-700 font-bold hover:underline">
                Sign in here →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
