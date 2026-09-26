const Report = require('../models/Report');
const { generateMonthlyReports } = require('../services/reportService');

// @desc    Get reports for owner's restaurant (only non-expired)
// @route   GET /api/reports
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find({
      restaurantId: req.user.restaurantId,
      expiresAt: { $gt: new Date() },
    }).sort({ year: -1, month: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Download report as CSV
// @route   GET /api/reports/:id/download
exports.downloadReport = async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      restaurantId: req.user.restaurantId,
      expiresAt: { $gt: new Date() },
    });

    if (!report) {
      return res.status(404).json({ message: 'Report not found or expired' });
    }

    // Build CSV content
    let csv = '';

    // Summary section
    csv += `Monthly Report - ${report.period}\r\n`;
    csv += `Generated,${report.createdAt.toISOString()}\r\n`;
    csv += `\r\n`;
    csv += `SUMMARY\r\n`;
    csv += `Total Orders,${report.totalOrders}\r\n`;
    csv += `Total Revenue,${report.totalRevenue.toFixed(2)}\r\n`;
    csv += `\r\n`;

    // Most sold items
    csv += `TOP SELLING ITEMS\r\n`;
    csv += `Item Name,Quantity Sold,Revenue\r\n`;
    for (const item of report.mostSoldItems) {
      // Escape commas in item names
      const name = item.name.includes(',') ? `"${item.name}"` : item.name;
      csv += `${name},${item.quantity},${item.revenue.toFixed(2)}\r\n`;
    }
    csv += `\r\n`;

    // Orders by day
    csv += `DAILY BREAKDOWN\r\n`;
    csv += `Date,Orders,Revenue\r\n`;
    for (const day of report.ordersByDay) {
      csv += `${day.date},${day.count},${day.revenue.toFixed(2)}\r\n`;
    }

    const filename = `report_${report.period.replace(' ', '_')}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Manually trigger report generation (for testing)
// @route   POST /api/reports/generate
exports.generateReport = async (req, res) => {
  try {
    const { year, month } = req.body;

    if (!year || !month || month < 1 || month > 12) {
      return res.status(400).json({ message: 'Valid year and month (1-12) are required' });
    }

    const count = await generateMonthlyReports(year, month);
    res.json({ message: `Generated ${count} report(s) for ${month}/${year}` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
