import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  adminDeleteStay,
  adminFetchStays,
  adminLogin,
  adminLogout,
  adminSaveStay,
  adminSession,
  adminUploadFile,
} from '../lib/api';
import { stayPath } from '../utils/paths';
import '../styles/admin.css';

function computeFinal(price, type, value) {
  const p = Number(price) || 0;
  const v = Number(value) || 0;
  if (type === 'percent' && v > 0) return Math.max(0, Math.round(p * (1 - v / 100)));
  if (type === 'flat' && v > 0) return Math.max(0, p - v);
  return p;
}

// Confirmation password required before deleting a listing (guards against accidents).
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
  directions: '',
  highlights: [],
  images: [],
  videos: [],
  active: true,
};

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
        Every section maps to the live property page. Fill them for a new listing and it will appear in the same layout as existing stays — gallery, moments, story, directions, pricing, and booking.
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

      <FormSection title="4 · The story" blurb="Longer narrative (falls back to short description if empty).">
        <label className="admin-field admin-col-2">
          <span>Story</span>
          <textarea
            rows={6}
            value={form.story || ''}
            onChange={set('story')}
            placeholder="Longer narrative about the home, hosts, and atmosphere."
          />
        </label>
      </FormSection>

      <FormSection title="5 · How to reach the home" blurb="Directions block on the property page.">
        <label className="admin-field admin-col-2">
          <span>Directions</span>
          <textarea
            rows={4}
            value={form.directions || ''}
            onChange={set('directions')}
            placeholder="Nearest station/airport, drive time, last-mile tips."
          />
        </label>
      </FormSection>

      <FormSection title="6 · Pricing & booking" blurb="Shown on the booking card. Guests can redeem ezy coins at checkout on the site.">
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
        title="7 · Image & video gallery"
        blurb="Main gallery, filmstrip, and photo mosaic. Reorder with ↑ ↓ — first image is the cover."
      >
        <div className="admin-col-2">
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

function Dashboard({ onLogout }) {
  const [stays, setStays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // stay id, 'new', or null
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setStays(await adminFetchStays());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

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
          <h1>Ezy Escape · Listings</h1>
          <p>
            Create full property pages: gallery, tags, moments, story, directions, pricing, and booking.
            New listings use the same layout as existing stays.
          </p>
        </div>
        <div className="admin-header-actions">
          {editing == null && (
            <button type="button" className="admin-btn admin-btn--primary" onClick={() => setEditing('new')}>
              + New listing
            </button>
          )}
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onLogout}>
            Log out
          </button>
        </div>
      </header>

      {editing != null && editingStay ? (
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
        <p>Enter the admin password to manage listings.</p>
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
