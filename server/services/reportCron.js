const cron = require('node-cron');
const { generateMonthlyReports, cleanupExpiredReports } = require('./reportService');

function startReportCron() {
  // Generate monthly reports at 00:05 on the 1st of every month
  // This generates the report for the *previous* month.
  cron.schedule('5 0 1 * *', async () => {
    console.log('[Cron] Running monthly report generation...');
    try {
      const now = new Date();
      // Previous month
      let month = now.getMonth(); // 0-indexed, so getMonth() on Jan 1 = 0, which means Dec
      let year = now.getFullYear();
      if (month === 0) {
        month = 12;
        year -= 1;
      }
      await generateMonthlyReports(year, month);
    } catch (err) {
      console.error('[Cron] Error generating monthly reports:', err);
    }
  });

  // Cleanup expired reports and their orders daily at 01:00
  cron.schedule('0 1 * * *', async () => {
    console.log('[Cron] Running expired report cleanup...');
    try {
      await cleanupExpiredReports();
    } catch (err) {
      console.error('[Cron] Error cleaning up expired reports:', err);
    }
  });

  console.log('[Cron] Report cron jobs scheduled (generate: 1st of month 00:05, cleanup: daily 01:00)');
}

module.exports = { startReportCron };
