/** Heartfelt Pricing — original · booking · heartfelt tip. */

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

/** List / MRP price shown struck-through (disPrice, or booking + heartfelt). */
export function stayOriginalPrice(stay) {
  const base = stayBasePrice(stay);
  const tip = stayExperienceTip(stay);
  const listed = Math.max(
    0,
    Number(stay?.disPrice ?? stay?.originalPrice ?? stay?.mrp) || 0,
  );
  if (listed > base) return listed;
  if (tip > 0) return base + tip;
  return 0;
}

/** Compact card line: ₹2,498 · ₹1,499 + ₹999 */
export function stayPriceCombo(stay) {
  const base = stayBasePrice(stay);
  const tip = stayExperienceTip(stay);
  const original = stayOriginalPrice(stay);
  if (!tip) {
    if (original > base) return `${formatRupee(original)} → ${formatRupee(base)}`;
    return formatRupee(base);
  }
  if (original > base) {
    return `${formatRupee(original)} · ${formatRupee(base)} + ${formatRupee(tip)}`;
  }
  return `${formatRupee(base)} + ${formatRupee(tip)}`;
}
