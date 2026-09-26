import { useLocation, useNavigate, useParams } from 'react-router-dom';

const OrderConfirmation = () => {
  const { restaurantId, tableNumber } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;
  const restaurant = location.state?.restaurant;

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50 px-4">
        <div className="card p-8 max-w-md text-center border border-warm-200">
          <p className="text-warm-500 mb-4 font-medium">No order data found</p>
          <button
            onClick={() => navigate(`/restaurant/${restaurantId}/table/${tableNumber}`)}
            className="btn-primary"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50 px-4 py-12">
      <div className="w-full max-w-md animate-scale-in">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-emerald-100 flex items-center justify-center
            border-4 border-emerald-200 shadow-sm">
            <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-warm-900 mb-2">Order Received!</h1>
          <p className="text-warm-500 font-medium">Your delicious meal has been sent to the kitchen</p>
        </div>

        {/* Order Details Card */}
        <div className="card p-6 space-y-4 border border-warm-200 bg-white shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-warm-500 text-sm font-medium">Order Number</span>
            <span className="text-warm-900 font-mono font-bold text-sm">#{order._id.slice(-8).toUpperCase()}</span>
          </div>

          {restaurant && (
            <div className="flex items-center justify-between">
              <span className="text-warm-500 text-sm font-medium">Restaurant</span>
              <span className="text-warm-900 font-semibold text-sm">{restaurant.name}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-warm-500 text-sm font-medium">Status</span>
            <span className="badge-pending capitalize">{order.status}</span>
          </div>

          <div className="border-t border-warm-100 pt-4">
            <p className="text-xs font-bold text-warm-500 uppercase tracking-wider mb-3">Items Ordered</p>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-warm-800 font-medium">{item.quantity}× {item.name}</span>
                  <span className="text-warm-600 font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-warm-200 pt-4 flex items-center justify-between">
            <span className="font-bold text-warm-900 text-base">Total Amount</span>
            <span className="text-2xl font-black text-brand-600">
              ₹{order.total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action */}
        <button
          onClick={() => navigate(`/restaurant/${restaurantId}/table/${tableNumber}`)}
          className="btn-secondary w-full mt-6 flex items-center justify-center gap-2 font-bold py-3.5"
        >
          <svg className="w-5 h-5 text-warm-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Order Additional Items
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
