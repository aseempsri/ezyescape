import { mailChannelReady, sendMail } from '../config/mailer.js';

function formatDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function inr(n) {
  return `₹${Math.round(Number(n) || 0).toLocaleString('en-IN')}`;
}

function esc(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}

function line(label, value) {
  if (!value) return '';
  return `${label}: ${value}`;
}

/**
 * Guest booking confirmation, sent from the bookings mailbox.
 * Failures are logged and never thrown — the booking itself already succeeded.
 */
export async function sendBookingConfirmation({ user, stay, booking }) {
  const to = String(user?.email || '').trim();
  if (!to) return;

  const name = user.name || 'there';
  const title = booking.stayTitle || stay?.title || 'your stay';
  const checkIn = formatDate(booking.checkIn);
  const checkOut = formatDate(booking.checkOut);
  const guests = [
    booking.adults ? `${booking.adults} adult${booking.adults === 1 ? '' : 's'}` : '',
    booking.children ? `${booking.children} child${booking.children === 1 ? '' : 'ren'}` : '',
  ].filter(Boolean).join(', ');
  const mode = booking.bookingMode === 'room'
    ? `${booking.rooms} room${booking.rooms === 1 ? '' : 's'}`
    : 'Entire property';
  const tip = Number(stay?.experienceTip) || 0;
  const location = stay?.location || '';
  const directions = stay?.directions || '';
  const ref = String(booking._id || '').slice(-6).toUpperCase();

  const subject = `Booking confirmed — ${title}`;
  const text = [
    `Hi ${name},`,
    '',
    `Your stay at ${title} is confirmed.`,
    '',
    line('Reference', ref),
    line('Check-in', checkIn),
    line('Check-out', checkOut),
    line('Nights', String(booking.nights || '')),
    line('Stay', mode),
    line('Guests', guests),
    booking.extraMattress ? 'Extra mattress: yes' : '',
    line('Place', location),
    line('Amount payable', inr(booking.amountPayable)),
    tip ? `Heart Price (optional, after your stay): ${inr(tip)} / night if the experience felt special.` : '',
    '',
    directions ? `How to reach\n${directions}` : '',
    '',
    'A few notes',
    '- This confirmation covers the base fare only.',
    '- Please share your arrival time on WhatsApp so the hosts can meet you.',
    '- Quiet hours, home-cooked meals, and house rules are shared by your hosts on arrival.',
    '',
    'Reply to this email if you need to change dates or ask about the stay.',
    '',
    'Ezy Escape',
  ].filter((row) => row !== '').join('\n');

  const html = `
    <div style="font-family:Georgia,serif;color:#1c2a3a;max-width:560px;margin:0 auto;padding:24px">
      <p style="letter-spacing:.14em;text-transform:uppercase;font-size:12px;color:#c47d0a;margin:0 0 12px">Ezy Escape</p>
      <h1 style="font-weight:500;font-size:28px;margin:0 0 8px">Your stay is confirmed</h1>
      <p style="margin:0 0 18px;line-height:1.5">Hi ${esc(name)}, ${esc(title)} is held for you.</p>
      <table style="width:100%;border-collapse:collapse;font-size:15px;line-height:1.45">
        <tr><td style="padding:6px 0;color:#5c6b7a">Reference</td><td style="padding:6px 0"><strong>${ref}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#5c6b7a">Check-in</td><td style="padding:6px 0">${checkIn}</td></tr>
        <tr><td style="padding:6px 0;color:#5c6b7a">Check-out</td><td style="padding:6px 0">${checkOut}</td></tr>
        <tr><td style="padding:6px 0;color:#5c6b7a">Stay</td><td style="padding:6px 0">${esc(mode)}${guests ? ` · ${esc(guests)}` : ''}</td></tr>
        <tr><td style="padding:6px 0;color:#5c6b7a">Place</td><td style="padding:6px 0">${esc(location || 'Kumaon')}</td></tr>
        <tr><td style="padding:6px 0;color:#5c6b7a">Amount payable</td><td style="padding:6px 0"><strong>${inr(booking.amountPayable)}</strong></td></tr>
      </table>
      ${tip ? `<p style="margin:16px 0 0;line-height:1.5">The Heart Price of <strong>${inr(tip)}</strong> / night is optional. Add it after your stay only if the experience felt special.</p>` : ''}
      ${directions ? `<h2 style="font-size:18px;font-weight:500;margin:22px 0 8px">How to reach</h2><p style="margin:0;line-height:1.55">${esc(directions)}</p>` : ''}
      <h2 style="font-size:18px;font-weight:500;margin:22px 0 8px">Before you arrive</h2>
      <ul style="margin:0;padding-left:18px;line-height:1.55">
        <li>This note confirms the base fare only.</li>
        <li>Share your arrival time on WhatsApp so the hosts can meet you.</li>
        <li>House notes, meals, and quiet hours are shared by your hosts on arrival.</li>
      </ul>
      <p style="margin:22px 0 0;line-height:1.5">Reply to this email if you need to change dates or ask about the stay.</p>
    </div>
  `;

  const bookingsInbox = process.env.SMTP_BOOKINGS_USER || 'bookings@ezyescape.com';
  await sendMail({
    to,
    bcc: bookingsInbox,
    subject,
    text,
    html,
    channel: 'bookings',
  });

  if (!mailChannelReady('bookings')) {
    console.log(`[booking-mail] confirmation for ${to} was not sent — set SMTP_BOOKINGS_PASS`);
  }
}

function stayFacts(stay, booking) {
  const name = 'there';
  const title = booking.stayTitle || stay?.title || 'your stay';
  const checkIn = formatDate(booking.checkIn);
  const checkOut = formatDate(booking.checkOut);
  const guests = [
    booking.adults ? `${booking.adults} adult${booking.adults === 1 ? '' : 's'}` : '',
    booking.children ? `${booking.children} child${booking.children === 1 ? '' : 'ren'}` : '',
  ].filter(Boolean).join(', ');
  const mode = booking.bookingMode === 'room'
    ? `${booking.rooms} room${booking.rooms === 1 ? '' : 's'}`
    : 'Entire property';
  const ref = String(booking._id || '').slice(-6).toUpperCase();
  return {
    name,
    title,
    checkIn,
    checkOut,
    guests,
    mode,
    ref,
    location: stay?.location || 'Kumaon',
    payable: inr(booking.amountPayable),
  };
}

async function deliver({ to, subject, text, html }) {
  const bookingsInbox = process.env.SMTP_BOOKINGS_USER || 'bookings@ezyescape.com';
  await sendMail({
    to,
    bcc: to.toLowerCase() === bookingsInbox.toLowerCase() ? undefined : bookingsInbox,
    subject,
    text,
    html,
    channel: 'bookings',
  });
  if (!mailChannelReady('bookings')) {
    console.log(`[booking-mail] logged only — ${subject} → ${to}`);
  }
}

function shell(title, bodyHtml, closing = 'Reply to this email if you need to change anything.') {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f7f3ed;">
  <div style="font-family:Georgia,serif;color:#1c2a3a;max-width:560px;margin:0 auto;padding:24px">
    <p style="letter-spacing:.14em;text-transform:uppercase;font-size:12px;color:#c47d0a;margin:0 0 12px">Ezy Escape</p>
    <h1 style="font-weight:500;font-size:26px;margin:0 0 12px">${esc(title)}</h1>
    ${bodyHtml}
    <p style="margin:22px 0 0;line-height:1.5;color:#5c6b7a">${esc(closing)}</p>
  </div>
</body>
</html>`;
}

function emailButton(href, label) {
  const url = String(href || '');
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0">
      <tr>
        <td align="center" bgcolor="#c47d0a" style="border-radius:999px;background-color:#c47d0a;">
          <a href="${url}" target="_blank" style="display:inline-block;padding:14px 22px;font-family:Arial,sans-serif;font-size:15px;line-height:1;color:#ffffff;text-decoration:none;background-color:#c47d0a;border-radius:999px;">${esc(label)}</a>
        </td>
      </tr>
    </table>
  `;
}

export function postcardReviewUrl() {
  const site = String(process.env.SITE_URL || 'https://ezyescape.com').replace(/\/+$/, '');
  return `${site}/postcards?write=1`;
}

export async function sendStayThankYou({ user, stay, booking, to }) {
  const recipient = String(to || user?.email || '').trim();
  if (!recipient) return { sent: false, reason: 'no-email' };
  const f = stayFacts(stay, booking);
  const who = user?.name || 'there';
  const reviewUrl = postcardReviewUrl();
  const subject = `Thank you for staying at ${f.title}`;
  const text = [
    `Hi ${who},`,
    '',
    `Thank you for staying at ${f.title}${f.location ? ` in ${f.location}` : ''}.`,
    `We hope ${f.checkIn} to ${f.checkOut} felt like time well spent.`,
    '',
    'If the home stayed with you, leave a short postcard on our site — a photo and a few lines for the next traveller. We stamp it onto the postcard wall after a quick look.',
    '',
    `Write your postcard: ${reviewUrl}`,
    '',
    `Reference ${f.ref}`,
    'With thanks from the hills,',
    'Ezy Escape',
  ].join('\n');
  const html = shell('Thank you for staying', `
    <p style="line-height:1.55">Hi ${esc(who)},</p>
    <p style="line-height:1.55">Thank you for staying at <strong>${esc(f.title)}</strong>${f.location ? ` in ${esc(f.location)}` : ''}. We hope ${esc(f.checkIn)} to ${esc(f.checkOut)} felt like time well spent.</p>
    <p style="line-height:1.55">If the home stayed with you, leave a short postcard on our site — a photo and a few lines for the next traveller. We stamp it onto the postcard wall after a quick look.</p>
    ${emailButton(reviewUrl, 'Write your postcard')}
    <p style="line-height:1.5;color:#5c6b7a">Reference ${f.ref}</p>
  `, 'With thanks from the hills.');
  await deliver({ to: recipient, subject, text, html });
  return { sent: true };
}

export async function sendBookingRequest({ user, stay, booking }) {
  const to = String(user?.email || '').trim();
  if (!to) return;
  const f = stayFacts(stay, booking);
  const who = user.name || 'there';
  const subject = `Booking request received — ${f.title}`;
  const text = `Hi ${who},\n\nWe received your request for ${f.title} (${f.checkIn} to ${f.checkOut}). Reference ${f.ref}. The host will confirm it shortly.\n\nAmount payable: ${f.payable}\n`;
  const html = shell('We received your request', `
    <p style="line-height:1.5">Hi ${esc(who)}, ${esc(f.title)} is requested for ${esc(f.checkIn)} to ${esc(f.checkOut)}. Reference <strong>${f.ref}</strong>. The host will confirm by email.</p>
    <p style="line-height:1.5">Amount payable: <strong>${f.payable}</strong></p>
  `);
  await deliver({ to, subject, text, html });
}

export async function sendBookingStatusMail({ user, stay, booking, status, note }) {
  const to = String(user?.email || '').trim();
  if (!to) return;
  const f = stayFacts(stay, booking);
  const who = user.name || 'there';
  const copy = {
    confirmed: {
      subject: `Booking confirmed — ${f.title}`,
      lead: `${f.title} is confirmed for ${f.checkIn} to ${f.checkOut}.`,
    },
    rejected: {
      subject: `Booking update — ${f.title}`,
      lead: `We could not confirm ${f.title} for those dates.`,
    },
    cancelled: {
      subject: `Booking cancelled — ${f.title}`,
      lead: `Your stay at ${f.title} (${f.checkIn} to ${f.checkOut}) has been cancelled.`,
    },
  }[status];
  if (!copy) return;
  const text = `Hi ${who},\n\n${copy.lead}\nReference ${f.ref}.\n${note ? `\nNote: ${note}\n` : ''}`;
  const html = shell(copy.subject.replace(/ — .*/, ''), `
    <p style="line-height:1.5">Hi ${esc(who)}, ${esc(copy.lead)} Reference <strong>${f.ref}</strong>.</p>
    <p style="line-height:1.5">${esc(f.mode)}${f.guests ? ` · ${esc(f.guests)}` : ''} · ${esc(f.location)}</p>
    <p style="line-height:1.5">Amount payable: <strong>${f.payable}</strong></p>
    ${note ? `<p style="line-height:1.5">Note: ${esc(note)}</p>` : ''}
  `);
  await deliver({ to, subject: copy.subject, text, html });
}

export async function sendBookingReminder({ user, stay, booking, whenLabel }) {
  const to = String(user?.email || '').trim();
  if (!to) throw new Error('This guest has no email address.');
  const f = stayFacts(stay, booking);
  const who = user.name || 'there';
  const subject = `Reminder: ${f.title} is ${whenLabel}`;
  const text = `Hi ${who},\n\nYour stay at ${f.title} is ${whenLabel}. Check-in ${f.checkIn}, check-out ${f.checkOut}. Reference ${f.ref}.\n`;
  const html = shell('Your stay is coming up', `
    <p style="line-height:1.5">Hi ${esc(who)}, ${esc(f.title)} is <strong>${esc(whenLabel)}</strong>.</p>
    <p style="line-height:1.5">Check-in ${esc(f.checkIn)} · Check-out ${esc(f.checkOut)} · Reference <strong>${f.ref}</strong></p>
    <p style="line-height:1.5">${esc(f.mode)}${f.guests ? ` · ${esc(f.guests)}` : ''}</p>
  `);
  await deliver({ to, subject, text, html });
}

export async function sendBookingAdminMessage({ user, booking, subject, message }) {
  const to = String(user?.email || '').trim();
  if (!to) throw new Error('This guest has no email address.');
  const who = user.name || 'there';
  const ref = String(booking._id || '').slice(-6).toUpperCase();
  const text = `Hi ${who},\n\n${message}\n\n— Ezy Escape bookings\nReference ${ref}`;
  const html = shell(subject, `
    <p style="line-height:1.5">Hi ${esc(who)},</p>
    <p style="line-height:1.55;white-space:pre-wrap">${esc(message)}</p>
    <p style="line-height:1.5;color:#5c6b7a">Booking reference ${ref}</p>
  `);
  await deliver({ to, subject, text, html });
}
