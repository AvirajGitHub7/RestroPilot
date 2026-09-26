import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const TableManager = () => {
  const { user } = useAuth();
  const [tables, setTables] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [qrCache, setQrCache] = useState({});
  const [previewTable, setPreviewTable] = useState(null);

  // Live frontend origin
  const currentBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const restaurantId = user?.restaurantId;

  const fetchTablesAndRestaurant = async () => {
    try {
      const [tablesRes, restRes] = await Promise.all([
        API.get('/tables'),
        API.get('/restaurant/profile').catch(() => ({ data: null })),
      ]);
      setTables(tablesRes.data || []);
      setRestaurant(restRes.data || null);

      if (tablesRes.data && tablesRes.data.length > 0) {
        generateAllQRs(tablesRes.data, restRes.data?._id || user?.restaurantId);
      }
    } catch (err) {
      console.error('Failed to fetch tables:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateAllQRs = async (tableList, rId) => {
    const activeRestId = rId || restaurantId;
    const cache = {};
    for (const t of tableList) {
      const liveUrl = `${currentBaseUrl}/restaurant/${activeRestId}/table/${t.tableNumber}`;
      try {
        const dataUrl = await QRCode.toDataURL(liveUrl, {
          width: 600,
          margin: 2,
          color: { dark: '#0f172a', light: '#ffffff' },
        });
        cache[t.tableNumber] = dataUrl;
      } catch (err) {
        cache[t.tableNumber] = t.qrUrl;
      }
    }
    setQrCache(cache);
  };

  useEffect(() => {
    fetchTablesAndRestaurant();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTableNumber) return;
    setCreating(true);
    try {
      await API.post('/tables', { tableNumber: parseInt(newTableNumber) });
      setNewTableNumber('');
      await fetchTablesAndRestaurant();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create table');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this table?')) return;
    try {
      await API.delete(`/tables/${id}`);
      fetchTablesAndRestaurant();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  // Direct QR Code PNG Download
  const downloadQR = (table) => {
    const qrDataUrl = qrCache[table.tableNumber] || table.qrUrl;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${restaurant?.name || 'RestroPilot'}-Table-${table.tableNumber}-QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title text-2xl sm:text-3xl text-warm-900">Table & QR Code Manager</h1>
          <p className="text-warm-500 mt-1 text-sm sm:text-base">
            Create dining tables and download contactless QR codes for customers to scan and order.
          </p>
        </div>
      </div>

      {/* Create Table Form */}
      <div className="card p-5 sm:p-6 shadow-sm border border-warm-200 bg-white">
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-semibold text-warm-700 mb-2">New Table Number</label>
            <input
              type="number"
              min="1"
              value={newTableNumber}
              onChange={(e) => setNewTableNumber(e.target.value)}
              className="input-field"
              placeholder="e.g. 11"
              required
            />
          </div>
          <button type="submit" disabled={creating} className="btn-primary flex items-center justify-center gap-2">
            {creating ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
            Add Table
          </button>
        </form>
      </div>

      {/* Tables Grid */}
      {tables.length === 0 ? (
        <div className="card p-12 text-center border border-warm-200 bg-white">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warm-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-warm-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
            </svg>
          </div>
          <p className="text-warm-500 font-medium">No tables yet. Create your first table above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {tables.map((table) => {
            const tableQrUrl = qrCache[table.tableNumber] || table.qrUrl;

            return (
              <div
                key={table._id}
                className="card-hover p-6 text-center border border-warm-200 bg-white shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-warm-500 bg-warm-100 px-2 py-0.5 rounded-md">
                      DINING TABLE
                    </span>
                    <button
                      onClick={() => handleDelete(table._id)}
                      title="Delete Table"
                      className="text-warm-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div className="text-2xl font-black text-warm-900 mb-4">
                    Table {table.tableNumber}
                  </div>

                  {/* QR Preview Box */}
                  <div
                    onClick={() => setPreviewTable(table)}
                    className="bg-white border-2 border-warm-200 rounded-2xl p-4 inline-block mb-4 shadow-sm hover:border-brand-400 transition-colors cursor-pointer group"
                    title="Click to expand QR"
                  >
                    <img
                      src={tableQrUrl}
                      alt={`QR Code for Table ${table.tableNumber}`}
                      className="w-36 h-36 mx-auto rounded-lg transition-transform group-hover:scale-105"
                    />
                    <span className="text-[10px] font-semibold text-warm-500 mt-2 block group-hover:text-brand-600">
                      Tap to Preview
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-warm-100">
                  <button
                    onClick={() => downloadQR(table)}
                    className="btn-primary w-full !py-2.5 text-xs flex items-center justify-center gap-1.5 font-bold shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download QR Code
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Simple QR Preview Modal */}
      {previewTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="card p-6 sm:p-8 max-w-sm w-full text-center bg-white border border-warm-200 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-warm-100 mb-4">
              <h3 className="font-bold text-warm-900 text-lg">Table {previewTable.tableNumber} QR</h3>
              <button
                onClick={() => setPreviewTable(null)}
                className="p-1 rounded-lg text-warm-400 hover:text-warm-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-warm-50 p-4 rounded-2xl border border-warm-200 inline-block mb-4">
              <img
                src={qrCache[previewTable.tableNumber] || previewTable.qrUrl}
                alt="Table QR Code"
                className="w-56 h-56 mx-auto rounded-xl"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => downloadQR(previewTable)}
                className="btn-primary flex-1 text-xs !py-2.5 font-bold"
              >
                Download QR
              </button>
              <button
                onClick={() => setPreviewTable(null)}
                className="btn-secondary text-xs !py-2.5 px-4 font-semibold"
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

export default TableManager;
