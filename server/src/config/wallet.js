export const WELCOME_BONUS = 500;
export const BOOKING_REWARD = 500;

// Ezy coins expire this many days after they are earned.
export const COIN_EXPIRY_DAYS = 30;

export function coinExpiryFrom(from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() + COIN_EXPIRY_DAYS);
  return d;
}
