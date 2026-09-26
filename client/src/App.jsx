import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Super Admin
import AdminDashboard from './pages/superAdmin/Dashboard';

// Owner
import OwnerDashboard from './pages/owner/Dashboard';
import MenuManager from './pages/owner/MenuManager';
import TableManager from './pages/owner/TableManager';
import Orders from './pages/owner/Orders';
import RestaurantProfile from './pages/owner/RestaurantProfile';

// Customer
import MenuView from './pages/customer/MenuView';
import Cart from './pages/customer/Cart';
import OrderConfirmation from './pages/customer/OrderConfirmation';

// Layout wrapper for dashboard pages
const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-warm-50 text-warm-900">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};

// Home redirect based on role
const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'super_admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/owner/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Home */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Super Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roles={['super_admin']}>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Owner Routes */}
          <Route
            path="/owner/dashboard"
            element={
              <ProtectedRoute roles={['owner']}>
                <DashboardLayout>
                  <OwnerDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/menu"
            element={
              <ProtectedRoute roles={['owner']}>
                <DashboardLayout>
                  <MenuManager />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/tables"
            element={
              <ProtectedRoute roles={['owner']}>
                <DashboardLayout>
                  <TableManager />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/orders"
            element={
              <ProtectedRoute roles={['owner']}>
                <DashboardLayout>
                  <Orders />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/settings"
            element={
              <ProtectedRoute roles={['owner']}>
                <DashboardLayout>
                  <RestaurantProfile />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Customer Routes – No auth required */}
          <Route path="/restaurant/:restaurantId/table/:tableNumber" element={<MenuView />} />
          <Route path="/restaurant/:restaurantId/table/:tableNumber/cart" element={<Cart />} />
          <Route path="/restaurant/:restaurantId/table/:tableNumber/confirmation" element={<OrderConfirmation />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
