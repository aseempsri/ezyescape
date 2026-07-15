/** Shared WhatsApp chat link for Ezy Escape trip curators. */
export const WHATSAPP_NUMBER = '918938899400';

export const WHATSAPP_DEFAULT_MESSAGE =
  "Hi! I'm interested in a curated mountain stay with Ezy Escape. Could you help me find something that matches how I like to travel?";

export function whatsappChatUrl(message = WHATSAPP_DEFAULT_MESSAGE) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
