import {
  HEARTFELT_HOOK,
  HEARTFELT_LINE,
  formatRupee,
  stayExperienceTip,
} from '../utils/stayPricingDisplay';

/**
 * Heartfelt Pricing block for cards / heroes.
 * @param {{ stay: object, compact?: boolean, className?: string }} props
 */
export default function HeartfeltPrice({ stay, compact = false, className = '' }) {
  const tip = stayExperienceTip(stay);
  const base = Number(stay?.price) || 0;

  if (!tip) {
    return (
      <p className={`hf-price ${className}`.trim()}>
        <strong>{formatRupee(base)}</strong>
        <span className="hf-price-unit">/ night</span>
      </p>
    );
  }

  return (
    <div className={`hf-price hf-price--split ${compact ? 'hf-price--compact' : ''} ${className}`.trim()}>
      {!compact && <span className="hf-price-hook">{HEARTFELT_HOOK}</span>}
      <p className="hf-price-row">
        <strong>{formatRupee(base)}</strong>
        <span className="hf-price-plus" aria-hidden="true">+</span>
        <em className="hf-price-tip">{formatRupee(tip)}</em>
        <span className="hf-price-unit">/ night</span>
      </p>
      <p className="hf-price-note">
        {compact ? (
          <>
            <span className="hf-price-note-base">base</span>
            <span aria-hidden="true"> · </span>
            <span className="hf-price-note-tip">Heart Price</span>
          </>
        ) : (
          HEARTFELT_LINE
        )}
      </p>
    </div>
  );
}
