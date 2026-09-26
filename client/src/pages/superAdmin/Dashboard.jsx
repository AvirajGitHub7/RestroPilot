import { useState, useEffect } from 'react';
import API from '../../api/axios';

const AdminDashboard = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchRestaurants = async () => {
    try {
      const { data } = await API.get('/admin/restaurants');
      setRestaurants(data);
    } catch (err) {
      console.error('Failed to fetch restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await API.put(`/admin/restaurants/${id}/approve`);
      fetchRestaurants();
    } catch (err) {
      console.error('Failed to approve:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      await API.put(`/admin/restaurants/${id}/reject`);
      fetchRestaurants();
    } catch (err) {
      console.error('Failed to reject:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggle = async (id) => {
    setActionLoading(id);
    try {
      await API.put(`/admin/restaurants/${id}/toggle`);
      fetchRestaurants();
    } catch (err) {
      console.error('Failed to toggle:', err);
    } finally {
      setActionLoading(null);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Separate pending vs active/inactive restaurants
  const pending = restaurants.filter(r => !r.ownerId?.approved && !r.active);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <div>
        <h1 className="section-title text-2xl sm:text-3xl text-warm-900">Super Admin Dashboard</h1>
        <p className="text-warm-500 text-sm sm:text-base mt-1">Manage restaurant registrations and system access</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="stat-card">
          <span className="text-warm-500 text-xs sm:text-sm font-medium">Total Restaurants</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-warm-900">{restaurants.length}</span>
        </div>
        <div className="stat-card border-amber-200/80 bg-amber-50/40">
          <span className="text-amber-700 text-xs sm:text-sm font-medium">Pending Approval</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">{pending.length}</span>
        </div>
        <div className="stat-card border-emerald-200/80 bg-emerald-50/40">
          <span className="text-emerald-700 text-xs sm:text-sm font-medium">Active Restaurants</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
            {restaurants.filter(r => r.active).length}
          </span>
        </div>
      </div>

      {/* Pending Approvals */}
      {pending.length > 0 && (
        <div>
          <h2 className="text-base sm:text-lg font-bold text-warm-900 mb-3 sm:mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            Pending Approvals ({pending.length})
          </h2>
          <div className="grid gap-4">
            {pending.map((restaurant) => (
              <div key={restaurant._id} className="card-hover animate-slide-up border-l-4 border-l-amber-500 bg-white overflow-hidden">
                {/* Banner preview */}
                {restaurant.banner && (
                  <div className="h-24 w-full overflow-hidden">
                    <img
                      src={restaurant.banner}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                    />
                  </div>
                )}
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-warm-900">{restaurant.name}</h3>
                      {restaurant.description && (
                        <p className="text-xs text-warm-500 line-clamp-2 mt-0.5">{restaurant.description}</p>
                      )}
                      <p className="text-warm-600 text-xs sm:text-sm mt-1">
                        Owner: <span className="font-semibold text-warm-800">{restaurant.ownerId?.name}</span> ({restaurant.ownerId?.email})
                      </p>
                      <span className="badge-pending mt-2">Awaiting Approval</span>
                    </div>

                    <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-warm-100">
                      <button
                        onClick={() => handleApprove(restaurant._id)}
                        disabled={actionLoading === restaurant._id}
                        className="btn-success flex-1 sm:flex-initial !px-4 !py-2 text-xs sm:text-sm shadow-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(restaurant._id)}
                        disabled={actionLoading === restaurant._id}
                        className="btn-danger flex-1 sm:flex-initial !px-4 !py-2 text-xs sm:text-sm shadow-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Restaurants */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-warm-900 mb-3 sm:mb-4">All Registered Restaurants</h2>
        {restaurants.length === 0 ? (
          <div className="card p-8 sm:p-12 text-center">
            <p className="text-warm-400">No restaurants registered yet</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View (shown on screens < 640px) */}
            <div className="sm:hidden space-y-3">
              {restaurants.map((restaurant) => (
                <div key={restaurant._id} className="card border border-warm-200 bg-white overflow-hidden">
                  {/* Banner preview */}
                  {restaurant.banner && (
                    <div className="h-20 w-full overflow-hidden">
                      <img
                        src={restaurant.banner}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-warm-900 text-base truncate">{restaurant.name}</h3>
                        {restaurant.active ? (
                          <span className="badge-success text-[10px]">Active</span>
                        ) : restaurant.ownerId?.approved === false ? (
                          <span className="badge-pending text-[10px]">Pending</span>
                        ) : (
                          <span className="badge-danger text-[10px]">Inactive</span>
                        )}
                      </div>
                      {restaurant.description && (
                        <p className="text-xs text-warm-500 line-clamp-2 mt-0.5">{restaurant.description}</p>
                      )}
                      <p className="text-xs text-warm-500 mt-1">{restaurant.ownerId?.name} ({restaurant.ownerId?.email})</p>
                    </div>

                    <div className="pt-2 border-t border-warm-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-warm-400">
                        {new Date(restaurant.createdAt).toLocaleDateString()}
                      </span>
                      {!restaurant.ownerId?.approved && !restaurant.active ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(restaurant._id)}
                            disabled={actionLoading === restaurant._id}
                            className="btn-success !px-3 !py-1 text-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(restaurant._id)}
                            disabled={actionLoading === restaurant._id}
                            className="btn-danger !px-3 !py-1 text-xs"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleToggle(restaurant._id)}
                          disabled={actionLoading === restaurant._id}
                          className={`text-xs font-bold px-3 py-1 rounded-lg border transition-colors ${
                            restaurant.active
                              ? 'text-red-600 border-red-200 bg-red-50 hover:bg-red-100'
                              : 'text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                          }`}
                        >
                          {restaurant.active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop / Tablet Table View (hidden on screens < 640px) */}
            <div className="hidden sm:block card overflow-hidden shadow-card border border-warm-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-warm-200 bg-warm-50/80">
                      <th className="text-left text-xs font-bold text-warm-500 uppercase tracking-wider px-6 py-4">Restaurant</th>
                      <th className="text-left text-xs font-bold text-warm-500 uppercase tracking-wider px-6 py-4">Owner</th>
                      <th className="text-left text-xs font-bold text-warm-500 uppercase tracking-wider px-6 py-4">Status</th>
                      <th className="text-right text-xs font-bold text-warm-500 uppercase tracking-wider px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warm-100 bg-white">
                    {restaurants.map((restaurant) => (
                      <tr key={restaurant._id} className="hover:bg-warm-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="min-w-0 max-w-sm">
                            <span className="font-bold text-warm-900 block text-base">{restaurant.name}</span>
                            {restaurant.description ? (
                              <p className="text-xs text-warm-500 truncate mt-0.5">{restaurant.description}</p>
                            ) : (
                              <span className="text-[11px] text-warm-300 italic">No tagline set</span>
                            )}
                            {restaurant.banner && (
                              <div className="mt-2 h-12 w-32 rounded-lg overflow-hidden border border-warm-100">
                                <img
                                  src={restaurant.banner}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                                />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <span className="text-warm-800 text-sm font-semibold">{restaurant.ownerId?.name}</span>
                            <p className="text-warm-400 text-xs">{restaurant.ownerId?.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {restaurant.active ? (
                            <span className="badge-success">Active</span>
                          ) : restaurant.ownerId?.approved === false ? (
                            <span className="badge-pending">Pending</span>
                          ) : (
                            <span className="badge-danger">Inactive</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!restaurant.ownerId?.approved && !restaurant.active ? (
                              <>
                                <button
                                  onClick={() => handleApprove(restaurant._id)}
                                  disabled={actionLoading === restaurant._id}
                                  className="text-emerald-600 hover:text-emerald-700 font-bold text-xs sm:text-sm transition-colors"
                                >
                                  Approve
                                </button>
                                <span className="text-warm-300">|</span>
                                <button
                                  onClick={() => handleReject(restaurant._id)}
                                  disabled={actionLoading === restaurant._id}
                                  className="text-red-500 hover:text-red-600 font-bold text-xs sm:text-sm transition-colors"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleToggle(restaurant._id)}
                                disabled={actionLoading === restaurant._id}
                                className={`text-xs sm:text-sm font-bold transition-colors ${
                                  restaurant.active
                                    ? 'text-red-500 hover:text-red-600'
                                    : 'text-emerald-600 hover:text-emerald-700'
                                }`}
                              >
                                {restaurant.active ? 'Deactivate' : 'Activate'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
