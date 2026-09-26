const Report = require('../models/Report');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');

const GRACE_PERIOD_DAYS = 5;

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Generate monthly reports for all restaurants for a given month/year.
 * Typically called on the 1st of the month for the previous month.
 */
async function generateMonthlyReports(year, month) {
  console.log(`[ReportService] Generating reports for ${MONTH_NAMES[month]} ${year}...`);

  const startDate = new Date(year, month - 1, 1);  // month is 0-indexed in Date
  const endDate = new Date(year, month, 1);         // first day of next month
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + GRACE_PERIOD_DAYS);

  const restaurants = await Restaurant.find({ active: true });

  let generated = 0;
  for (const restaurant of restaurants) {
    // Skip if report already exists for this period
    const existing = await Report.findOne({
      restaurantId: restaurant._id,
      year,
      month,
    });
    if (existing) {
      console.log(`[ReportService] Report already exists for ${restaurant.name} - ${MONTH_NAMES[month]} ${year}, skipping.`);
      continue;
    }

    // Fetch all orders for this restaurant in the given month
    const orders = await Order.find({
      restaurantId: restaurant._id,
      createdAt: { $gte: startDate, $lt: endDate },
    });

    if (orders.length === 0) {
      console.log(`[ReportService] No orders for ${restaurant.name} in ${MONTH_NAMES[month]} ${year}, skipping.`);
      continue;
    }

    // Calculate metrics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    // Most sold items: aggregate across all orders
    const itemMap = {};
    for (const order of orders) {
      for (const item of order.items) {
        const key = item.name || 'Unknown Item';
        if (!itemMap[key]) {
          itemMap[key] = { name: key, quantity: 0, revenue: 0 };
        }
        itemMap[key].quantity += item.quantity || 1;
        itemMap[key].revenue += (item.price || 0) * (item.quantity || 1);
      }
    }
    const mostSoldItems = Object.values(itemMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 20); // top 20

    // Orders by day
    const dayMap = {};
    for (const order of orders) {
      const dateStr = order.createdAt.toISOString().split('T')[0]; // "YYYY-MM-DD"
      if (!dayMap[dateStr]) {
        dayMap[dateStr] = { date: dateStr, count: 0, revenue: 0 };
      }
      dayMap[dateStr].count += 1;
      dayMap[dateStr].revenue += order.total || 0;
    }
    const ordersByDay = Object.values(dayMap).sort((a, b) => a.date.localeCompare(b.date));

    await Report.create({
      restaurantId: restaurant._id,
      month,
      year,
      period: `${MONTH_NAMES[month]} ${year}`,
      totalOrders,
      totalRevenue,
      mostSoldItems,
      ordersByDay,
      expiresAt,
    });

    generated++;
    console.log(`[ReportService] Report generated for ${restaurant.name} - ${MONTH_NAMES[month]} ${year}`);
  }

  console.log(`[ReportService] Done. Generated ${generated} report(s).`);
  return generated;
}

/**
 * Delete expired reports and their associated detailed orders.
 */
async function cleanupExpiredReports() {
  const now = new Date();

  const expiredReports = await Report.find({ expiresAt: { $lte: now } });

  if (expiredReports.length === 0) {
    console.log('[ReportService] No expired reports to clean up.');
    return 0;
  }

  let cleaned = 0;
  for (const report of expiredReports) {
    const startDate = new Date(report.year, report.month - 1, 1);
    const endDate = new Date(report.year, report.month, 1);

    // Delete detailed orders for this restaurant and month
    const deleteResult = await Order.deleteMany({
      restaurantId: report.restaurantId,
      createdAt: { $gte: startDate, $lt: endDate },
    });

    console.log(`[ReportService] Deleted ${deleteResult.deletedCount} orders for report ${report.period} (restaurant ${report.restaurantId})`);

    // Delete the report itself
    await Report.findByIdAndDelete(report._id);
    cleaned++;
  }

  console.log(`[ReportService] Cleanup complete. Removed ${cleaned} expired report(s) and their orders.`);
  return cleaned;
}

module.exports = {
  generateMonthlyReports,
  cleanupExpiredReports,
};
