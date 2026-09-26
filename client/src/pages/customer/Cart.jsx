import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import API from '../../api/axios';

const Cart = () => {
  const { restaurantId, tableNumber } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [cart, setCart] = useState(location.state?.cart || []);
  const restaurant = location.state?.restaurant;
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  const updateQuantity = (menuItemId, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.menuItemId === menuItemId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeItem = (menuItemId) => {
    setCart(prev => prev.filter(item => item.menuItemId !== menuItemId));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const placeOrder = async () => {
    if (cart.length === 0) return;
    setPlacing(true);
    setError('');

    try {
      const { data } = await API.post('/orders', {
        restaurantId,
        tableNumber: parseInt(tableNumber),
        items: cart,
      });

      // Clear cart from session
      sessionStorage.removeItem(`cart-${restaurantId}-${tableNumber}`);

      navigate(`/restaurant/${restaurantId}/table/${tableNumber}/confirmation`, {
        state: { order: data, restaurant },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50 px-4">
        <div className="card p-8 max-w-md text-center animate-fade-in border border-warm-200">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warm-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-warm-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-warm-900 mb-2">Your cart is empty</h2>
          <p className="text-warm-500 mb-6 font-medium">Add some delicious dishes from the menu</p>
          <button
            onClick={() => navigate(`/restaurant/${restaurantId}/table/${tableNumber}`)}
            className="btn-primary"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50 pb-36">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-warm-200 px-4 py-4 shadow-sm">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate(`/restaurant/${restaurantId}/table/${tableNumber}`)}
            className="w-10 h-10 rounded-xl bg-warm-100 flex items-center justify-center hover:bg-warm-200 transition-colors"
          >
            <svg className="w-5 h-5 text-warm-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-warm-900">Your Order</h1>
            <p className="text-warm-500 text-xs font-semibold">{restaurant?.name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm mb-4 animate-slide-down font-medium">
            {error}
          </div>
        )}

        {/* Cart Items */}
        <div className="space-y-3">
          {cart.map((item) => (
            <div key={item.menuItemId} className="card p-4 animate-slide-up border border-warm-200 bg-white shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-bold text-warm-900">{item.name}</h3>
                  <p className="text-brand-600 font-extrabold text-sm mt-0.5">₹{item.price} each</p>
                </div>
                <button
                  onClick={() => removeItem(item.menuItemId)}
                  className="text-warm-400 hover:text-red-500 transition-colors p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-warm-100">
                <div className="flex items-center gap-2 bg-warm-100 rounded-xl px-1 py-0.5">
                  <button
                    onClick={() => updateQuantity(item.menuItemId, -1)}
                    className="w-8 h-8 flex items-center justify-center text-warm-700 hover:bg-warm-200 rounded-lg transition-colors font-bold"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="text-warm-900 font-black text-sm min-w-[20px] text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.menuItemId, 1)}
                    className="w-8 h-8 flex items-center justify-center text-warm-700 hover:bg-warm-200 rounded-lg transition-colors font-bold"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                <span className="text-warm-900 font-black text-lg">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="card p-6 mt-6 border border-warm-200 bg-white shadow-sm">
          <h3 className="text-xs font-bold text-warm-500 uppercase tracking-wider mb-4">Summary Breakdown</h3>
          <div className="space-y-2.5">
            {cart.map((item) => (
              <div key={item.menuItemId} className="flex items-center justify-between text-sm">
                <span className="text-warm-700 font-medium">{item.quantity}× {item.name}</span>
                <span className="text-warm-900 font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-warm-200 pt-3 mt-3 flex items-center justify-between">
              <span className="font-bold text-warm-900 text-base">Grand Total</span>
              <span className="text-2xl font-black text-brand-600">₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Place Order Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-xl border-t border-warm-200 z-50 shadow-lg">
        <div className="max-w-lg mx-auto">
          <button
            onClick={placeOrder}
            disabled={placing}
            className="w-full bg-gradient-brand text-white font-extrabold py-4 px-6 rounded-2xl shadow-brand-lg
              flex items-center justify-center gap-3 active:scale-[0.98] transition-transform
              disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            {placing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Confirm & Send to Kitchen</span>
                <span className="bg-white/20 rounded-xl px-3 py-1 text-sm font-black">₹{total.toFixed(2)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
