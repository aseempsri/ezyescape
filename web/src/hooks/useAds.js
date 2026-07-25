import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchAds } from '../lib/api';
import { AD_SITE } from '../data/adSlots';

function rotationKey(adId) {
  return `ezy-ad-rot-${adId}`;
}

function pickRotated(adId, mediaItems) {
  if (!mediaItems?.length) return null;
  if (mediaItems.length === 1) return mediaItems[0];
  try {
    const raw = sessionStorage.getItem(rotationKey(adId));
    const idx = Number(raw);
    const next = Number.isFinite(idx) ? (idx + 1) % mediaItems.length : 0;
    sessionStorage.setItem(rotationKey(adId), String(next));
    return mediaItems[next];
  } catch {
    return mediaItems[0];
  }
}

let cache = null;
let inflight = null;
const listeners = new Set();

async function loadAdsOnce() {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = fetchAds(AD_SITE)
    .then((data) => {
      cache = data;
      listeners.forEach((fn) => fn(cache));
      return cache;
    })
    .catch(() => {
      cache = { site: AD_SITE, sections: [], ads: [] };
      return cache;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function invalidateAdsCache() {
  cache = null;
}

export function useAds() {
  const [bundle, setBundle] = useState(cache);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    let active = true;
    const onUpdate = (next) => {
      if (active) {
        setBundle(next);
        setLoading(false);
      }
    };
    const onChanged = () => {
      invalidateAdsCache();
      loadAdsOnce().then(onUpdate);
    };
    listeners.add(onUpdate);
    loadAdsOnce().then(onUpdate);
    window.addEventListener('ezy-ads-changed', onChanged);
    return () => {
      active = false;
      listeners.delete(onUpdate);
      window.removeEventListener('ezy-ads-changed', onChanged);
    };
  }, []);

  const byId = useMemo(() => {
    const map = new Map();
    (bundle?.ads || []).forEach((ad) => map.set(ad.adId, ad));
    return map;
  }, [bundle]);

  const getCreative = useCallback(
    (adId) => {
      const ad = byId.get(adId);
      if (!ad?.enabled) return null;
      const items = ad.mediaItems?.length
        ? ad.mediaItems
        : ad.mediaUrl
          ? [{ mediaType: ad.mediaType || 'image', mediaUrl: ad.mediaUrl }]
          : [];
      const picked = items.length ? pickRotated(adId, items) : null;
      return {
        ad,
        mediaType: picked?.mediaType || '',
        mediaUrl: picked?.mediaUrl || '',
        linkUrl: ad.linkUrl || '',
        altText: ad.altText || 'Advertisement',
        orientation: ad.orientation || 'horizontal',
        empty: !picked,
      };
    },
    [byId]
  );

  const reload = useCallback(() => {
    invalidateAdsCache();
    return loadAdsOnce().then((next) => {
      listeners.forEach((fn) => fn(next));
      return next;
    });
  }, []);

  return { loading, ads: bundle?.ads || [], getCreative, reload };
}
