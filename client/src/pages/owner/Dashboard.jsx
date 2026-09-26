import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [stats, setStats] = useState({
    menuItems: 0,
    tables: 0,
    activeOrders: 0,
    paidCollection: 0,
    paidOrdersCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [menuRes, tablesRes, ordersRes, restRes] = await Promise.all([
        API.get('/menu'),
        API.get('/tables'),
        API.get('/orders'),
        API.get('/restaurant/profile').catch(() => ({ data: null })),
      ]);

      setRestaurant(restRes.data || null);

      const orders = ordersRes.data || [];
      const paidOrders = orders.filter((o) => o.status === 'paid');
      const active = orders.filter((o) => o.status !== 'paid');
      const paidTotal = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);

      setStats({
        menuItems: menuRes.data.length,
        tables: tablesRes.data.length,
        activeOrders: active.length,
        paidCollection: paidTotal,
        paidOrdersCount: paidOrders.length,
      });

      setRecentOrders(orders.slice(0, 6));
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Greeting based on current time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl">
      {/* ─── 1. AWARD-WINNING HERO BANNER WITH FOOD MODEL & OVERLAY ─── */}
      <div className="relative overflow-hidden rounded-3xl bg-stone-950 text-white p-6 sm:p-8 shadow-2xl border border-stone-800">
        {/* Real Food Model Photography with Ambient Depth */}
        <img
          src={restaurant?.banner || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80"}
          alt="Restaurant Cuisine"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.38] contrast-105"
        />

        {/* Sophisticated Multi-Stage Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-950/80 to-stone-900/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-transparent to-black/40" />

        <div className="relative z-10">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">
            {restaurant?.name || 'RestroPilot Dining'}
          </h1>

          <p className="text-stone-300 text-xs sm:text-sm max-w-2xl font-normal leading-relaxed mt-2">
            {restaurant?.description || `${greeting}, ${user?.name}. Your contactless tables and kitchen orders are running smoothly.`}
          </p>
        </div>
      </div>

      {/* ─── 2. ELEVATED METRIC STAT CARDS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Paid Collection */}
        <div className="card p-5 border border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50/20 to-emerald-50/40 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Paid Collection</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">₹{stats.paidCollection.toLocaleString('en-IN')}</p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">from {stats.paidOrdersCount} paid orders</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center font-black text-lg shadow-inner">
            ₹
          </div>
        </div>

        {/* Active Orders */}
        <div className="card p-5 border border-amber-200/80 bg-gradient-to-br from-white via-amber-50/20 to-amber-50/40 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Active Table Orders</p>
            <p className="text-2xl sm:text-3xl font-black text-amber-700 mt-1">{stats.activeOrders}</p>
            <p className="text-xs text-amber-600 font-semibold mt-1">
              {stats.activeOrders > 0 ? 'Dining in progress' : 'All tables vacant'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center text-lg shadow-inner">
            👨‍🍳
          </div>
        </div>

        {/* Dining Tables */}
        <div className="card p-5 border border-warm-200 bg-white shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-warm-500 uppercase tracking-wider">Dining Tables</p>
            <p className="text-2xl sm:text-3xl font-black text-warm-900 mt-1">{stats.tables}</p>
            <Link to="/owner/tables" className="text-xs text-brand-600 font-semibold mt-1 inline-block hover:underline">
              Manage QR Codes →
            </Link>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-warm-100 text-warm-700 flex items-center justify-center text-lg shadow-inner">
            📱
          </div>
        </div>

        {/* Menu Dishes */}
        <div className="card p-5 border border-warm-200 bg-white shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-warm-500 uppercase tracking-wider">Menu Dishes</p>
            <p className="text-2xl sm:text-3xl font-black text-warm-900 mt-1">{stats.menuItems}</p>
            <Link to="/owner/menu" className="text-xs text-brand-600 font-semibold mt-1 inline-block hover:underline">
              Manage Dishes →
            </Link>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-warm-100 text-warm-700 flex items-center justify-center text-lg shadow-inner">
            🍽️
          </div>
        </div>
      </div>

      {/* ─── 3. RECENT ORDERS MONITOR ─── */}
      <div className="card p-6 border border-warm-200 bg-white shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-warm-100">
          <div>
            <h2 className="text-base font-black text-warm-900">Recent Table Activity</h2>
            <p className="text-xs text-warm-500">Live feed of orders placed at your dining tables</p>
          </div>
          <Link to="/owner/orders" className="text-xs font-bold text-brand-600 hover:underline">
            View Live Orders →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-warm-100 text-warm-400 mx-auto flex items-center justify-center text-xl mb-2">
              🍽️
            </div>
            <p className="text-sm font-bold text-warm-800">No active dining orders</p>
            <p className="text-xs text-warm-400 mt-0.5">When guests scan table QR codes and place orders, they will appear here live.</p>
          </div>
        ) : (
          <div className="divide-y divide-warm-100">
            {recentOrders.map((order) => {
              const tableNum = order.tableId?.tableNumber || '—';
              const isPending = order.status === 'pending';
              const isServed = order.status === 'served' || order.status === 'preparing' || order.status === 'completed';
              const isPaid = order.status === 'paid';

              return (
                <div key={order._id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-xs bg-warm-900 text-white px-3 py-1.5 rounded-xl shadow-sm">
                      Table {tableNum}
                    </span>
                    <div>
                      <div className="text-xs text-warm-800 font-semibold truncate max-w-sm">
                        {order.items.map((it) => `${it.quantity}× ${it.name}`).join(', ')}
                      </div>
                      <span className="text-[11px] text-warm-400 font-mono">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-sm font-black text-warm-900 font-mono">₹{order.total.toFixed(0)}</span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                        isPaid
                          ? 'bg-emerald-100 text-emerald-800'
                          : isServed
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isPaid ? 'Paid' : isServed ? 'Served' : 'Pending'}
                    </span>

                    {isPending && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'served')}
                        className="text-xs font-bold text-blue-700 hover:text-blue-900 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        Mark Served
                      </button>
                    )}
                    {isServed && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'paid')}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-900 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors"
                      >
                        Mark Paid
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── 4. QUICK COMMAND HUB ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/owner/tables"
          className="card p-5 border border-warm-200 bg-white hover:border-brand-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              📱
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-warm-900">Tables & QR Codes</h3>
              <p className="text-xs text-warm-500 mt-0.5">Manage tables & download QR codes</p>
            </div>
          </div>
        </Link>

        <Link
          to="/owner/menu"
          className="card p-5 border border-warm-200 bg-white hover:border-brand-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              🍽️
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-warm-900">Menu Manager</h3>
              <p className="text-xs text-warm-500 mt-0.5">Edit 100+ dishes, prices & availability</p>
            </div>
          </div>
        </Link>

        <Link
          to="/owner/settings"
          className="card p-5 border border-warm-200 bg-white hover:border-brand-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              🎨
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-warm-900">Branding & Profile</h3>
              <p className="text-xs text-warm-500 mt-0.5">Restaurant details, banners & avatar</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default OwnerDashboard;
