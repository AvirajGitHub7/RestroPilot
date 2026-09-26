import { useState, useEffect } from 'react';
import API from '../../api/axios';

const MenuManager = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    available: true,
  });
  const [saving, setSaving] = useState(false);

  const fetchMenu = async () => {
    try {
      const { data } = await API.get('/menu');
      setItems(data);
    } catch (err) {
      console.error('Failed to fetch menu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setFormData({ name: '', description: '', price: '', image: '', category: '', available: true });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item._id);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      category: item.category,
      available: item.available,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...formData, price: parseFloat(formData.price) };
      if (editing) {
        await API.put(`/menu/${editing}`, payload);
      } else {
        await API.post('/menu', payload);
      }
      setShowModal(false);
      fetchMenu();
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this menu item?')) return;
    try {
      await API.delete(`/menu/${id}`);
      fetchMenu();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const toggleAvailability = async (item) => {
    try {
      await API.put(`/menu/${item._id}`, { available: !item.available });
      fetchMenu();
    } catch (err) {
      console.error('Failed to toggle:', err);
    }
  };

  // Group by category
  const grouped = items.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title text-3xl text-warm-900">Menu Manager</h1>
          <p className="text-warm-500 mt-1">{items.length} items across {Object.keys(grouped).length} categories</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warm-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-warm-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-warm-500 mb-4 font-medium">No menu items yet</p>
          <button onClick={openAdd} className="btn-primary text-sm">Add your first item</button>
        </div>
      ) : (
        Object.entries(grouped).map(([category, catItems]) => (
          <div key={category} className="space-y-3">
            <h2 className="text-sm font-bold text-warm-600 uppercase tracking-wider px-1">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {catItems.map((item) => (
                <div key={item._id} className={`card-hover p-5 border border-warm-100 ${!item.available ? 'opacity-60 bg-warm-50' : 'bg-white'}`}>
                  <div className="flex gap-4">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-warm-100"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-warm-900 truncate">{item.name}</h3>
                        <span className="text-brand-600 font-extrabold whitespace-nowrap">₹{item.price}</span>
                      </div>
                      {item.description && (
                        <p className="text-warm-500 text-sm mt-1 line-clamp-2">{item.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-warm-100">
                        <button
                          onClick={() => toggleAvailability(item)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                            item.available
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-warm-100 text-warm-600 border border-warm-200 hover:bg-warm-200'
                          }`}
                        >
                          {item.available ? '● Available' : '○ Unavailable'}
                        </button>
                        <button
                          onClick={() => openEdit(item)}
                          className="text-xs text-warm-600 hover:text-brand-600 font-medium px-2 py-1 rounded-lg hover:bg-warm-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative card p-5 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in bg-white border border-warm-200">
            <h2 className="text-lg sm:text-xl font-extrabold text-warm-900 mb-5">
              {editing ? 'Edit Menu Item' : 'Add Menu Item'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-warm-700 mb-1.5">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Butter Chicken"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-warm-700 mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field resize-none h-20"
                  placeholder="Creamy tomato-based curry..."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-warm-700 mb-1.5">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input-field"
                    placeholder="299"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-warm-700 mb-1.5">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                    placeholder="Main Course"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-warm-700 mb-1.5">Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="input-field"
                  placeholder="https://example.com/food.jpg"
                />
              </div>
              <div className="flex items-center gap-3 pt-1">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-warm-200 peer-focus:outline-none rounded-full peer peer-checked:bg-brand-500 transition-colors
                    after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform peer-checked:after:translate-x-4 shadow-sm" />
                </label>
                <span className="text-sm font-medium text-warm-700">Item is available for ordering</span>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-warm-100">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary text-sm flex items-center gap-2">
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : null}
                  {editing ? 'Update Item' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManager;
