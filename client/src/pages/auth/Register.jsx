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
          <div className="card p-10 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-50 flex items-center justify-center border-4 border-emerald-100">
              <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-warm-900 mb-2">You're all set! 🎉</h2>
            <p className="text-warm-500 mb-8 leading-relaxed">
              Your restaurant has been registered successfully. Our admin team will review and approve your account shortly.
            </p>
            <Link to="/login" className="btn-primary inline-flex items-center gap-2">
              Go to Login
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
    <div className="min-h-screen flex">
      {/* Left - Decorative Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-sunset relative overflow-hidden items-center justify-center">
        {/* Floating blobs */}
        <div className="absolute top-16 right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-16 left-16 w-64 h-64 bg-yellow-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-bounce-soft" style={{ animationDelay: '1s' }} />

        {/* Decorative shapes */}
        <div className="absolute top-20 left-20 w-16 h-16 border-4 border-white/20 rounded-2xl rotate-12" />
        <div className="absolute bottom-24 right-24 w-10 h-10 border-4 border-white/20 rounded-full" />
        <div className="absolute top-1/2 right-1/3 w-6 h-6 bg-white/25 rounded-full" />

        {/* Content */}
        <div className="relative z-10 text-center px-12 max-w-lg">
          <div className="mb-8 flex justify-center">
            <Logo size="xl" showText={false} />
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            Take your restaurant <br />digital today
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Join hundreds of restaurants using QR codes for seamless, contactless ordering.
          </p>

          {/* Steps */}
          <div className="mt-10 space-y-4 text-left">
            {[
              { num: '01', text: 'Register your restaurant' },
              { num: '02', text: 'Add your menu & tables' },
              { num: '03', text: 'Print QR codes & start taking orders' },
            ].map((step) => (
              <div key={step.num} className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10">
                <span className="text-white/60 text-sm font-bold">{step.num}</span>
                <span className="text-white font-medium">{step.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Register Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white relative">
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: 'radial-gradient(circle, #f59e0b 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="w-full max-w-md relative animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-6 flex justify-center">
            <Logo size="lg" />
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-warm-900">Create account </h1>
            <p className="text-warm-500 mt-2">Get your restaurant online in minutes</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm animate-slide-down flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-warm-700 mb-2">Your Name</label>
                <input
                  id="register-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="John Doe"
                  autoComplete="name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-warm-700 mb-2">Restaurant Name</label>
                <input
                  id="register-restaurant"
                  type="text"
                  name="restaurantName"
                  value={formData.restaurantName}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="My Restaurant"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-warm-700 mb-2">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-warm-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="register-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field !pl-12"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-warm-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-warm-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="register-password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field !pl-12"
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-3.5 text-base flex items-center justify-center gap-2 !mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-warm-500 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 hover:text-brand-700 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
