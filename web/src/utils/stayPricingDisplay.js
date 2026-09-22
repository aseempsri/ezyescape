/** Heartfelt Pricing — base stay fare + optional experience tip. */

export const HEARTFELT_HOOK = 'Heartfelt Pricing';
export const HEARTFELT_LINE = 'Book the home. Thank the experience.';
export const HEARTFELT_BLURB =
  'You book at the base fare. After you stay, add the Heart Price only if it felt special — a thank-you for a great experience, never a must.';

export function formatRupee(n) {
  const v = Math.round(Number(n) || 0);
  return `₹${v.toLocaleString('en-IN')}`;
}

export function stayBasePrice(stay) {
  return Math.max(0, Number(stay?.price) || 0);
}

export function stayExperienceTip(stay) {
  return Math.max(0, Number(stay?.experienceTip) || 0);
}

/** Compact card line: ₹1,499 + ₹999 */
export function stayPriceCombo(stay) {
  const base = stayBasePrice(stay);
  const tip = stayExperienceTip(stay);
  if (!tip) return formatRupee(base);
  return `${formatRupee(base)} + ${formatRupee(tip)}`;
}
