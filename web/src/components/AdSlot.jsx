import { useAds } from '../hooks/useAds';
import '../styles/ads.css';

function withProtocol(url) {
  const raw = String(url || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw) || raw.startsWith('/')) return raw;
  return `https://${raw}`;
}

/**
 * Fixed-frame ad slot. Shows when enabled (empty slots still render the Advertisement frame).
 * @param {{ adId: string, className?: string }} props
 */
export default function AdSlot({ adId, className = '' }) {
  const { getCreative } = useAds();
  const creative = getCreative(adId);

  if (!creative) return null;

  const orientation = creative.orientation === 'vertical' ? 'vertical' : 'horizontal';
  const href = withProtocol(creative.linkUrl);
  const empty = creative.empty || !creative.mediaUrl;

  const media = empty ? (
    <div className="ezy-ad-placeholder" aria-hidden="true">
      <span>Advertisement</span>
    </div>
  ) : creative.mediaType === 'video' ? (
    <video
      className="ezy-ad-media"
      src={creative.mediaUrl}
      muted
      autoPlay
      loop
      playsInline
      aria-label={creative.altText}
    />
  ) : (
    <img className="ezy-ad-media" src={creative.mediaUrl} alt={creative.altText} loading="lazy" />
  );

  return (
    <aside
      className={`ezy-ad ezy-ad--${orientation}${empty ? ' ezy-ad--empty' : ''} ${className}`.trim()}
      data-ad-id={adId}
    >
      <p className="ezy-ad-label">Advertisement</p>
      <div className={`ezy-ad-frame${empty ? ' ezy-ad-frame--empty' : ''}`}>
        {!empty && href ? (
          <a href={href} target="_blank" rel="noopener noreferrer sponsored" className="ezy-ad-link">
            {media}
          </a>
        ) : (
          media
        )}
      </div>
    </aside>
  );
}
