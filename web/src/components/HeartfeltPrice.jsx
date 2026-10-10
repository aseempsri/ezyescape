import {
  formatRupee,
  stayBasePrice,
  stayExperienceTip,
  stayOriginalPrice,
} from '../utils/stayPricingDisplay';

/**
 * Heartfelt Pricing block for cards / property pages.
 * Shows Original (struck) · Booking + Heartfelt when a tip exists.
 * @param {{ stay: object, compact?: boolean, className?: string }} props
 */
export default function HeartfeltPrice({ stay, compact = false, className = '' }) {
  const tip = stayExperienceTip(stay);
  const base = stayBasePrice(stay);
  const original = stayOriginalPrice(stay);
  const showOriginal = original > base;

  if (!tip) {
    return (
      <p className={`hf-price ${className}`.trim()}>
        {showOriginal && (
          <s className="hf-price-mrp">{formatRupee(original)}</s>
        )}
        <strong>{formatRupee(base)}</strong>
        <span className="hf-price-unit">/ night</span>
      </p>
    );
  }

  return (
    <div className={`hf-price hf-price--split ${compact ? 'hf-price--compact' : ''} ${className}`.trim()}>
      <p className="hf-price-row">
        {showOriginal && (
          <s className="hf-price-mrp">{formatRupee(original)}</s>
        )}
        <strong className="hf-price-booking">{formatRupee(base)}</strong>
        <span className="hf-price-plus" aria-hidden="true">+</span>
        <em className="hf-price-tip">{formatRupee(tip)}</em>
        <span className="hf-price-unit">/ night</span>
      </p>
      <p className="hf-price-note">
        {showOriginal ? (
          <span className="hf-price-note-mrp">Original</span>
        ) : null}
        {showOriginal ? <span aria-hidden="true"> · </span> : null}
        <span className="hf-price-note-base">Booking</span>
        <span aria-hidden="true"> · </span>
        <span className="hf-price-note-tip">Heartfelt</span>
      </p>
    </div>
  );
}
