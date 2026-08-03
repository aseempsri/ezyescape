import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  adminApprovePostcard,
  adminDeletePostcard,
  adminDeleteStay,
  adminFetchPostcards,
  adminFetchStays,
  adminLogin,
  adminLogout,
  adminPostcardPendingCount,
  adminRejectPostcard,
  adminSaveStay,
  adminSession,
  adminUpdatePostcard,
  adminUploadFile,
} from '../lib/api';
import { stayPath } from '../utils/paths';
import AdsManager from './AdsManager';
import '../styles/admin.css';

function computeFinal(price, type, value) {
  const p = Number(price) || 0;
  const v = Number(value) || 0;
  if (type === 'percent' && v > 0) return Math.max(0, Math.round(p * (1 - v / 100)));
  if (type === 'flat' && v > 0) return Math.max(0, p - v);
  return p;
}

// Confirmation password required before deleting a listing or postcard.
const DELETE_PASSWORD = 'ezyescape-delete';

const EMPTY_STAY = {
  title: '',
  slug: '',
  location: '',
  cat: '',
  best: '',
  guests: 2,
  rooms: 1,
  price: 0,
  discountType: 'none',
  discountValue: 0,
  description: '',
  story: '',
  hosts: '',
  storyImage: '',
  hostImage: '',
  directions: '',
  mapQuery: '',
  highlights: [],
  images: [],
  videos: [],
  active: true,
};

function SingleImageField({ label, hint, value, onChange }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const { url } = await adminUploadFile(file);
      onChange(url);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div className="admin-media admin-media--single">
      <div className="admin-media-head">
        <div>
          <span>{label}</span>
          {hint ? <p className="admin-field-hint">{hint}</p> : null}
        </div>
        <div className="admin-media-head-actions">
          <button
            type="button"
            className="admin-btn admin-btn--sm admin-btn--primary"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
          {value ? (
            <button type="button" className="admin-btn admin-btn--sm" onClick={() => onChange('')}>
              Clear
            </button>
          ) : null}
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
        </div>
      </div>
      {uploadError ? <p className="admin-error">{uploadError}</p> : null}
      <div className="admin-media-row">
        {value ? <span className="admin-thumb" style={{ backgroundImage: `url('${value}')` }} /> : null}
        <input
          value={value || ''}
          placeholder="https://…/photo.jpg or upload"
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

function MediaList({ label, hint, items, onChange, placeholder, previews, accept, kind }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setUploadError('');
    try {
      const urls = [];
      for (const file of files) {
        const { url } = await adminUploadFile(file);
        urls.push(url);
      }
      onChange([...items, ...urls]);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const isVideo = kind === 'video';

  return (
    <div className="admin-media">
      <div className="admin-media-head">
        <div>
          <span>{label}</span>
          {hint ? <p className="admin-field-hint">{hint}</p> : null}
        </div>
        <div className="admin-media-head-actions">
          <button type="button" className="admin-btn admin-btn--sm" onClick={() => onChange([...items, ''])}>
            + Add URL
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--sm admin-btn--primary"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            multiple
            hidden
            onChange={handleFiles}
          />
        </div>
      </div>
      {uploadError && <p className="admin-error">{uploadError}</p>}
      {items.length === 0 && (
        <p className="admin-hint">None yet — upload or paste URLs. First image becomes the cover.</p>
      )}
      {items.map((val, i) => (
        <div className="admin-media-row" key={i}>
          {previews && val ? (
            isVideo ? (
              <video className="admin-thumb" src={val} muted />
            ) : (
              <span className="admin-thumb" style={{ backgroundImage: `url('${val}')` }} />
            )
          ) : null}
          <input
            value={val}
            placeholder={placeholder}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange(next);
            }}
          />
          <div className="admin-media-row-actions">
            <button type="button" className="admin-btn admin-btn--sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
            <button type="button" className="admin-btn admin-btn--sm" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down">↓</button>
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--sm"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              aria-label={`Remove ${label} ${i + 1}`}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function FormSection({ title, blurb, children }) {
  return (
    <section className="admin-form-section">
      <header className="admin-form-section-head">
        <h3>{title}</h3>
        {blurb ? <p>{blurb}</p> : null}
      </header>
      <div className="admin-grid">{children}</div>
    </section>
  );
}

function ListingForm({ initial, onSave, onCancel, saving, isNew }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');

  useEffect(() => setForm(initial), [initial]);

  const finalPrice = useMemo(
    () => computeFinal(form.price, form.discountType, form.discountValue),
    [form.price, form.discountType, form.discountValue]
  );

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const previewSlug = (form.slug || form.title || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!form.title.trim() || !form.location.trim()) {
      setError('Title and location are required.');
      return;
    }
    try {
      await onSave({
        ...form,
        guests: Number(form.guests),
        rooms: Number(form.rooms),
        price: Number(form.price),
        discountValue: Number(form.discountValue),
        highlights: (Array.isArray(form.highlights) ? form.highlights : String(form.highlights || '').split('\n'))
          .map((s) => String(s).trim())
          .filter(Boolean),
        images: form.images.map((s) => s.trim()).filter(Boolean),
        videos: form.videos.map((s) => s.trim()).filter(Boolean),
      });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="admin-form" onSubmit={submit}>
      <p className="admin-form-lead">
        Every section maps to the live property page. Fill them for a new listing and it will appear in the same layout as existing stays — gallery, moments, story, hosts, directions, pricing, and booking.
      </p>

      <FormSection title="1 · Identity" blurb="Title, location, and page URL.">
        <label className="admin-field admin-col-2">
          <span>Title *</span>
          <input value={form.title} onChange={set('title')} placeholder="The Kumaoni Family Home" />
        </label>
        <label className="admin-field admin-col-2">
          <span>URL slug <em>(optional — auto from title)</em></span>
          <input value={form.slug || ''} onChange={set('slug')} placeholder="kumaoni-family-home" />
        </label>
        <label className="admin-field admin-col-2">
          <span>Location *</span>
          <input value={form.location} onChange={set('location')} placeholder="Almora, Kumaon" />
        </label>
      </FormSection>

      <FormSection title="2 · Snapshot" blurb="Guests, rooms, tags, and short intro under the heading.">
        <label className="admin-field">
          <span>Guests</span>
          <input type="number" min={1} value={form.guests} onChange={set('guests')} />
        </label>
        <label className="admin-field">
          <span>Rooms</span>
          <input type="number" min={1} value={form.rooms} onChange={set('rooms')} />
        </label>
        <label className="admin-field admin-col-2">
          <span>Category tags <em>(space separated — e.g. quiet forest family)</em></span>
          <input value={form.cat} onChange={set('cat')} placeholder="quiet forest" />
        </label>
        <label className="admin-field admin-col-2">
          <span>Best for</span>
          <input value={form.best} onChange={set('best')} placeholder="Couples · Writers · Slow Travellers" />
        </label>
        <label className="admin-field admin-col-2">
          <span>Short description</span>
          <textarea
            rows={2}
            value={form.description || ''}
            onChange={set('description')}
            placeholder="One or two sentences under the heading on the property page."
          />
        </label>
      </FormSection>

      <FormSection title="3 · At a glance (moments)" blurb="Moment cards on the property page — one highlight per line.">
        <label className="admin-field admin-col-2">
          <span>Highlights</span>
          <textarea
            rows={5}
            value={Array.isArray(form.highlights) ? form.highlights.join('\n') : (form.highlights || '')}
            onChange={(e) => setForm((f) => ({ ...f, highlights: e.target.value.split('\n') }))}
            placeholder={"Sunrise balcony with Himalayan views\nHome-cooked Kumaoni meals\nVillage walks with your hosts\nQuiet workspace for writers"}
          />
        </label>
      </FormSection>

      <FormSection title="4 · The story" blurb="Property narrative for “Life inside this home” (falls back to short description if empty).">
        <label className="admin-field admin-col-2">
          <span>Story</span>
          <textarea
            rows={6}
            value={form.story || ''}
            onChange={set('story')}
            placeholder="Longer narrative about the home, atmosphere, and way of living."
          />
        </label>
        <div className="admin-col-2">
          <SingleImageField
            label="Story panel image"
            hint="Photo shown beside “The story / Life inside this home”."
            value={form.storyImage || ''}
            onChange={(storyImage) => setForm((f) => ({ ...f, storyImage }))}
          />
        </div>
      </FormSection>

      <FormSection title="5 · The hosts" blurb="Who welcomes guests — shown in its own panel on the property page.">
        <label className="admin-field admin-col-2">
          <span>Hosts</span>
          <textarea
            rows={5}
            value={form.hosts || ''}
            onChange={set('hosts')}
            placeholder="Introduce the host family — what they know, how they welcome guests."
          />
        </label>
        <div className="admin-col-2">
          <SingleImageField
            label="Hosts panel image"
            hint="Photo shown beside “Who welcomes you in”."
            value={form.hostImage || ''}
            onChange={(hostImage) => setForm((f) => ({ ...f, hostImage }))}
          />
        </div>
      </FormSection>

      <FormSection title="6 · How to reach the home" blurb="Directions and Google Maps coordinates for the property page map.">
        <label className="admin-field admin-col-2">
          <span>Directions</span>
          <textarea
            rows={4}
            value={form.directions || ''}
            onChange={set('directions')}
            placeholder="Nearest station/airport, drive time, last-mile tips."
          />
        </label>
        <label className="admin-field admin-col-2">
          <span>Google Maps query / coordinates</span>
          <input
            value={form.mapQuery || ''}
            onChange={set('mapQuery')}
            placeholder="29.5970, 79.6580  or  Village Name, Almora, Uttarakhand"
          />
        </label>
        <p className="admin-field-hint admin-col-2">
          Paste a place name or <code>latitude, longitude</code>. Used for the map embed and “Open in Google Maps” link. Falls back to Location if empty.
        </p>
      </FormSection>

      <FormSection title="7 · Pricing & booking" blurb="Shown on the booking card. Guests can redeem ezy coins at checkout on the site.">
        <label className="admin-field">
          <span>Price / night (₹)</span>
          <input type="number" min={0} value={form.price} onChange={set('price')} />
        </label>
        <label className="admin-field">
          <span>Discount type</span>
          <select value={form.discountType} onChange={set('discountType')}>
            <option value="none">No discount</option>
            <option value="percent">Percent (%)</option>
            <option value="flat">Flat (₹)</option>
          </select>
        </label>
        <label className="admin-field">
          <span>Discount value</span>
          <input
            type="number"
            min={0}
            value={form.discountValue}
            onChange={set('discountValue')}
            disabled={form.discountType === 'none'}
          />
        </label>
        <div className="admin-field admin-price-preview">
          <span>Property page shows</span>
          <div>
            {finalPrice < Number(form.price) && <del>₹{Number(form.price)}</del>}{' '}
            <strong>₹{finalPrice}</strong> <em>/night</em>
          </div>
        </div>
      </FormSection>

      <FormSection
        title="8 · Image & video gallery"
        blurb="Main gallery, filmstrip, and photo mosaic. Reorder with ↑ ↓ — first image is the cover."
      >
        <div className="admin-col-full">
          <MediaList
            label="Images"
            hint="Used for gallery, thumbnails, story visual, and mosaic."
            items={form.images}
            onChange={(images) => setForm((f) => ({ ...f, images }))}
            placeholder="https://…/photo.jpg or upload"
            previews
            accept="image/*"
            kind="image"
          />
          <MediaList
            label="Videos"
            hint="Optional clips in the same gallery carousel."
            items={form.videos}
            onChange={(videos) => setForm((f) => ({ ...f, videos }))}
            placeholder="https://…/clip.mp4 or upload"
            previews
            accept="video/*"
            kind="video"
          />
        </div>
      </FormSection>

      <FormSection title="8 · Visibility" blurb="Inactive listings stay in admin but are hidden publicly.">
        <label className="admin-checkbox admin-col-2">
          <input type="checkbox" checked={form.active} onChange={set('active')} />
          <span>Active (visible on the site)</span>
        </label>
      </FormSection>

      {error && <p className="admin-error">{error}</p>}

      <div className="admin-form-actions">
        <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
          {saving ? 'Saving…' : isNew ? 'Create listing' : 'Save listing'}
        </button>
        {onCancel && (
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        {!isNew && previewSlug && (
          <a
            className="admin-btn admin-btn--ghost"
            href={stayPath(form.slug || form.id || previewSlug)}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on site →
          </a>
        )}
      </div>
    </form>
  );
}

function PostcardMediaEditor({ media, onChange }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setUploadError('');
    try {
      const next = [...media];
      for (const file of files) {
        const { url, type } = await adminUploadFile(file);
        next.push({
          url,
          type: String(type || '').startsWith('video/') ? 'video' : 'image',
        });
      }
      onChange(next);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= media.length) return;
    const next = [...media];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="admin-pc-media-editor">
      <div className="admin-media-head">
        <div>
          <span>Photos &amp; videos</span>
          <p className="admin-field-hint">Reorder, remove, or upload. First item is the cover.</p>
        </div>
        <div className="admin-media-head-actions">
          <button
            type="button"
            className="admin-btn admin-btn--sm"
            onClick={() => onChange([...media, { url: '', type: 'image' }])}
          >
            + Add URL
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--sm admin-btn--primary"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            multiple
            hidden
            onChange={handleFiles}
          />
        </div>
      </div>
      {uploadError ? <p className="admin-error">{uploadError}</p> : null}
      {media.length === 0 ? (
        <p className="admin-hint">No media yet — upload or paste a URL.</p>
      ) : null}
      {media.map((item, i) => (
        <div className="admin-media-row" key={`${item.url}-${i}`}>
          {item.url ? (
            item.type === 'video' ? (
              <video className="admin-thumb" src={item.url} muted />
            ) : (
              <span className="admin-thumb" style={{ backgroundImage: `url('${item.url}')` }} />
            )
          ) : null}
          <input
            value={item.url}
            placeholder="https://… or /uploads/…"
            onChange={(e) => {
              const next = [...media];
              const url = e.target.value;
              next[i] = {
                url,
                type: item.type === 'video' || /\.(mp4|webm|mov)(\?|$)/i.test(url) ? 'video' : 'image',
              };
              onChange(next);
            }}
          />
          <select
            className="admin-pc-type"
            value={item.type === 'video' ? 'video' : 'image'}
            onChange={(e) => {
              const next = [...media];
              next[i] = { ...next[i], type: e.target.value };
              onChange(next);
            }}
            aria-label="Media type"
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
          <div className="admin-media-row-actions">
            <button type="button" className="admin-btn admin-btn--sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
            <button type="button" className="admin-btn admin-btn--sm" onClick={() => move(i, 1)} disabled={i === media.length - 1} aria-label="Move down">↓</button>
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--sm"
              onClick={() => onChange(media.filter((_, j) => j !== i))}
              aria-label={`Remove media ${i + 1}`}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function PostcardEditForm({ postcard, onCancel, onSaved }) {
  const [name, setName] = useState(postcard.name || '');
  const [from, setFrom] = useState(postcard.from || '');
  const [text, setText] = useState(postcard.text || '');
  const [media, setMedia] = useState(() => (postcard.media || []).map((m) => ({ ...m })));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function save(e) {
    e.preventDefault();
    setError('');
    const cleaned = media.map((m) => ({ ...m, url: String(m.url || '').trim() })).filter((m) => m.url);
    if (!name.trim() || name.trim().length < 2) {
      setError('Name is required.');
      return;
    }
    if (!text.trim() || text.trim().length < 10) {
      setError('Review text is too short.');
      return;
    }
    if (!cleaned.length) {
      setError('Keep at least one image or video.');
      return;
    }
    setBusy(true);
    try {
      const updated = await adminUpdatePostcard(postcard.id, {
        name: name.trim(),
        from: from.trim(),
        text: text.trim(),
        media: cleaned,
      });
      onSaved(updated);
    } catch (err) {
      setError(err.message || 'Could not save');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="admin-pc-edit" onSubmit={save}>
      <div className="admin-pc-edit-grid">
        <label className="admin-field">
          <span>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="admin-field">
          <span>From</span>
          <input value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="admin-field admin-col-2">
          <span>Review text</span>
          <textarea rows={5} value={text} onChange={(e) => setText(e.target.value)} />
        </label>
      </div>

      <PostcardMediaEditor media={media} onChange={setMedia} />

      {error ? <p className="admin-error">{error}</p> : null}

      <div className="admin-form-actions">
        <button type="submit" className="admin-btn admin-btn--primary" disabled={busy}>
          {busy ? 'Saving…' : 'Save changes'}
        </button>
        <button type="button" className="admin-btn admin-btn--ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function PostcardModeration({ onChanged }) {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [editingId, setEditingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await adminFetchPostcards(filter === 'all' ? '' : filter));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setEditingId(null); }, [filter]);

  async function act(id, action) {
    setBusyId(id);
    try {
      if (action === 'approve') await adminApprovePostcard(id);
      else if (action === 'reject') await adminRejectPostcard(id);
      else if (action === 'delete') {
        const entered = window.prompt(
          'Delete this postcard permanently?\n\nType the delete password to confirm:'
        );
        if (entered == null) return;
        if (entered !== DELETE_PASSWORD) {
          window.alert('Incorrect delete password. Postcard was not deleted.');
          return;
        }
        await adminDeletePostcard(id);
        if (editingId === id) setEditingId(null);
      }
      await load();
      onChanged?.();
    } catch (err) {
      window.alert(err.message || 'Action failed');
    } finally {
      setBusyId('');
    }
  }

  return (
    <div className="admin-postcards">
      <div className="admin-pc-filters">
        {['pending', 'approved', 'rejected', 'all'].map((f) => (
          <button
            key={f}
            type="button"
            className={`admin-btn admin-btn--sm${filter === f ? ' admin-btn--primary' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && <p className="admin-hint">Loading postcards…</p>}
      {!loading && items.length === 0 && (
        <p className="admin-hint">No postcards in this filter.</p>
      )}

      <div className="admin-pc-list">
        {items.map((p) => {
          const cover = p.media?.[0];
          const isEditing = editingId === p.id;
          return (
            <article key={p.id} className={`admin-pc-card admin-pc-card--${p.status}${isEditing ? ' admin-pc-card--editing' : ''}`}>
              {!isEditing ? (
                <>
                  <div className="admin-pc-media">
                    {cover?.type === 'video' ? (
                      <video src={cover.url} muted playsInline />
                    ) : cover ? (
                      <span style={{ backgroundImage: `url('${cover.url}')` }} />
                    ) : (
                      <span className="admin-pc-media-empty">No media</span>
                    )}
                  </div>
                  <div className="admin-pc-body">
                    <div className="admin-pc-meta">
                      <strong>{p.name}</strong>
                      {p.from ? <span> · {p.from}</span> : null}
                      <span className={`admin-tag admin-tag--${p.status}`}>{p.status}</span>
                    </div>
                    <p className="admin-pc-text">{p.text}</p>
                    <div className="admin-pc-avatar-row">
                      {p.avatarMode === 'photo' && p.avatarUrl ? (
                        <span className="admin-pc-face" style={{ backgroundImage: `url('${p.avatarUrl}')` }} />
                      ) : (
                        <span className="admin-pc-face admin-pc-face--emoji">{p.characterEmoji || '✉️'}</span>
                      )}
                      <small>
                        {p.media?.length || 0} media · {new Date(p.createdAt).toLocaleString()}
                      </small>
                    </div>
                    <div className="admin-listing-actions">
                      <button
                        type="button"
                        className="admin-btn admin-btn--sm"
                        disabled={busyId === p.id}
                        onClick={() => setEditingId(p.id)}
                      >
                        Edit
                      </button>
                      {p.status !== 'approved' && (
                        <button
                          type="button"
                          className="admin-btn admin-btn--primary admin-btn--sm"
                          disabled={busyId === p.id}
                          onClick={() => act(p.id, 'approve')}
                        >
                          Approve
                        </button>
                      )}
                      {p.status !== 'rejected' && (
                        <button
                          type="button"
                          className="admin-btn admin-btn--sm"
                          disabled={busyId === p.id}
                          onClick={() => act(p.id, 'reject')}
                        >
                          Reject
                        </button>
                      )}
                      <button
                        type="button"
                        className="admin-btn admin-btn--danger admin-btn--sm"
                        disabled={busyId === p.id}
                        onClick={() => act(p.id, 'delete')}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="admin-pc-body admin-pc-body--edit">
                  <div className="admin-pc-meta">
                    <strong>Edit postcard</strong>
                    <span className={`admin-tag admin-tag--${p.status}`}>{p.status}</span>
                  </div>
                  <PostcardEditForm
                    postcard={p}
                    onCancel={() => setEditingId(null)}
                    onSaved={async () => {
                      setEditingId(null);
                      await load();
                      onChanged?.();
                    }}
                  />
                  <div className="admin-listing-actions" style={{ marginTop: 12 }}>
                    <button
                      type="button"
                      className="admin-btn admin-btn--danger admin-btn--sm"
                      disabled={busyId === p.id}
                      onClick={() => act(p.id, 'delete')}
                    >
                      Delete postcard
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Dashboard({ onLogout }) {
  const [tab, setTab] = useState('listings');
  const [stays, setStays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // stay id, 'new', or null
  const [saving, setSaving] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setStays(await adminFetchStays());
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshPending = useCallback(async () => {
    try {
      setPendingCount(await adminPostcardPendingCount());
    } catch {
      setPendingCount(0);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    refreshPending();
    const t = setInterval(refreshPending, 30000);
    return () => clearInterval(t);
  }, [refreshPending]);

  useEffect(() => {
    if (tab === 'postcards') refreshPending();
  }, [tab, refreshPending]);

  const editingStay = useMemo(() => {
    if (editing === 'new') return { ...EMPTY_STAY };
    if (!editing) return null;
    const s = stays.find((x) => x.id === editing);
    return s ? { ...EMPTY_STAY, ...s } : null;
  }, [editing, stays]);

  async function handleSave(payload) {
    setSaving(true);
    try {
      await adminSaveStay(editing === 'new' ? null : editing, payload);
      setEditing(null);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, title) {
    const entered = window.prompt(
      `Delete "${title}"? This cannot be undone.\n\nType the delete password to confirm:`
    );
    if (entered == null) return;
    if (entered !== DELETE_PASSWORD) {
      window.alert('Incorrect delete password. Listing was not deleted.');
      return;
    }
    await adminDeleteStay(id);
    await load();
  }

  return (
    <div className="admin-wrap">
      <header className="admin-header">
        <div>
          <h1>Ezy Escape · Admin</h1>
          <p>
            Manage property listings and curate guest postcards before they appear on the site.
          </p>
        </div>
        <div className="admin-header-actions">
          {tab === 'listings' && editing == null && (
            <button type="button" className="admin-btn admin-btn--primary" onClick={() => setEditing('new')}>
              + New listing
            </button>
          )}
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onLogout}>
            Log out
          </button>
        </div>
      </header>

      <nav className="admin-tabs" aria-label="Admin sections">
        <button
          type="button"
          className={`admin-tab${tab === 'listings' ? ' is-on' : ''}`}
          onClick={() => { setTab('listings'); setEditing(null); }}
        >
          Listings
        </button>
        <button
          type="button"
          className={`admin-tab${tab === 'postcards' ? ' is-on' : ''}`}
          onClick={() => { setTab('postcards'); setEditing(null); }}
        >
          Postcards
          {pendingCount > 0 ? <span className="admin-badge">{pendingCount}</span> : null}
        </button>
        <button
          type="button"
          className={`admin-tab${tab === 'ads' ? ' is-on' : ''}`}
          onClick={() => { setTab('ads'); setEditing(null); }}
        >
          Manage Ads
        </button>
      </nav>

      {tab === 'ads' ? (
        <AdsManager />
      ) : tab === 'postcards' ? (
        <section className="admin-card">
          <h2>Postcard inbox</h2>
          <p className="admin-hint" style={{ marginTop: 0, marginBottom: 0 }}>
            Guests submit postcards privately. Approve to publish on the Postcards page (latest first).
            Use Edit to change text, photos, and videos.
          </p>
          <PostcardModeration onChanged={refreshPending} />
        </section>
      ) : editing != null && editingStay ? (
        <section className="admin-card">
          <h2>{editing === 'new' ? 'New listing' : 'Edit listing'}</h2>
          <ListingForm
            initial={editingStay}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
            saving={saving}
            isNew={editing === 'new'}
          />
        </section>
      ) : (
        <section className="admin-list">
          {loading && <p className="admin-hint">Loading listings…</p>}
          {!loading && stays.length === 0 && <p className="admin-hint">No listings yet. Create one.</p>}
          {stays.map((s) => (
            <article key={s.id} className={`admin-listing${s.active ? '' : ' admin-listing--inactive'}`}>
              <span className="admin-listing-thumb" style={{ backgroundImage: `url('${s.image}')` }} />
              <div className="admin-listing-info">
                <div className="admin-listing-title">
                  {s.title} {!s.active && <span className="admin-tag">hidden</span>}
                </div>
                <div className="admin-listing-meta">{s.location} · {s.guests} guests · {s.rooms} rooms</div>
                <div className="admin-listing-price">
                  {s.hasDiscount && <del>₹{s.price}</del>} <strong>₹{s.finalPrice}</strong> /night
                  <span className="admin-listing-media">
                    {(s.images || []).length} img · {(s.videos || []).length} vid
                    {(s.highlights || []).length ? ` · ${s.highlights.length} moments` : ''}
                  </span>
                </div>
              </div>
              <div className="admin-listing-actions">
                <a
                  className="admin-btn admin-btn--sm"
                  href={stayPath(s.slug || s.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View
                </a>
                <button type="button" className="admin-btn admin-btn--sm" onClick={() => setEditing(s.id)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--danger admin-btn--sm"
                  onClick={() => handleDelete(s.id, s.title)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

function LoginView({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await adminLogin(password);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-login">
      <form className="admin-login-card" onSubmit={submit}>
        <h1>Admin access</h1>
        <p>Enter the admin password to manage listings and postcards.</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
        />
        {error && <p className="admin-error">{error}</p>}
        <button type="submit" className="admin-btn admin-btn--primary" disabled={busy}>
          {busy ? 'Checking…' : 'Enter'}
        </button>
      </form>
    </div>
  );
}

export default function AdminApp() {
  const [authed, setAuthed] = useState(null);

  useEffect(() => {
    adminSession()
      .then(setAuthed)
      .catch(() => setAuthed(false));
  }, []);

  async function handleLogout() {
    await adminLogout();
    setAuthed(false);
  }

  if (authed === null) {
    return <div className="admin-login"><p className="admin-hint">Loading…</p></div>;
  }

  return authed ? (
    <Dashboard onLogout={handleLogout} />
  ) : (
    <LoginView onSuccess={() => setAuthed(true)} />
  );
}
