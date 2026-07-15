/** Shared WhatsApp chat link for Ezy Escape trip curators. */
// Local 10-digit number; wa.me requires country code + number (no + or spaces).
export const WHATSAPP_COUNTRY_CODE = '91';
export const WHATSAPP_LOCAL_NUMBER = '8938899400';
export const WHATSAPP_NUMBER = `${WHATSAPP_COUNTRY_CODE}${WHATSAPP_LOCAL_NUMBER}`;

export const WHATSAPP_DEFAULT_MESSAGE =
  "Hi! I'm interested in a curated mountain stay with Ezy Escape. Could you help me find something that matches how I like to travel?";

export function whatsappChatUrl(message = WHATSAPP_DEFAULT_MESSAGE) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
