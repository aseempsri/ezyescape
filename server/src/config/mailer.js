import nodemailer from 'nodemailer';

let transporter;
let usingFallback = false;

export function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    const port = Number(SMTP_PORT) || 587;
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  } else {
    // No SMTP configured — log emails instead of sending so local dev never breaks.
    transporter = nodemailer.createTransport({ jsonTransport: true });
    usingFallback = true;
    console.warn(
      'SMTP not configured — expiry reminder emails will be logged, not sent. Set SMTP_HOST/SMTP_USER/SMTP_PASS in server/.env'
    );
  }

  return transporter;
}

export async function sendMail({ to, subject, html, text }) {
  const from = process.env.MAIL_FROM || 'Ezy Escape <no-reply@ezyescape.local>';
  const tx = getTransporter();
  const info = await tx.sendMail({ from, to, subject, html, text });

  if (usingFallback) {
    console.log(`[email:fallback] To: ${to} | Subject: ${subject}`);
  }

  return info;
}
