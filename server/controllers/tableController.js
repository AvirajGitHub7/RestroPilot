const QRCode = require('qrcode');
const Table = require('../models/Table');

// Helper to get client base URL
const getClientBaseUrl = (req) => {
  if (process.env.CLIENT_URL) {
    return process.env.CLIENT_URL.split(',')[0].trim().replace(/\/$/, '');
  }
  if (req?.headers?.origin) {
    return req.headers.origin.replace(/\/$/, '');
  }
  return 'http://localhost:5173';
};

// @desc    Create a table
// @route   POST /api/tables
exports.createTable = async (req, res) => {
  try {
    const { tableNumber } = req.body;
    const restaurantId = req.user.restaurantId;

    if (!tableNumber || isNaN(tableNumber)) {
      return res.status(400).json({ message: 'Valid table number is required' });
    }

    // Check if table number already exists for this restaurant
    const existing = await Table.findOne({ restaurantId, tableNumber });
    if (existing) {
      return res.status(400).json({ message: `Table ${tableNumber} already exists` });
    }

    // Generate QR code URL
    const baseUrl = getClientBaseUrl(req);
    const orderUrl = `${baseUrl}/restaurant/${restaurantId}/table/${tableNumber}`;
    const qrUrl = await QRCode.toDataURL(orderUrl, {
      width: 400,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });

    const table = await Table.create({
      restaurantId,
      tableNumber,
      qrUrl,
    });

    res.status(201).json(table);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all tables for owner's restaurant
// @route   GET /api/tables
exports.getTables = async (req, res) => {
  try {
    const tables = await Table.find({ restaurantId: req.user.restaurantId })
      .sort({ tableNumber: 1 });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Regenerate all QR codes for owner's restaurant using current host
// @route   POST /api/tables/sync-qr
exports.syncTablesQR = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const baseUrl = req.body.baseUrl?.trim().replace(/\/$/, '') || getClientBaseUrl(req);

    const tables = await Table.find({ restaurantId });
    for (const table of tables) {
      const orderUrl = `${baseUrl}/restaurant/${restaurantId}/table/${table.tableNumber}`;
      table.qrUrl = await QRCode.toDataURL(orderUrl, {
        width: 400,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      });
      await table.save();
    }

    const updatedTables = await Table.find({ restaurantId }).sort({ tableNumber: 1 });
    res.json({
      message: `Synchronized ${tables.length} table QR codes to ${baseUrl}`,
      tables: updatedTables,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a table
// @route   DELETE /api/tables/:id
exports.deleteTable = async (req, res) => {
  try {
    const table = await Table.findOneAndDelete({
      _id: req.params.id,
      restaurantId: req.user.restaurantId,
    });

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    res.json({ message: 'Table deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
