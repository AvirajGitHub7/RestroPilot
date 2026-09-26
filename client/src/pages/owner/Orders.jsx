import { useState, useEffect } from 'react';
import API from '../../api/axios';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [dailyCollection, setDailyCollection] = useState({
    today: { totalRevenue: 0, totalOrders: 0, cashTotal: 0, upiTotal: 0, cardTotal: 0, transactions: [] },
    history: [],
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [payingOrder, setPayingOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [toast, setToast] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const fetchData = async () => {
    try {
      const [ordersRes, dailyRes] = await Promise.all([
        API.get('/orders'),
        API.get('/orders/daily-collection').catch(() => ({ data: null })),
      ]);
      setOrders(ordersRes.data || []);
      if (dailyRes.data) {
        setDailyCollection(dailyRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh every 20 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status });
      fetchData();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleOpenPay = (order) => {
    setPayingOrder(order);
    setPaymentMethod('upi'); // default to UPI as it's most common in Indian restaurants
  };

  const handleConfirmPayment = async () => {
    if (!payingOrder) return;
    setSubmittingPayment(true);
    try {
      const { data } = await API.post(`/orders/${payingOrder._id}/pay`, {
        paymentMethod,
      });

      setPayingOrder(null);
      setToast(data.message || `Table ${data.tableNumber} marked paid and table cleared!`);
      setTimeout(() => setToast(''), 4500);

      // Refresh orders and collections
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleCancelOrder = async (order) => {
    const tableNum = order.tableId?.tableNumber || '';
    if (!window.confirm(`Clear Table ${tableNum} order without payment?`)) return;
    try {
      await API.delete(`/orders/${order._id}`);
      setToast(`Table ${tableNum} order cleared.`);
      setTimeout(() => setToast(''), 3000);
      fetchData();
    } catch (err) {
      console.error('Failed to clear order:', err);
    }
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const statusColors = {
    pending: 'badge-pending',
    preparing: 'badge-info',
    completed: 'badge-success',
  };

  const statusCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    preparing: orders.filter((o) => o.status === 'preparing').length,
    completed: orders.filter((o) => o.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const today = dailyCollection.today;

  return (
    <div className="space-y-6 animate-fade-in">
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
          <h1 className="section-title text-2xl sm:text-3xl text-warm-900">Live Dining Orders & Collections</h1>
          <p className="text-warm-500 mt-1 text-sm sm:text-base">
            Track active table orders, collect payments (Cash/UPI), and auto-free tables.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowHistoryModal(true)}
            className="btn-secondary text-xs !py-2 !px-3.5 flex items-center gap-1.5 font-bold shadow-sm"
          >
            <svg className="w-4 h-4 text-warm-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Collection History
          </button>
          <button
            onClick={fetchData}
            className="btn-secondary text-xs !py-2 !px-3.5 flex items-center gap-1.5 font-bold shadow-sm"
          >
            <svg className="w-4 h-4 text-warm-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* TODAY'S SALES & COLLECTION SUMMARY CARD */}
      <div className="card p-5 sm:p-6 border border-warm-200 bg-gradient-to-br from-white via-warm-50/40 to-amber-50/30 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-warm-100">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full">
              Today&apos;s Collection Register • {today.date}
            </span>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-3xl sm:text-4xl font-black text-warm-900">
                ₹{today.totalRevenue.toFixed(0)}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-warm-500">
                from {today.totalOrders} paid order{today.totalOrders !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Payment Method Split */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white px-3.5 py-2 rounded-xl border border-warm-200 shadow-sm">
              <span className="text-[10px] font-bold text-warm-400 uppercase tracking-wider block">💵 Cash</span>
              <span className="text-base font-extrabold text-warm-800">₹{today.cashTotal.toFixed(0)}</span>
            </div>
            <div className="bg-white px-3.5 py-2 rounded-xl border border-warm-200 shadow-sm">
              <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider block">📱 UPI / QR</span>
              <span className="text-base font-extrabold text-brand-700">₹{today.upiTotal.toFixed(0)}</span>
            </div>
            {today.cardTotal > 0 && (
              <div className="bg-white px-3.5 py-2 rounded-xl border border-warm-200 shadow-sm">
                <span className="text-[10px] font-bold text-warm-400 uppercase tracking-wider block">💳 Card</span>
                <span className="text-base font-extrabold text-warm-800">₹{today.cardTotal.toFixed(0)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Note on data efficiency */}
        <p className="text-xs text-warm-500 mt-3 flex items-center gap-1.5">
          <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          When you mark an order as <strong>Paid</strong>, revenue is added to Today&apos;s Collection and the active table is freed immediately.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {['all', 'pending', 'preparing', 'completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 capitalize shadow-sm ${
              filter === tab
                ? 'bg-brand-500 text-white shadow-brand'
                : 'bg-white text-warm-600 border border-warm-200 hover:bg-warm-100 hover:text-warm-900'
            }`}
          >
            {tab === 'all' ? 'Active Dining Tables' : tab} ({statusCounts[tab]})
          </button>
        ))}
      </div>

      {/* ACTIVE TABLE ORDERS */}
      {filteredOrders.length === 0 ? (
        <div className="card p-12 text-center border border-warm-200 bg-white">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-warm-900">All Dining Tables Free & Clear!</h3>
          <p className="text-warm-500 font-medium text-sm mt-1">
            {filter === 'all'
              ? 'No active orders on tables right now. New customer orders will show up here automatically.'
              : `No orders in "${filter}" status.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredOrders.map((order) => {
            const tableNum = order.tableId?.tableNumber || '—';
            return (
              <div
                key={order._id}
                className="card-hover p-5 sm:p-6 border border-warm-200 bg-white shadow-sm flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Table Number, Status & Order ID */}
                  <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-warm-100">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg sm:text-xl font-black bg-brand-500 text-white px-3 py-1 rounded-xl shadow-sm">
                        Table {tableNum}
                      </span>
                      <span className={statusColors[order.status] || 'badge-pending'}>
                        {order.status}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-warm-400 block">
                        #{order._id.slice(-6).toUpperCase()}
                      </span>
                      <span className="text-[10px] text-warm-400">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Dishes Ordered */}
                  <div className="space-y-2 py-1 max-h-56 overflow-y-auto pr-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm py-0.5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-warm-100 text-warm-800 text-xs font-black flex items-center justify-center">
                            {item.quantity}
                          </span>
                          <span className="text-warm-800 font-semibold">{item.name}</span>
                        </div>
                        <span className="text-warm-600 font-bold font-mono">
                          ₹{(item.price * item.quantity).toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Order Total */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-warm-100">
                    <span className="text-xs font-bold text-warm-500 uppercase tracking-wider">Total Bill</span>
                    <span className="text-2xl font-black text-brand-600">₹{order.total.toFixed(0)}</span>
                  </div>
                </div>

                {/* Status and Action Buttons */}
                <div className="pt-4 border-t border-warm-100 space-y-2 mt-4">
                  <div className="flex items-center gap-2">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateStatus(order._id, 'preparing')}
                        className="btn-secondary flex-1 !py-2 text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <span>👨‍🍳 Start Cooking</span>
                      </button>
                    )}

                    {order.status === 'preparing' && (
                      <button
                        onClick={() => updateStatus(order._id, 'completed')}
                        className="btn-success flex-1 !py-2 text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <span>✓ Food Served</span>
                      </button>
                    )}

                    {/* COLLECT PAYMENT & FREE TABLE */}
                    <button
                      onClick={() => handleOpenPay(order)}
                      className="btn-primary flex-1 !py-2.5 text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-brand shadow-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Collect Paid (₹{order.total.toFixed(0)})
                    </button>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleCancelOrder(order)}
                      className="text-[11px] text-warm-400 hover:text-red-600 font-semibold transition-colors"
                    >
                      Cancel / Clear without payment
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: COLLECT PAYMENT */}
      {payingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="card p-6 sm:p-8 max-w-md w-full bg-white border border-warm-200 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-warm-100 mb-4">
              <div>
                <h3 className="font-extrabold text-warm-900 text-lg">
                  Settle Table {payingOrder.tableId?.tableNumber || ''} Payment
                </h3>
                <p className="text-xs text-warm-500">Customer paid offline. Choose mode to log in daily collection:</p>
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

            {/* Bill Amount */}
            <div className="bg-warm-50 p-4 rounded-2xl border border-warm-200 text-center mb-5">
              <span className="text-xs font-bold text-warm-500 uppercase tracking-wider">Bill Amount</span>
              <div className="text-3xl font-black text-brand-600 mt-1">₹{payingOrder.total.toFixed(2)}</div>
              <span className="text-[11px] text-warm-500 font-medium">
                {payingOrder.items.length} dishes • Table {payingOrder.tableId?.tableNumber || ''}
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 mb-6">
              <label className="block text-xs font-bold text-warm-700 uppercase tracking-wider mb-2">
                Select Payment Mode Received
              </label>

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
                    <span className="text-xs text-warm-500">Google Pay, PhonePe, Paytm QR</span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
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
                    <span className="text-xs text-warm-500">Paid at counter or table</span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
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
                    <span className="text-xs text-warm-500">POS machine swipe</span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="accent-brand-600 w-4 h-4"
                />
              </label>
            </div>

            {/* Action buttons */}
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
                className="btn-primary flex-1 !py-3 text-sm font-black flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
              >
                {submittingPayment ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Confirm & Free Table</span>
                    <span>✓</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DAILY COLLECTION HISTORY */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="card p-6 sm:p-8 max-w-2xl w-full bg-white border border-warm-200 shadow-2xl animate-scale-in max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-warm-100 mb-4">
              <div>
                <h3 className="font-extrabold text-warm-900 text-lg">Daily Collection Register</h3>
                <p className="text-xs text-warm-500">Historical summary of daily sales and payment modes</p>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-lg text-warm-400 hover:text-warm-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {dailyCollection.history.length === 0 ? (
              <p className="text-sm text-warm-400 text-center py-8">No collections recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {dailyCollection.history.map((day) => (
                  <div key={day._id || day.date} className="p-4 rounded-xl border border-warm-200 bg-warm-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-sm text-warm-900 font-mono">{day.date}</span>
                      <span className="text-xs text-warm-500 ml-2">({day.totalOrders} orders)</span>
                      <div className="flex items-center gap-3 mt-1 text-xs text-warm-600 font-medium">
                        <span>💵 Cash: ₹{day.cashTotal.toFixed(0)}</span>
                        <span>•</span>
                        <span>📱 UPI: ₹{day.upiTotal.toFixed(0)}</span>
                        {day.cardTotal > 0 && <span>• 💳 Card: ₹{day.cardTotal.toFixed(0)}</span>}
                      </div>
                    </div>
                    <span className="text-xl font-black text-brand-600">₹{day.totalRevenue.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-warm-100 mt-5 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="btn-secondary text-xs !py-2 !px-5 font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
