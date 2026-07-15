import CoinLot from '../models/CoinLot.js';
import User from '../models/User.js';
import { sendMail } from '../config/mailer.js';

const REMINDER_OFFSETS = [
  { days: 3, field: 'threeDay', when: 'in 3 days' },
  { days: 2, field: 'twoDay', when: 'in 2 days' },
  { days: 0, field: 'dayOf', when: 'today' },
];

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function buildEmail({ name, coins, expiresAt, when }) {
  const greeting = name ? `Hi ${name.split(' ')[0]},` : 'Hi there,';
  const expiryDate = formatDate(expiresAt);
  const headline =
    when === 'today'
      ? `${coins} ezy coins expire today`
      : `${coins} ezy coins expire ${when}`;

  const text = [
    greeting,
    '',
    `${headline} (on ${expiryDate}).`,
    '1 ezy coin = ₹1. Redeem them on your next booking before they expire.',
    '',
    'Book a stay: ' + (process.env.FRONTEND_URL || 'https://aseempsri.github.io/ezyescape/'),
    '',
    '— Ezy Escape',
  ].join('\n');

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#12131a;">
    <div style="background:#0a1420;border-radius:16px 16px 0 0;padding:28px 24px;text-align:center;">
      <div style="font-size:34px;font-weight:800;color:#FFD166;line-height:1;">◎ ${coins}</div>
      <div style="color:#EDE8E1;font-size:14px;margin-top:6px;letter-spacing:.02em;">ezy coins</div>
    </div>
    <div style="background:#f7f3ed;border-radius:0 0 16px 16px;padding:26px 24px;">
      <p style="margin:0 0 14px;font-size:15px;">${greeting}</p>
      <p style="margin:0 0 14px;font-size:16px;font-weight:700;">${headline}.</p>
      <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#3a4655;">
        Your coins will expire on <strong>${expiryDate}</strong>. 1 ezy coin = ₹1 —
        redeem them on your next booking before they're gone.
      </p>
      <a href="${process.env.FRONTEND_URL || 'https://aseempsri.github.io/ezyescape/'}"
         style="display:inline-block;margin-top:8px;background:#F5A623;color:#0a1420;font-weight:700;
                text-decoration:none;padding:12px 22px;border-radius:999px;font-size:14px;">
        Book a stay →
      </a>
      <p style="margin:22px 0 0;font-size:12px;color:#8a97a6;">— Ezy Escape · Curated mountain homestays</p>
    </div>
  </div>`;

  return { subject: headline, text, html };
}

// Scan coin lots and send expiry reminders for lots expiring in 3 days,
// 2 days, or today. Aggregates multiple lots per user (per offset) into one
// email and marks each lot so reminders are never sent twice.
export async function runExpiryReminders(now = new Date()) {
  const today = startOfDay(now);
  const summary = { sent: 0, byOffset: {} };

  for (const offset of REMINDER_OFFSETS) {
    const targetStart = addDays(today, offset.days);
    const targetEnd = addDays(targetStart, 1);
    const flagPath = `remindersSent.${offset.field}`;

    const lots = await CoinLot.find({
      expired: false,
      remaining: { $gt: 0 },
      expiresAt: { $gte: targetStart, $lt: targetEnd },
      [flagPath]: { $ne: true },
    });

    // Group lots by user, summing the coins expiring on this day.
    const byUser = new Map();
    for (const lot of lots) {
      const key = lot.userId.toString();
      if (!byUser.has(key)) byUser.set(key, { coins: 0, lotIds: [], expiresAt: lot.expiresAt });
      const entry = byUser.get(key);
      entry.coins += lot.remaining;
      entry.lotIds.push(lot._id);
    }

    let sentForOffset = 0;
    for (const [userId, entry] of byUser) {
      const user = await User.findById(userId).select('email name');
      if (!user?.email) continue;

      try {
        const { subject, text, html } = buildEmail({
          name: user.name,
          coins: entry.coins,
          expiresAt: entry.expiresAt,
          when: offset.when,
        });
        await sendMail({ to: user.email, subject, text, html });

        await CoinLot.updateMany(
          { _id: { $in: entry.lotIds } },
          { $set: { [flagPath]: true } }
        );
        sentForOffset += 1;
        summary.sent += 1;
      } catch (err) {
        console.error(`Failed to send expiry reminder to ${user.email}:`, err.message);
      }
    }

    summary.byOffset[offset.field] = sentForOffset;
  }

  return summary;
}
