import cron from 'node-cron';
import { runExpiryReminders } from '../services/notifications.js';

// Runs every day at 09:00 (server time). Sends expiry reminder emails for
// coins expiring in 3 days, 2 days, or today.
const SCHEDULE = process.env.REMINDER_CRON || '0 9 * * *';

export function scheduleExpiryReminders() {
  if (!cron.validate(SCHEDULE)) {
    console.error(`Invalid REMINDER_CRON expression: ${SCHEDULE} — expiry reminders disabled`);
    return;
  }

  cron.schedule(SCHEDULE, async () => {
    try {
      const summary = await runExpiryReminders();
      if (summary.sent > 0) {
        console.log(`Expiry reminders sent: ${summary.sent}`, summary.byOffset);
      }
    } catch (err) {
      console.error('Expiry reminder job failed:', err.message);
    }
  });

  console.log(`Expiry reminder job scheduled (${SCHEDULE})`);

  // Optional: run once at startup for testing (set RUN_REMINDERS_ON_START=true).
  if (process.env.RUN_REMINDERS_ON_START === 'true') {
    runExpiryReminders()
      .then((s) => console.log('Startup expiry reminder run:', s))
      .catch((e) => console.error('Startup expiry reminder run failed:', e.message));
  }
}
