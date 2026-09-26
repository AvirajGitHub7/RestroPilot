import { useState, useEffect } from 'react';
import API from '../../api/axios';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await API.get('/orders');
      setOrders(res.data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Auto-refresh orders every 15 seconds
  useEffect(() => {
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  // Quick 1-click status update (pending -> served -> paid)
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus });
      setToast(
        newStatus === 'served'
          ? 'Order marked as Served'
          : newStatus === 'paid'
          ? 'Order marked as Paid! Collection updated.'
          : `Order status set to ${newStatus}`
      );
      setTimeout(() => setToast(''), 3000);
      fetchOrders();
    } catch (err) {
      console.error('Failed to update status:', err);
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  // Clear / Delete order from table (removes data to keep database lightweight)
  const handleClearTable = async (orderId, tableNumber) => {
    if (!window.confirm(`Clear Table ${tableNumber} order? Table will be freed.`)) return;
    try {
      await API.delete(`/orders/${orderId}`);
      setToast(`Table ${tableNumber} order cleared and table freed.`);
      setTimeout(() => setToast(''), 3000);
      fetchOrders();
    } catch (err) {
      console.error('Failed to clear table:', err);
      alert('Failed to clear table order');
    }
  };

  // Calculations
  const paidOrders = orders.filter((o) => o.status === 'paid');
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const servedOrders = orders.filter((o) => o.status === 'served' || o.status === 'preparing' || o.status === 'completed');

  const totalPaidCollection = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  const statusCounts = {
    all: orders.length,
    pending: pendingOrders.length,
    served: servedOrders.length,
    paid: paidOrders.length,
  };

  const filteredOrders =
    filter === 'all'
      ? orders
      : filter === 'served'
      ? orders.filter((o) => o.status === 'served' || o.status === 'preparing' || o.status === 'completed')
      : orders.filter((o) => o.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-slide-down text-sm">
          <span>✓</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title text-2xl sm:text-3xl text-warm-900">Live Orders & Collections</h1>
          <p className="text-warm-500 mt-1 text-sm sm:text-base">
            Manage table orders, mark served or paid, and clear tables after dining.
          </p>
        </div>
        <div>
          <button
            onClick={fetchOrders}
            className="btn-secondary text-xs !py-2 !px-3.5 flex items-center gap-1.5 font-bold shadow-sm"
          >
            <svg className="w-4 h-4 text-warm-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Orders
          </button>
        </div>
      </div>

      {/* COLLECTION SUMMARY BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 border border-emerald-200 bg-emerald-50/50 shadow-sm">
          <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Paid Collection</p>
          <p className="text-3xl font-black text-emerald-700 mt-1">₹{totalPaidCollection.toFixed(0)}</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">{paidOrders.length} paid orders</p>
        </div>

        <div className="card p-5 border border-amber-200 bg-amber-50/50 shadow-sm">
          <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pending Orders</p>
          <p className="text-3xl font-black text-amber-700 mt-1">{pendingOrders.length}</p>
          <p className="text-xs text-amber-600 font-medium mt-1">Waiting to be served</p>
        </div>

        <div className="card p-5 border border-blue-200 bg-blue-50/50 shadow-sm">
          <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">Served Orders</p>
          <p className="text-3xl font-black text-blue-700 mt-1">{servedOrders.length}</p>
          <p className="text-xs text-blue-600 font-medium mt-1">Dining in progress</p>
        </div>

        <div className="card p-5 border border-warm-200 bg-white shadow-sm">
          <p className="text-xs font-bold text-warm-500 uppercase tracking-wider">Total Active Orders</p>
          <p className="text-3xl font-black text-warm-900 mt-1">{orders.length}</p>
          <p className="text-xs text-warm-400 font-medium mt-1">Across all tables</p>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {[
          { key: 'all', label: 'All Orders' },
          { key: 'pending', label: 'Pending' },
          { key: 'served', label: 'Served' },
          { key: 'paid', label: 'Paid' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shadow-sm ${
              filter === tab.key
                ? 'bg-brand-500 text-white shadow-brand'
                : 'bg-white text-warm-600 border border-warm-200 hover:bg-warm-100 hover:text-warm-900'
            }`}
          >
            {tab.label} ({statusCounts[tab.key]})
          </button>
        ))}
      </div>

      {/* ORDERS LIST */}
      {filteredOrders.length === 0 ? (
        <div className="card p-12 text-center border border-warm-200 bg-white">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-warm-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-warm-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-warm-900">No Orders in this View</h3>
          <p className="text-warm-500 text-xs mt-1">
            {filter === 'all'
              ? 'No active orders on any table right now.'
              : `There are currently no orders in "${filter}" status.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map((order) => {
            const tableNum = order.tableId?.tableNumber || '—';
            const isPending = order.status === 'pending';
            const isServed = order.status === 'served' || order.status === 'preparing' || order.status === 'completed';
            const isPaid = order.status === 'paid';

            return (
              <div
                key={order._id}
                className="card p-5 border border-warm-200 bg-white shadow-sm flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Table Number, Status Badge & Time */}
                  <div className="flex items-center justify-between pb-3 border-b border-warm-100 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black bg-warm-900 text-white px-3 py-1 rounded-lg">
                        Table {tableNum}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800'
                            : isServed
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isPaid ? 'Paid' : isServed ? 'Served' : 'Pending'}
                      </span>
                    </div>

                    <span className="text-xs text-warm-400 font-mono">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="space-y-1.5 py-1 max-h-48 overflow-y-auto pr-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className="w-5 h-5 rounded bg-warm-100 text-warm-800 font-bold flex items-center justify-center flex-shrink-0">
                            {item.quantity}
                          </span>
                          <span className="text-warm-800 font-medium truncate">{item.name}</span>
                        </div>
                        <span className="text-warm-600 font-mono font-semibold flex-shrink-0">
                          ₹{(item.price * item.quantity).toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Order Total */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-warm-100">
                    <span className="text-xs font-bold text-warm-500 uppercase tracking-wider">Total</span>
                    <span className="text-xl font-black text-brand-600">₹{order.total.toFixed(0)}</span>
                  </div>
                </div>

                {/* Quick 1-Click Status Flow Actions */}
                <div className="pt-4 border-t border-warm-100 mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    {/* If pending -> Mark Served */}
                    {isPending && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'served')}
                        className="btn-secondary flex-1 !py-2 text-xs font-bold flex items-center justify-center gap-1 hover:border-blue-400 hover:text-blue-700"
                      >
                        <span>Mark Served</span>
                        <span>✓</span>
                      </button>
                    )}

                    {/* If served -> Mark Paid */}
                    {isServed && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'paid')}
                        className="btn-primary flex-1 !py-2 text-xs font-bold flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                      >
                        <span>Mark Paid</span>
                        <span>₹</span>
                      </button>
                    )}

                    {/* If paid -> Clear Table Order */}
                    {isPaid && (
                      <button
                        onClick={() => handleClearTable(order._id, tableNum)}
                        className="btn-secondary flex-1 !py-2 text-xs font-bold flex items-center justify-center gap-1 text-emerald-800 border-emerald-300 hover:bg-emerald-50"
                      >
                        <span>Clear Table Order</span>
                        <span>🗑️</span>
                      </button>
                    )}
                  </div>

                  {/* Option to clear/cancel without payment */}
                  {!isPaid && (
                    <div className="text-right">
                      <button
                        onClick={() => handleClearTable(order._id, tableNum)}
                        className="text-[11px] text-warm-400 hover:text-red-600 font-medium transition-colors"
                      >
                        Clear Table
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
