import nodemailer from 'nodemailer';

const transporters = new Map();
const warned = new Set();

function sharedHost() {
  return {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
  };
}

/** info = login codes and notices. bookings = guest booking mail. */
function channelConfig(channel) {
  const { host, port } = sharedHost();
  if (channel === 'bookings') {
    const user = process.env.SMTP_BOOKINGS_USER || 'bookings@ezyescape.com';
    return {
      host,
      port,
      user,
      pass: process.env.SMTP_BOOKINGS_PASS || '',
      from: process.env.MAIL_BOOKINGS_FROM || `Ezy Escape <${user}>`,
    };
  }
  const user = process.env.SMTP_USER || process.env.SMTP_INFO_USER || 'info@ezyescape.com';
  return {
    host,
    port,
    user,
    pass: process.env.SMTP_PASS || process.env.SMTP_INFO_PASS || '',
    from: process.env.MAIL_FROM || `Ezy Escape <${user}>`,
  };
}

export function mailChannelReady(channel = 'info') {
  const cfg = channelConfig(channel);
  return Boolean(cfg.host && cfg.user && cfg.pass);
}

function getTransporter(channel) {
  if (transporters.has(channel)) return transporters.get(channel);

  const cfg = channelConfig(channel);
  let tx;
  if (mailChannelReady(channel)) {
    tx = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.port === 465,
      auth: { user: cfg.user, pass: cfg.pass },
    });
  } else {
    tx = nodemailer.createTransport({ jsonTransport: true });
    if (!warned.has(channel)) {
      warned.add(channel);
      const missing = channel === 'bookings' ? 'SMTP_BOOKINGS_PASS' : 'SMTP_USER/SMTP_PASS';
      console.warn(
        `SMTP ${channel} mailbox is not configured — those emails will be logged, not sent. Set ${missing} in server/.env`
      );
    }
  }

  transporters.set(channel, { tx, from: cfg.from, live: mailChannelReady(channel) });
  return transporters.get(channel);
}

/**
 * @param {{ to: string, subject: string, html?: string, text?: string, channel?: 'info' | 'bookings', bcc?: string }} opts
 */
function headerValue(value, max = 200) {
  return String(value || '').replace(/[\r\n]/g, ' ').trim().slice(0, max);
}

export async function sendMail({ to, subject, html, text, channel = 'info', bcc }) {
  const { tx, from, live } = getTransporter(channel);
  const recipient = headerValue(to, 200);
  if (!recipient || /[\s,;]/.test(recipient)) {
    throw new Error('Invalid recipient');
  }
  const info = await tx.sendMail({
    from,
    to: recipient,
    bcc: bcc ? headerValue(bcc, 200) : undefined,
    replyTo: from,
    subject: headerValue(subject, 180),
    html,
    text,
  });

  if (!live) {
    console.log(`[email:${channel}:fallback] To: ${to} | Subject: ${subject}`);
  }

  return info;
}
