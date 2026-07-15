// WhatsApp OTP delivery via the Meta (WhatsApp Cloud) API.
//
// In dev, if credentials are not set, the code is logged to the console instead
// of sent — so the whole flow works for free without any setup. In production,
// set WHATSAPP_TOKEN / WHATSAPP_PHONE_ID / WHATSAPP_TEMPLATE and it sends for real.

const DEFAULT_CC = process.env.WHATSAPP_DEFAULT_CC || '91';

// Normalize a phone number to E.164 (e.g. "9876543210" -> "+919876543210").
// Numbers longer than 10 digits are assumed to already include a country code.
export function toE164(mobile, cc = DEFAULT_CC) {
  const digits = String(mobile || '').replace(/\D/g, '');
  if (!digits) return '';
  const full = digits.length > 10 ? digits : `${cc}${digits}`;
  return `+${full}`;
}

function isConfigured() {
  return Boolean(
    process.env.WHATSAPP_TOKEN &&
      process.env.WHATSAPP_PHONE_ID &&
      process.env.WHATSAPP_TEMPLATE
  );
}

export async function sendWhatsappOtp(toNumber, code) {
  // Meta expects the recipient as digits only (no leading "+").
  const to = String(toNumber || '').replace(/\D/g, '');

  if (!isConfigured()) {
    console.warn(
      'WhatsApp not configured — OTP codes will be logged, not sent. Set WHATSAPP_TOKEN/WHATSAPP_PHONE_ID/WHATSAPP_TEMPLATE in server/.env'
    );
    console.log(`[whatsapp:fallback] To: +${to} | Ezy Escape verification code: ${code}`);
    return { fallback: true };
  }

  const version = process.env.WHATSAPP_API_VERSION || 'v21.0';
  const url = `https://graph.facebook.com/${version}/${process.env.WHATSAPP_PHONE_ID}/messages`;
  const lang = process.env.WHATSAPP_TEMPLATE_LANG || 'en_US';

  // Authentication templates take the code as the body param and (when the
  // template has a copy-code / URL button) the same code as the button param.
  const components = [
    { type: 'body', parameters: [{ type: 'text', text: String(code) }] },
  ];
  if (process.env.WHATSAPP_TEMPLATE_NO_BUTTON !== 'true') {
    components.push({
      type: 'button',
      sub_type: 'url',
      index: '0',
      parameters: [{ type: 'text', text: String(code) }],
    });
  }

  const body = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: process.env.WHATSAPP_TEMPLATE,
      language: { code: lang },
      components,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || `WhatsApp send failed (${res.status})`);
  }
  return data;
}
