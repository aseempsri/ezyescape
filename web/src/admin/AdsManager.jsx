import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  adminAddAdMedia,
  adminClearAdMedia,
  adminRemoveAdMedia,
  adminResetAd,
  adminUpdateAd,
  adminUploadFile,
  fetchAds,
} from '../lib/api';
import { AD_SECTIONS, AD_SITE } from '../data/adSlots';
import { invalidateAdsCache } from '../hooks/useAds';

const DELETE_PASSWORD = 'ezyescape-delete';

function notifyAdsChanged() {
  invalidateAdsCache();
  try {
    window.dispatchEvent(new Event('ezy-ads-changed'));
  } catch { /* ignore */ }
}

function confirmDeletePassword(message) {
  const entered = window.prompt(`${message}\n\nType the delete password to confirm:`);
  if (entered == null) return false;
  if (entered !== DELETE_PASSWORD) {
    window.alert('Incorrect delete password. Nothing was deleted.');
    return false;
  }
  return true;
}

function AdSlotCard({ ad, onChanged }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [linkUrl, setLinkUrl] = useState(ad.linkUrl || '');
  const [altText, setAltText] = useState(ad.altText || '');

  useEffect(() => {
    setLinkUrl(ad.linkUrl || '');
    setAltText(ad.altText || '');
  }, [ad.linkUrl, ad.altText, ad.adId]);

  async function patch(payload) {
    setBusy(true);
    setError('');
    try {
      const updated = await adminUpdateAd(ad.adId, payload, AD_SITE);
      onChanged(updated);
      notifyAdsChanged();
    } catch (err) {
      setError(err.message || 'Update failed');
    } finally {
      setBusy(false);
    }
  }

  async function saveLink() {
    if (linkUrl === (ad.linkUrl || '')) return;
    await patch({ linkUrl });
  }

  async function saveAlt() {
    if (altText === (ad.altText || '')) return;
    await patch({ altText });
  }

  async function onUpload(e) {
    const files = [...(e.target.files || [])];
    e.target.value = '';
    if (!files.length) return;
    setBusy(true);
    setError('');
    try {
      const uploaded = [];
      for (const file of files.slice(0, 12)) {
        const { url, type } = await adminUploadFile(file);
        uploaded.push({
          mediaUrl: url,
          mediaType: String(type || '').startsWith('video/') ? 'video' : 'image',
        });
      }
      if (uploaded.length) {
        const updated = await adminAddAdMedia(ad.adId, uploaded, AD_SITE);
        onChanged(updated);
        notifyAdsChanged();
      }
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  async function removeMedia(index) {
    if (!confirmDeletePassword('Remove this creative from the slot?')) return;
    setBusy(true);
    setError('');
    try {
      const updated = await adminRemoveAdMedia(ad.adId, index, AD_SITE);
      onChanged(updated);
      notifyAdsChanged();
    } catch (err) {
      setError(err.message || 'Remove failed');
    } finally {
      setBusy(false);
    }
  }

  async function clearAll() {
    if (!confirmDeletePassword('Clear all creatives in this slot?')) return;
    setBusy(true);
    setError('');
    try {
      const updated = await adminClearAdMedia(ad.adId, AD_SITE);
      onChanged(updated);
      notifyAdsChanged();
    } catch (err) {
      setError(err.message || 'Clear failed');
    } finally {
      setBusy(false);
    }
  }

  async function resetSlot() {
    if (!confirmDeletePassword(`Reset ${ad.label} (${ad.adId}) — disable and clear everything?`)) return;
    setBusy(true);
    setError('');
    try {
      const updated = await adminResetAd(ad.adId, AD_SITE);
      onChanged(updated);
      notifyAdsChanged();
    } catch (err) {
      setError(err.message || 'Reset failed');
    } finally {
      setBusy(false);
    }
  }

  const orientationLabel = ad.orientation === 'vertical' ? 'Vertical' : 'Horizontal';

  return (
    <article className={`admin-ad-slot${ad.enabled ? ' is-on' : ''}`}>
      <header className="admin-ad-slot-head">
        <div>
          <strong>{ad.label}</strong>
          <span className={`admin-ad-orient admin-ad-orient--${ad.orientation}`}>
            {orientationLabel} frame
          </span>
          <p className="admin-hint" style={{ margin: '6px 0 0' }}>{ad.hint}</p>
          <code className="admin-ad-id">{ad.adId}</code>
        </div>
        <label className="admin-ad-toggle">
          <input
            type="checkbox"
            checked={Boolean(ad.enabled)}
            disabled={busy}
            onChange={(e) => patch({ enabled: e.target.checked })}
          />
          <span>{ad.enabled ? 'On' : 'Off'}</span>
        </label>
      </header>

      <div className="admin-ad-media-grid">
        {(ad.mediaItems || []).length === 0 && (
          <p className="admin-hint">No creatives yet — upload images or videos. Frame uses object-fit contain.</p>
        )}
        {(ad.mediaItems || []).map((item, i) => (
          <div key={`${item.mediaUrl}-${i}`} className="admin-ad-thumb-wrap">
            {item.mediaType === 'video' ? (
              <video className="admin-ad-thumb" src={item.mediaUrl} muted />
            ) : (
              <span className="admin-ad-thumb" style={{ backgroundImage: `url('${item.mediaUrl}')` }} />
            )}
            <button type="button" className="admin-btn admin-btn--sm admin-btn--danger" disabled={busy} onClick={() => removeMedia(i)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="admin-ad-actions">
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          onChange={onUpload}
        />
        <button
          type="button"
          className="admin-btn admin-btn--sm admin-btn--primary"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          {busy ? 'Working…' : 'Upload'}
        </button>
        {(ad.mediaItems || []).length > 0 && (
          <button type="button" className="admin-btn admin-btn--sm" disabled={busy} onClick={clearAll}>
            Clear media
          </button>
        )}
        <button type="button" className="admin-btn admin-btn--sm admin-btn--danger" disabled={busy} onClick={resetSlot}>
          Reset slot
        </button>
      </div>

      <label className="admin-field">
        <span>Click-through URL</span>
        <input
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          onBlur={saveLink}
          placeholder="https://…"
          disabled={busy}
        />
      </label>
      <label className="admin-field">
        <span>Alt text</span>
        <input
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          onBlur={saveAlt}
          placeholder="Short description for accessibility"
          disabled={busy}
        />
      </label>
      {error ? <p className="admin-error">{error}</p> : null}
    </article>
  );
}

export default function AdsManager() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openSection, setOpenSection] = useState(AD_SECTIONS[0]?.id || 'homestays');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAds(AD_SITE);
      setAds(data.ads || []);
    } catch (err) {
      setError(err.message || 'Failed to load ads');
      setAds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const byId = useMemo(() => {
    const map = new Map();
    ads.forEach((a) => map.set(a.adId, a));
    return map;
  }, [ads]);

  function onChanged(updated) {
    setAds((prev) => {
      const next = [...prev];
      const idx = next.findIndex((a) => a.adId === updated.adId);
      if (idx >= 0) next[idx] = updated;
      else next.push(updated);
      return next;
    });
  }

  async function toggleSection(section, enabled) {
    setError('');
    try {
      for (const slot of section.slots) {
        const updated = await adminUpdateAd(slot.id, { enabled }, AD_SITE);
        onChanged(updated);
      }
      notifyAdsChanged();
    } catch (err) {
      setError(err.message || 'Bulk update failed');
    }
  }

  return (
    <section className="admin-card admin-ads">
      <h2>Manage Ads</h2>
      <p className="admin-hint" style={{ marginTop: 0 }}>
        Fixed slots only — enable a slot, upload creatives (image or video), set optional link and alt text.
        Horizontal slots are wide banners; vertical slots are tall frames. Media is framed with object-fit contain.
        Deleting creatives or resetting a slot requires the delete password.
      </p>

      {loading && <p className="admin-hint">Loading ad slots…</p>}
      {error ? <p className="admin-error">{error}</p> : null}

      <div className="admin-ads-sections">
        {AD_SECTIONS.map((section) => {
          const sectionAds = section.slots.map((s) => byId.get(s.id)).filter(Boolean);
          const allOn = sectionAds.length > 0 && sectionAds.every((a) => a.enabled);
          const isOpen = openSection === section.id;
          return (
            <div key={section.id} className={`admin-ads-section${isOpen ? ' is-open' : ''}`}>
              <button
                type="button"
                className="admin-ads-section-toggle"
                onClick={() => setOpenSection(isOpen ? '' : section.id)}
              >
                <span>{section.title}</span>
                <em>{section.slots.length} slots</em>
              </button>
              {isOpen && (
                <div className="admin-ads-section-body">
                  <div className="admin-ads-section-bar">
                    <label className="admin-ad-toggle">
                      <input
                        type="checkbox"
                        checked={allOn}
                        onChange={(e) => toggleSection(section, e.target.checked)}
                      />
                      <span>All ads in {section.title}</span>
                    </label>
                  </div>
                  <div className="admin-ads-grid">
                    {section.slots.map((slot) => {
                      const ad = byId.get(slot.id) || {
                        adId: slot.id,
                        label: slot.label,
                        hint: slot.hint,
                        orientation: slot.orientation,
                        enabled: false,
                        mediaItems: [],
                        linkUrl: '',
                        altText: '',
                      };
                      return <AdSlotCard key={slot.id} ad={ad} onChanged={onChanged} />;
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
