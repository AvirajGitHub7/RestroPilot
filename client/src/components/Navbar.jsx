import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

const ownerNavLinks = [
  { to: '/owner/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/owner/menu', label: 'Menu Manager', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { to: '/owner/tables', label: 'Tables & QR', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  { to: '/owner/orders', label: 'Live Orders', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
  { to: '/owner/settings', label: 'Branding & Info', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
];

const adminNavLinks = [
  { to: '/admin/dashboard', label: 'Restaurants Management', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const navLinks = user?.role === 'super_admin' ? adminNavLinks : ownerNavLinks;

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-warm-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Hamburger (mobile only) + Logo */}
            <div className="flex items-center gap-3">
              {user && (
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-xl text-warm-600 hover:bg-warm-100 hover:text-warm-900 transition-colors"
                  aria-label="Toggle Navigation Menu"
                >
                  {mobileMenuOpen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              )}

              <Link to="/" className="group flex items-center">
                <Logo size="md" />
              </Link>
            </div>

            {/* Right side */}
            {user ? (
              <div className="flex items-center gap-2">
                {/* Profile pill */}
                <Link
                  to={user.role === 'owner' ? '/owner/settings' : '/admin/dashboard'}
                  title="Profile & Settings"
                  className="flex items-center gap-2.5 bg-gradient-to-r from-warm-50 to-warm-100/60 pl-1 pr-3 py-1 rounded-2xl border border-warm-200/70 shadow-sm hover:border-brand-300 transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center overflow-hidden shadow-sm ring-2 ring-white">
                    <img
                      src={user.avatar || `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(user.name || 'User')}`}
                      alt={user.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-gradient-to-br from-brand-500 to-amber-500 hidden items-center justify-center text-xs font-black text-white">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="hidden sm:flex flex-col leading-none">
                    <span className="text-xs font-bold text-warm-800 tracking-tight">{user.name}</span>
                    <span className="text-[9px] font-bold text-brand-500 uppercase tracking-widest mt-0.5">{user.role?.replace('_', ' ')}</span>
                  </div>
                </Link>
                {/* Logout icon button */}
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-warm-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm text-warm-600 hover:text-warm-900 font-bold px-3 py-2">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-xs !px-4 !py-2">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && user && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-out Menu */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[80vw] bg-white shadow-2xl p-6 flex flex-col justify-between z-10 animate-slide-up">
            <div>
              {/* Header inside drawer */}
              <div className="flex items-center justify-between pb-6 border-b border-warm-100 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center overflow-hidden shadow-sm ring-2 ring-warm-200">
                    <img
                      src={user.avatar || `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(user.name || 'User')}`}
                      alt={user.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-gradient-brand hidden items-center justify-center text-white font-black text-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-warm-900">{user.name}</h3>
                    <p className="text-[11px] text-warm-500 capitalize">{user.role?.replace('_', ' ')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-warm-400 hover:text-warm-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col gap-1.5">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                      ${isActive
                        ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-sm'
                        : 'text-warm-600 hover:text-warm-900 hover:bg-warm-100'
                      }`
                    }
                  >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                    </svg>
                    {link.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* Logout button at bottom */}
            <div className="pt-4 border-t border-warm-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-warm-100 hover:bg-red-50 hover:text-red-600 text-warm-700 text-sm font-bold transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
