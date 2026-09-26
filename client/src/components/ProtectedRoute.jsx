import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-warm-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  // Check if owner is approved
  if (user.role === 'owner' && !user.approved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50 px-4">
        <div className="card p-10 max-w-md text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-50 flex items-center justify-center border-4 border-amber-100">
            <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-warm-900 mb-2">Pending Approval</h2>
          <p className="text-warm-500 mb-6 leading-relaxed">Your restaurant account is being reviewed by our admin team. You'll be able to access your dashboard once approved.</p>
          <button onClick={() => window.location.reload()} className="btn-secondary text-sm">
            Check Status
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
