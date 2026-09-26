import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const TableManager = () => {
  const { user } = useAuth();
  const [tables, setTables] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [qrCache, setQrCache] = useState({});
  const [previewTable, setPreviewTable] = useState(null);
  const [syncNotice, setSyncNotice] = useState('');

  // The live frontend origin (e.g. https://restropilot.vercel.app or local IP)
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

      // Generate sharp client-side QR codes matching current active domain
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

  // Synchronize backend QR codes with current domain
  const handleSyncQR = async () => {
    setSyncing(true);
    setSyncNotice('');
    try {
      const { data } = await API.post('/tables/sync-qr', { baseUrl: currentBaseUrl });
      setTables(data.tables || tables);
      await generateAllQRs(data.tables || tables, restaurantId);
      setSyncNotice(`Successfully synchronized all QR codes to ${currentBaseUrl}`);
      setTimeout(() => setSyncNotice(''), 5000);
    } catch (err) {
      console.error('Failed to sync QR codes:', err);
      alert('Failed to sync QR codes: ' + (err.response?.data?.message || err.message));
    } finally {
      setSyncing(false);
    }
  };

  // Download raw QR code PNG
  const downloadQR = (table) => {
    const qrDataUrl = qrCache[table.tableNumber] || table.qrUrl;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${restaurant?.name || 'RestroPilot'}-Table-${table.tableNumber}-QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate and download a high-res printable table stand card
  const downloadPrintableCard = async (table) => {
    const qrDataUrl = qrCache[table.tableNumber] || table.qrUrl;
    const canvas = document.createElement('canvas');
    const width = 1200;
    const height = 1600;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 1. Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 2. Top Banner Header
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#f97316');
    gradient.addColorStop(0.5, '#ea580c');
    gradient.addColorStop(1, '#d97706');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, 220);

    // 3. Header Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 52px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    const restName = (restaurant?.name || 'RestroPilot Dining').toUpperCase();
    ctx.fillText(restName, width / 2, 110);

    ctx.font = '500 28px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText('DIGITAL MENU & CONTACTLESS ORDERING', width / 2, 165);

    // 4. Table Number Badge
    ctx.fillStyle = '#fef3c7';
    const badgeW = 420;
    const badgeH = 80;
    const badgeX = (width - badgeW) / 2;
    const badgeY = 270;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 40);
    ctx.fill();

    ctx.fillStyle = '#9a3412';
    ctx.font = '900 42px system-ui, -apple-system, sans-serif';
    ctx.fillText(`TABLE ${table.tableNumber}`, width / 2, badgeY + 56);

    // 5. QR Code in White Card Container with Shadow
    const qrCardSize = 750;
    const qrCardX = (width - qrCardSize) / 2;
    const qrCardY = 400;

    ctx.fillStyle = '#fafaf9';
    ctx.strokeStyle = '#e7e5e4';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(qrCardX, qrCardY, qrCardSize, qrCardSize, 36);
    ctx.fill();
    ctx.stroke();

    // Draw QR image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = qrDataUrl;
    await new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
    });

    const qrInnerSize = 650;
    const qrInnerX = (width - qrInnerSize) / 2;
    const qrInnerY = qrCardY + (qrCardSize - qrInnerSize) / 2;
    ctx.drawImage(img, qrInnerX, qrInnerY, qrInnerSize, qrInnerSize);

    // 6. Action Instructions
    ctx.fillStyle = '#0f172a';
    ctx.font = '800 48px system-ui, -apple-system, sans-serif';
    ctx.fillText('SCAN TO VIEW MENU & ORDER', width / 2, 1230);

    ctx.fillStyle = '#64748b';
    ctx.font = '500 30px system-ui, -apple-system, sans-serif';
    ctx.fillText('1. Open your phone camera', width / 2, 1295);
    ctx.fillText('2. Point at QR code & tap the link', width / 2, 1345);
    ctx.fillText('3. Browse dishes & order from your phone!', width / 2, 1395);

    // 7. Footer Divider & Brand
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 1460);
    ctx.lineTo(width - 100, 1460);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 24px system-ui, -apple-system, sans-serif';
    ctx.fillText('POWERED BY RESTROPILOT • SMART DINING SaaS', width / 2, 1515);

    // Trigger download
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${restaurant?.name || 'Restaurant'}-Table-${table.tableNumber}-Stand-Card.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintAll = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="section-title text-2xl sm:text-3xl text-warm-900">Table & QR Code Manager</h1>
          <p className="text-warm-500 mt-1 text-sm sm:text-base">
            Create dining tables and generate contactless QR codes that load directly on customers&apos; mobile phones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSyncQR}
            disabled={syncing}
            className="btn-secondary !px-3.5 !py-2 text-xs flex items-center gap-2 font-bold shadow-sm"
            title="Ensure QR codes encode the current live URL"
          >
            {syncing ? (
              <div className="w-4 h-4 border-2 border-warm-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4 text-warm-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            Sync with Current Domain
          </button>

          {tables.length > 0 && (
            <button
              onClick={handlePrintAll}
              className="btn-secondary !px-3.5 !py-2 text-xs flex items-center gap-2 font-bold shadow-sm"
            >
              <svg className="w-4 h-4 text-warm-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Table Stands
            </button>
          )}
        </div>
      </div>

      {syncNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-3 rounded-xl animate-slide-down flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {syncNotice}
        </div>
      )}

      {/* Info Card: Domain & QR Targeting */}
      <div className="card p-4 sm:p-5 border border-brand-200 bg-gradient-to-r from-brand-50/70 via-white to-amber-50/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm font-black text-sm">
            QR
          </div>
          <div>
            <p className="text-xs font-bold text-warm-800 uppercase tracking-wider">Active QR Scan Target Host</p>
            <p className="text-xs text-warm-600 font-mono mt-0.5 break-all">
              {currentBaseUrl}
            </p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-brand-700 bg-brand-100/80 px-2.5 py-1 rounded-lg border border-brand-200 self-start sm:self-auto">
          ● Ready for mobile cameras
        </span>
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
              placeholder="e.g. 6"
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
            const targetUrl = `${currentBaseUrl}/restaurant/${restaurantId}/table/${table.tableNumber}`;

            return (
              <div
                key={table._id}
                className="card-hover p-6 text-center border border-warm-200 bg-white shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
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

                  <div className="text-3xl font-black text-warm-900 mb-4">
                    Table {table.tableNumber}
                  </div>

                  {/* QR Preview Box */}
                  <div
                    onClick={() => setPreviewTable(table)}
                    className="bg-white border-2 border-warm-200 rounded-2xl p-4 inline-block mb-4 shadow-sm hover:border-brand-400 transition-colors cursor-pointer group"
                    title="Click to expand & test scan"
                  >
                    <img
                      src={tableQrUrl}
                      alt={`QR Code for Table ${table.tableNumber}`}
                      className="w-36 h-36 mx-auto rounded-lg transition-transform group-hover:scale-105"
                    />
                    <span className="text-[10px] font-bold text-brand-600 mt-2 block group-hover:underline">
                      🔍 Tap to Preview
                    </span>
                  </div>

                  {/* Scanned Link details */}
                  <div className="mb-4">
                    <a
                      href={targetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-warm-500 hover:text-brand-600 font-mono truncate block hover:underline"
                      title="Test live link directly"
                    >
                      /table/{table.tableNumber} ↗
                    </a>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-3 border-t border-warm-100">
                  <button
                    onClick={() => downloadPrintableCard(table)}
                    className="btn-primary w-full !py-2.5 text-xs flex items-center justify-center gap-1.5 font-bold shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Table Stand Card
                  </button>

                  <button
                    onClick={() => downloadQR(table)}
                    className="btn-secondary w-full !py-2 text-xs flex items-center justify-center gap-1.5 font-semibold text-warm-700 hover:bg-warm-100"
                  >
                    <svg className="w-3.5 h-3.5 text-warm-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download QR Only
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Live Scan Test Modal */}
      {previewTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="card p-6 sm:p-8 max-w-sm w-full text-center bg-white border border-warm-200 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-warm-100 mb-4">
              <h3 className="font-extrabold text-warm-900 text-lg">Table {previewTable.tableNumber} QR Scan Test</h3>
              <button
                onClick={() => setPreviewTable(null)}
                className="p-1 rounded-lg text-warm-400 hover:text-warm-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-xs text-warm-500 mb-4 font-medium">
              Scan this with your mobile phone camera to test live menu ordering:
            </p>

            <div className="bg-warm-50 p-4 rounded-2xl border-2 border-brand-200 inline-block shadow-inner mb-4">
              <img
                src={qrCache[previewTable.tableNumber] || previewTable.qrUrl}
                alt="Table QR Code"
                className="w-56 h-56 mx-auto rounded-xl"
              />
            </div>

            <div className="bg-warm-50 rounded-xl p-3 border border-warm-200 mb-5 text-left">
              <p className="text-[10px] font-bold text-warm-400 uppercase tracking-wider">Target Scan Link</p>
              <p className="text-xs text-brand-700 font-mono break-all mt-0.5 font-bold">
                {`${currentBaseUrl}/restaurant/${restaurantId}/table/${previewTable.tableNumber}`}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => downloadPrintableCard(previewTable)}
                className="btn-primary flex-1 text-xs !py-2.5 font-bold"
              >
                Download Stand
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
