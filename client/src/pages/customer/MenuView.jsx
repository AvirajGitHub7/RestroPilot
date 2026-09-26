import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';

const MenuView = () => {
  const { restaurantId, tableNumber } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Validate table
        await API.get(`/public/restaurant/${restaurantId}/table/${tableNumber}`);
        // Fetch menu
        const { data } = await API.get(`/public/restaurant/${restaurantId}/menu`);
        setRestaurant(data.restaurant);
        setMenu(data.menu);
        if (data.menu.length > 0) {
          const categories = [...new Set(data.menu.map(i => i.category))];
          setActiveCategory(categories[0]);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Restaurant or table not found');
      } finally {
        setLoading(false);
      }
    };

    // Load cart from sessionStorage
    const savedCart = sessionStorage.getItem(`cart-${restaurantId}-${tableNumber}`);
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch { /* ignore */ }
    }

    fetchData();
  }, [restaurantId, tableNumber]);

  // Save cart to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(`cart-${restaurantId}-${tableNumber}`, JSON.stringify(cart));
  }, [cart, restaurantId, tableNumber]);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItemId === item._id);
      if (existing) {
        return prev.map(c =>
          c.menuItemId === item._id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, {
        menuItemId: item._id,
        name: item.name,
        price: item.price,
        quantity: 1,
      }];
    });
  };

  const removeFromCart = (menuItemId) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItemId === menuItemId);
      if (existing && existing.quantity > 1) {
        return prev.map(c =>
          c.menuItemId === menuItemId ? { ...c, quantity: c.quantity - 1 } : c
        );
      }
      return prev.filter(c => c.menuItemId !== menuItemId);
    });
  };

  const getCartQuantity = (menuItemId) => {
    const item = cart.find(c => c.menuItemId === menuItemId);
    return item ? item.quantity : 0;
  };

  const totalItems = cart.reduce((sum, c) => sum + c.quantity, 0);
  const totalPrice = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  // Group categories and counts
  const categories = [...new Set(menu.map(i => i.category))];

  // Filter items by category & search
  const filteredItems = menu.filter(item => {
    const matchesCategory = activeCategory === 'all' || !activeCategory || item.category === activeCategory;
    const matchesSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()) || (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-warm-500 text-sm font-semibold">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50 px-4">
        <div className="card p-8 max-w-md text-center animate-fade-in border border-warm-200">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-warm-900 mb-2">Notice</h2>
          <p className="text-warm-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50 pb-32">
      {/* Hero Banner with Restaurant Logo & Details */}
      <div className="relative bg-warm-900 overflow-hidden shadow-md">
        {/* Banner Image or Fallback Gradient */}
        <div className="relative h-48 sm:h-64 w-full">
          {restaurant?.banner ? (
            <img
              src={restaurant.banner}
              alt={restaurant.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-brand" />
          )}
          {/* Gradient Overlay for high-contrast legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

          {/* Restaurant Details bottom */}
          <div className="absolute bottom-5 left-4 right-4 max-w-lg mx-auto z-10 text-white">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-brand-500 text-white font-black text-xs px-2.5 py-0.5 rounded-lg shadow-sm border border-white/20">
                Table {tableNumber}
              </span>
              <span className="bg-black/40 backdrop-blur-sm text-white/90 text-[11px] font-semibold px-2 py-0.5 rounded-lg">
                Dine-in Menu
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight truncate drop-shadow-md">
              {restaurant?.name}
            </h1>
            {restaurant?.description ? (
              <p className="text-white/85 text-xs sm:text-sm line-clamp-2 mt-1 font-medium leading-snug">
                {restaurant.description}
              </p>
            ) : (
              <p className="text-white/70 text-xs mt-0.5">Welcome! Browse dishes & order straight from your table</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-lg mx-auto px-4 mt-4 relative">
        {/* Search Input */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-warm-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search our delicious dishes..."
            className="w-full bg-white border border-warm-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-warm-900 placeholder-warm-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-warm-400 hover:text-warm-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Category Tabs */}
        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 shadow-sm ${
                activeCategory === 'all'
                  ? 'bg-brand-500 text-white shadow-brand'
                  : 'bg-white text-warm-600 border border-warm-200 hover:bg-warm-100'
              }`}
            >
              All Items ({menu.length})
            </button>
            {categories.map((cat) => {
              const catCount = menu.filter(i => i.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 shadow-sm ${
                    activeCategory === cat
                      ? 'bg-brand-500 text-white shadow-brand'
                      : 'bg-white text-warm-600 border border-warm-200 hover:bg-warm-100'
                  }`}
                >
                  {cat} ({catCount})
                </button>
              );
            })}
          </div>
        )}

        {/* Items List */}
        {filteredItems.length === 0 ? (
          <div className="card p-10 text-center border border-warm-200 bg-white">
            <p className="text-warm-400 font-semibold text-sm">No dishes matched your search</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="mt-3 text-brand-600 font-bold text-xs hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const qty = getCartQuantity(item._id);
              return (
                <div key={item._id} className="card p-4 animate-slide-up border border-warm-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    {/* Food Image or Placeholder */}
                    <div className="flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border border-warm-100 shadow-sm"
                          onError={(e) => {
                            // Replace broken image with placeholder
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      {/* Placeholder - shown when no image or image fails */}
                      <div
                        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gradient-to-br from-amber-50 to-orange-100 border border-warm-100 items-center justify-center shadow-sm ${item.image ? 'hidden' : 'flex'}`}
                      >
                        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11l1-7M9 11L8 4M5 19h14M6 15h12l1 4H5l1-4z" />
                        </svg>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold text-warm-400 uppercase tracking-wider bg-warm-100 px-2 py-0.5 rounded-md">
                          {item.category}
                        </span>
                      </div>
                      <h3 className="font-bold text-warm-900 text-base leading-tight mt-1">{item.name}</h3>
                      {item.description && (
                        <p className="text-warm-500 text-xs mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                      )}
                      <div className="flex items-center justify-between gap-2 mt-2.5">
                        <span className="text-lg font-black text-brand-600">₹{item.price}</span>

                        {/* Quantity or Add Button */}
                        {qty === 0 ? (
                          <button
                            onClick={() => addToCart(item)}
                            className="bg-brand-50 text-brand-700 hover:bg-brand-500 hover:text-white px-4 py-1.5 rounded-xl text-xs font-black
                              border border-brand-200 transition-all active:scale-95 shadow-sm"
                          >
                            + ADD
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 bg-brand-50 rounded-xl border border-brand-200 p-1 shadow-sm">
                            <button
                              onClick={() => removeFromCart(item._id)}
                              className="w-7 h-7 flex items-center justify-center text-brand-700 hover:bg-brand-200/50 rounded-lg transition-colors font-bold"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="text-brand-900 font-black text-sm min-w-[22px] text-center">{qty}</span>
                            <button
                              onClick={() => addToCart(item)}
                              className="w-7 h-7 flex items-center justify-center text-brand-700 hover:bg-brand-200/50 rounded-lg transition-colors font-bold"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer branding */}
        <div className="text-center pt-8 pb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warm-100/80 text-[11px] font-semibold text-warm-500">
            <span>Table {tableNumber}</span>
            <span>•</span>
            <span>Powered by <strong className="text-warm-800">RestroPilot</strong></span>
          </div>
        </div>
      </div>

      {/* Floating Cart Bottom Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 animate-slide-up z-50">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => navigate(`/restaurant/${restaurantId}/table/${tableNumber}/cart`, { state: { cart, restaurant } })}
              className="w-full bg-gradient-brand text-white font-bold py-3.5 sm:py-4 px-6 rounded-2xl shadow-brand-lg
                flex items-center justify-between active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-3">
                <span className="bg-white/25 rounded-xl px-2.5 py-1 text-sm font-black">{totalItems}</span>
                <span className="text-sm sm:text-base font-bold">View Cart ({totalItems} items)</span>
              </div>
              <span className="font-black text-base sm:text-lg">₹{totalPrice.toFixed(2)} →</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuView;
