import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';

const OwnerDashboard = () => {
  const [stats, setStats] = useState({
    menuItems: 0,
    tables: 0,
    activeOrders: 0,
    todayRevenue: 0,
    todayPaidOrders: 0,
    cashTotal: 0,
    upiTotal: 0,
    cardTotal: 0,
  });
  const [activeOrders, setActiveOrders] = useState([]);
  const [todayTransactions, setTodayTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingOrder, setPayingOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [toast, setToast] = useState('');

  const fetchDashboardData = async () => {
    try {
      const [menuRes, tablesRes, ordersRes, dailyRes] = await Promise.all([
        API.get('/menu'),
        API.get('/tables'),
        API.get('/orders'),
        API.get('/orders/daily-collection').catch(() => ({ data: null })),
      ]);

      const orders = ordersRes.data || [];
      const today = dailyRes.data?.today || {
        totalRevenue: 0,
        totalOrders: 0,
        cashTotal: 0,
        upiTotal: 0,
        cardTotal: 0,
        transactions: [],
      };

      setStats({
        menuItems: menuRes.data.length,
        tables: tablesRes.data.length,
        activeOrders: orders.length,
        todayRevenue: today.totalRevenue || 0,
        todayPaidOrders: today.totalOrders || 0,
        cashTotal: today.cashTotal || 0,
        upiTotal: today.upiTotal || 0,
        cardTotal: today.cardTotal || 0,
      });

      setActiveOrders(orders);
      setTodayTransactions((today.transactions || []).slice(0, 6));
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleConfirmPayment = async () => {
    if (!payingOrder) return;
    setSubmittingPayment(true);
    try {
      const { data } = await API.post(`/orders/${payingOrder._id}/pay`, {
        paymentMethod,
      });
      setPayingOrder(null);
      setToast(data.message || `Table ${data.tableNumber} paid and freed!`);
      setTimeout(() => setToast(''), 4000);
      await fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to settle payment');
    } finally {
      setSubmittingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Today's Collection",
      value: `₹${stats.todayRevenue.toFixed(0)}`,
      subtext: `${stats.todayPaidOrders} settled orders`,
      color: 'from-emerald-500 to-teal-600',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907M15 11l1-7M9 11L8 4M5 19h14M6 15h12l1 4H5l1-4z" />
        </svg>
      ),
    },
    {
      label: 'Active Dining Tables',
      value: stats.activeOrders,
      subtext: stats.activeOrders > 0 ? 'Guests ordering/dining' : 'All tables vacant',
      color: 'from-amber-500 to-orange-500',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      label: 'Dining Tables Set Up',
      value: stats.tables,
      subtext: 'QR codes generated',
      color: 'from-blue-500 to-indigo-600',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      ),
    },
    {
      label: 'Dishes on Menu',
      value: stats.menuItems,
      subtext: 'Live on customer QR menu',
      color: 'from-purple-500 to-brand-600',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white font-bold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-slide-down">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title text-2xl sm:text-3xl text-warm-900">Restaurant Overview</h1>
          <p className="text-warm-500 mt-1 text-sm sm:text-base">
            Real-time daily collection, active dining tables, and quick operations.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link to="/owner/orders" className="btn-primary !px-4 !py-2 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <span>Live Kitchen Orders</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* Key Metric Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="card p-5 border border-warm-200 bg-white shadow-sm flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-warm-500 uppercase tracking-wider">{card.label}</p>
              <p className="text-2xl sm:text-3xl font-black text-warm-900 mt-1">{card.value}</p>
              <p className="text-xs text-warm-400 font-medium mt-1">{card.subtext}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-md flex-shrink-0`}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* TODAY'S SALES BREAKDOWN (CASH / UPI) */}
      <div className="card p-5 sm:p-6 border border-warm-200 bg-gradient-to-r from-warm-50 via-white to-amber-50/20 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold text-warm-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Today&apos;s Payment Mode Breakdown
            </h2>
            <p className="text-xs text-warm-500 mt-0.5">
              Live ledger of offline customer payments collected at counter or table
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white px-4 py-2.5 rounded-xl border border-warm-200 shadow-sm flex items-center gap-3">
              <span className="text-xl">💵</span>
              <div>
                <span className="text-[10px] font-bold text-warm-400 uppercase tracking-wider block">Cash Collected</span>
                <span className="text-lg font-black text-warm-800">₹{stats.cashTotal.toFixed(0)}</span>
              </div>
            </div>

            <div className="bg-white px-4 py-2.5 rounded-xl border border-warm-200 shadow-sm flex items-center gap-3">
              <span className="text-xl">📱</span>
              <div>
                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider block">UPI / QR (GPay/PhonePe)</span>
                <span className="text-lg font-black text-brand-700">₹{stats.upiTotal.toFixed(0)}</span>
              </div>
            </div>

            {stats.cardTotal > 0 && (
              <div className="bg-white px-4 py-2.5 rounded-xl border border-warm-200 shadow-sm flex items-center gap-3">
                <span className="text-xl">💳</span>
                <div>
                  <span className="text-[10px] font-bold text-warm-400 uppercase tracking-wider block">Card / POS</span>
                  <span className="text-lg font-black text-warm-800">₹{stats.cardTotal.toFixed(0)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ACTIVE OCCUPIED TABLES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-warm-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            Currently Occupied Dining Tables ({activeOrders.length})
          </h2>
          <Link to="/owner/orders" className="text-xs text-brand-600 font-bold hover:underline">
            View Kitchen Display →
          </Link>
        </div>

        {activeOrders.length === 0 ? (
          <div className="card p-10 text-center border border-warm-200 bg-white">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald-50 flex items-center justify-center">
              <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-extrabold text-warm-900 text-base">All Tables Vacant & Ready</h3>
            <p className="text-xs text-warm-500 mt-1">
              When customers scan QR codes at your tables and place an order, they appear here live.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeOrders.map((order) => {
              const tableNum = order.tableId?.tableNumber || '—';
              return (
                <div
                  key={order._id}
                  className="card p-5 border border-warm-200 bg-white shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-warm-100">
                      <span className="bg-brand-500 text-white text-base font-black px-3 py-0.5 rounded-xl shadow-sm">
                        Table {tableNum}
                      </span>
                      <span className="text-xs font-bold text-warm-500 capitalize">
                        {order.status}
                      </span>
                    </div>

                    <div className="py-3 space-y-1.5 text-xs text-warm-700">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="truncate pr-2">{item.quantity}× {item.name}</span>
                          <span className="font-mono font-semibold">₹{(item.price * item.quantity).toFixed(0)}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <span className="text-[11px] text-warm-400 font-semibold block">
                          +{order.items.length - 3} more dish{order.items.length - 3 !== 1 ? 'es' : ''}...
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-warm-100">
                      <span className="text-xs font-bold text-warm-500 uppercase">Bill Amount</span>
                      <span className="text-xl font-black text-brand-600">₹{order.total.toFixed(0)}</span>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-warm-100">
                    <button
                      onClick={() => {
                        setPayingOrder(order);
                        setPaymentMethod('upi');
                      }}
                      className="btn-primary w-full !py-2.5 text-xs font-black flex items-center justify-center gap-1.5 shadow-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    >
                      <span>Collect Paid & Free Table</span>
                      <span>✓</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RECENT SETTLED TRANSACTIONS TODAY */}
      {todayTransactions.length > 0 && (
        <div className="card p-5 sm:p-6 border border-warm-200 bg-white shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-warm-100">
            <h2 className="text-base font-bold text-warm-900">Recent Settled Payments Today</h2>
            <Link to="/owner/orders" className="text-xs text-brand-600 font-bold hover:underline">
              View All History →
            </Link>
          </div>

          <div className="divide-y divide-warm-100">
            {todayTransactions.map((tx, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-base">{tx.paymentMethod === 'upi' ? '📱' : tx.paymentMethod === 'card' ? '💳' : '💵'}</span>
                  <div>
                    <span className="font-bold text-warm-900">Table {tx.tableNumber}</span>
                    <span className="text-xs text-warm-400 ml-2 uppercase font-semibold">
                      ({tx.paymentMethod}) • {tx.itemsCount} dishes
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-emerald-700 block">₹{tx.amount.toFixed(0)}</span>
                  <span className="text-[10px] text-warm-400">
                    {new Date(tx.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QUICK OPERATIONS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/owner/tables"
          className="card p-5 border border-warm-200 bg-white hover:border-brand-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl group-hover:scale-110 transition-transform">📱</span>
            <div>
              <h3 className="font-bold text-sm text-warm-900">Tables & QR Codes</h3>
              <p className="text-xs text-warm-500 mt-0.5">Download high-res printable table cards</p>
            </div>
          </div>
        </Link>

        <Link
          to="/owner/menu"
          className="card p-5 border border-warm-200 bg-white hover:border-brand-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl group-hover:scale-110 transition-transform">🍽️</span>
            <div>
              <h3 className="font-bold text-sm text-warm-900">Menu Manager</h3>
              <p className="text-xs text-warm-500 mt-0.5">Edit prices, dishes & availability</p>
            </div>
          </div>
        </Link>

        <Link
          to="/owner/settings"
          className="card p-5 border border-warm-200 bg-white hover:border-brand-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl group-hover:scale-110 transition-transform">🎲</span>
            <div>
              <h3 className="font-bold text-sm text-warm-900">Profile & DiceBear</h3>
              <p className="text-xs text-warm-500 mt-0.5">Customize avatar & restaurant branding</p>
            </div>
          </div>
        </Link>
      </div>

      {/* MODAL: COLLECT PAYMENT */}
      {payingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="card p-6 sm:p-8 max-w-md w-full bg-white border border-warm-200 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-warm-100 mb-4">
              <div>
                <h3 className="font-extrabold text-warm-900 text-lg">
                  Settle Table {payingOrder.tableId?.tableNumber || ''} Payment
                </h3>
                <p className="text-xs text-warm-500">Log customer offline payment into today&apos;s collection:</p>
              </div>
              <button
                onClick={() => setPayingOrder(null)}
                className="p-1 rounded-lg text-warm-400 hover:text-warm-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-warm-50 p-4 rounded-2xl border border-warm-200 text-center mb-5">
              <span className="text-xs font-bold text-warm-500 uppercase tracking-wider">Bill Amount</span>
              <div className="text-3xl font-black text-brand-600 mt-1">₹{payingOrder.total.toFixed(2)}</div>
            </div>

            <div className="space-y-2 mb-6">
              <label
                onClick={() => setPaymentMethod('upi')}
                className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-brand-500 bg-brand-50/50 shadow-sm'
                    : 'border-warm-200 hover:border-warm-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📱</span>
                  <div>
                    <span className="font-bold text-sm text-warm-900 block">UPI / QR Code</span>
                    <span className="text-xs text-warm-500">GPay, PhonePe, Paytm</span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="dashboard-payment"
                  checked={paymentMethod === 'upi'}
                  onChange={() => setPaymentMethod('upi')}
                  className="accent-brand-600 w-4 h-4"
                />
              </label>

              <label
                onClick={() => setPaymentMethod('cash')}
                className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-brand-500 bg-brand-50/50 shadow-sm'
                    : 'border-warm-200 hover:border-warm-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💵</span>
                  <div>
                    <span className="font-bold text-sm text-warm-900 block">Cash Received</span>
                    <span className="text-xs text-warm-500">Paid at counter</span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="dashboard-payment"
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                  className="accent-brand-600 w-4 h-4"
                />
              </label>

              <label
                onClick={() => setPaymentMethod('card')}
                className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'card'
                    ? 'border-brand-500 bg-brand-50/50 shadow-sm'
                    : 'border-warm-200 hover:border-warm-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💳</span>
                  <div>
                    <span className="font-bold text-sm text-warm-900 block">Card / Swipe</span>
                    <span className="text-xs text-warm-500">POS machine</span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="dashboard-payment"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="accent-brand-600 w-4 h-4"
                />
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPayingOrder(null)}
                className="btn-secondary flex-1 text-sm font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingPayment}
                onClick={handleConfirmPayment}
                className="btn-primary flex-1 !py-3 text-sm font-black flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                {submittingPayment ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Confirm & Free Table ✓</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
