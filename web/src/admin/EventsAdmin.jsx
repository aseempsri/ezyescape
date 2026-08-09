import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  adminDeleteEvent,
  adminFetchEvents,
  adminSaveEvent,
  adminUploadFile,
} from '../lib/api';
import { DEFAULT_EVENT_ICON, EVENT_ICONS } from '../data/eventIcons';

const DELETE_PASSWORD = 'ezyescape-delete';

const EMPTY_EVENT = {
  title: '',
  slug: '',
  status: 'upcoming',
  tag: '',
  place: '',
  spots: '',
  month: '',
  day: '',
  dateLabel: '',
  startDate: '',
  desc: '',
  details: '',
  instructions: '',
  guidelines: '',
  pricing: '',
  locationDetails: '',
  images: [],
  waMessage: '',
  emoji: DEFAULT_EVENT_ICON,
  active: true,
  adEnabled: false,
  adMediaUrl: '',
  adMediaType: 'image',
  adLinkUrl: '',
  adAltText: '',
};

function Field({ label, children, className = '' }) {
  return (
    <label className={`admin-field${className ? ` ${className}` : ''}`}>
      <span>{label}</span>
      {children}
    </label>
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

function EventForm({ initial, onCancel, onSaved }) {
  const [form, setForm] = useState({ ...EMPTY_EVENT, ...initial });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const isNew = !initial?.id;

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const addImageUrl = () => {
    const url = window.prompt('Image URL (https://… or /images/… or /uploads/…)');
    if (!url?.trim()) return;
    setForm((f) => ({ ...f, images: [...(f.images || []), url.trim()] }));
  };

  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const { url } = await adminUploadFile(file);
      setForm((f) => ({ ...f, images: [...(f.images || []), url] }));
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const removeImage = (idx) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const uploadAdMedia = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const { url, type } = await adminUploadFile(file);
      setForm((f) => ({
        ...f,
        adMediaUrl: url,
        adMediaType: String(type || '').startsWith('video/') ? 'video' : 'image',
      }));
    } catch (err) {
      setError(err.message || 'Ad upload failed');
    } finally {
      setBusy(false);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const payload = {
        ...form,
        startDate: form.startDate || null,
        images: form.images || [],
      };
      const saved = await adminSaveEvent(isNew ? null : form.id, payload);
      onSaved(saved);
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="admin-form" onSubmit={save}>
      <div className="admin-form-head">
        <h2>{isNew ? 'New event' : 'Edit event'}</h2>
        <button type="button" className="admin-btn admin-btn--ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
      {error ? <p className="admin-error">{error}</p> : null}

      <FormSection title="Basics" blurb="Name, place, status, and visibility.">
        <Field label="Title" className="admin-col-2">
          <input value={form.title} onChange={set('title')} required />
        </Field>
        <Field label="Slug (optional)" className="admin-col-2">
          <input value={form.slug} onChange={set('slug')} placeholder="sunrise-yoga-circle" />
        </Field>
        <Field label="Status">
          <select value={form.status} onChange={set('status')}>
            <option value="live">Live</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </Field>
        <Field label="Tag">
          <input value={form.tag} onChange={set('tag')} placeholder="Wellness" />
        </Field>
        <Field label="Place">
          <input value={form.place} onChange={set('place')} placeholder="Ranikhet" />
        </Field>
        <Field label="Spots label">
          <input value={form.spots} onChange={set('spots')} placeholder="8 spots left" />
        </Field>
        <label className="admin-checkbox admin-col-full">
          <input type="checkbox" checked={!!form.active} onChange={set('active')} />
          <span>Active (visible on the site)</span>
        </label>
      </FormSection>

      <FormSection title="Schedule" blurb="Card badge and sorting date.">
        <Field label="Start date">
          <input
            type="date"
            value={form.startDate ? String(form.startDate).slice(0, 10) : ''}
            onChange={set('startDate')}
          />
        </Field>
        <Field label="Date label">
          <input value={form.dateLabel} onChange={set('dateLabel')} placeholder="Oct 5" />
        </Field>
        <Field label="Month (badge)">
          <input value={form.month} onChange={set('month')} placeholder="OCT" />
        </Field>
        <Field label="Day (badge)">
          <input value={form.day} onChange={set('day')} placeholder="05" />
        </Field>
      </FormSection>

      <FormSection title="Icon" blurb="Shown on past-event cards on Experiences.">
        <div className="admin-icon-picker admin-col-full">
          <div className="admin-icon-picker-head">
            <span>Selected</span>
            <span className="admin-icon-picker-selected" aria-hidden="true">
              {form.emoji || DEFAULT_EVENT_ICON}
            </span>
          </div>
          <div className="admin-icon-grid" role="listbox" aria-label="Event icons">
            {EVENT_ICONS.map((icon) => {
              const selected = (form.emoji || DEFAULT_EVENT_ICON) === icon;
              return (
                <button
                  key={icon}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`admin-icon-btn${selected ? ' is-on' : ''}`}
                  onClick={() => setForm((f) => ({ ...f, emoji: icon }))}
                >
                  {icon}
                </button>
              );
            })}
          </div>
        </div>
      </FormSection>

      <FormSection title="Copy" blurb="Detail page sections and booking message.">
        <Field label="Short description (card + share text)" className="admin-col-full">
          <textarea rows={3} value={form.desc} onChange={set('desc')} />
        </Field>
        <Field label="Details / About" className="admin-col-full">
          <textarea rows={4} value={form.details} onChange={set('details')} />
        </Field>
        <Field label="Instructions" className="admin-col-2">
          <textarea rows={3} value={form.instructions} onChange={set('instructions')} />
        </Field>
        <Field label="Guidelines" className="admin-col-2">
          <textarea rows={3} value={form.guidelines} onChange={set('guidelines')} />
        </Field>
        <Field label="Pricing" className="admin-col-2">
          <textarea rows={2} value={form.pricing} onChange={set('pricing')} />
        </Field>
        <Field label="Location details" className="admin-col-2">
          <textarea rows={2} value={form.locationDetails} onChange={set('locationDetails')} />
        </Field>
        <Field label="WhatsApp book message" className="admin-col-full">
          <textarea rows={3} value={form.waMessage} onChange={set('waMessage')} />
        </Field>
      </FormSection>

      <FormSection title="Images" blurb="First image is the card cover and social thumbnail.">
        <div className="admin-media-block admin-col-full">
          <div className="admin-media-head">
            <h3>Uploads</h3>
            <div className="admin-media-actions">
              <label className="admin-btn admin-btn--ghost">
                Upload
                <input type="file" accept="image/*" hidden onChange={uploadImage} />
              </label>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={addImageUrl}>
                Add URL
              </button>
            </div>
          </div>
          <div className="admin-thumbs">
            {(form.images || []).map((url, i) => (
              <div key={`${url}-${i}`} className="admin-thumb-wrap">
                <span className="admin-thumb" style={{ backgroundImage: `url('${url}')` }} />
                <button type="button" className="admin-btn admin-btn--danger" onClick={() => removeImage(i)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Event ad space"
        blurb="Horizontal ad below Location on this event’s detail page (same size as other portal ads)."
      >
        <label className="admin-checkbox admin-col-full">
          <input type="checkbox" checked={!!form.adEnabled} onChange={set('adEnabled')} />
          <span>Ad enabled</span>
        </label>
        <Field label="Media type">
          <select value={form.adMediaType || 'image'} onChange={set('adMediaType')}>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </Field>
        <Field label="Click-through URL" className="admin-col-2">
          <input
            value={form.adLinkUrl || ''}
            onChange={set('adLinkUrl')}
            placeholder="https://…"
          />
        </Field>
        <Field label="Alt text">
          <input value={form.adAltText || ''} onChange={set('adAltText')} placeholder="Advertisement" />
        </Field>
        <Field label="Media URL" className="admin-col-2">
          <input
            value={form.adMediaUrl || ''}
            onChange={set('adMediaUrl')}
            placeholder="https://… or /uploads/…"
          />
        </Field>
        <div className="admin-media-actions admin-col-full" style={{ marginTop: 0 }}>
          <label className="admin-btn admin-btn--ghost">
            Upload ad media
            <input type="file" accept="image/*,video/*" hidden onChange={uploadAdMedia} />
          </label>
          {form.adMediaUrl ? (
            <button
              type="button"
              className="admin-btn admin-btn--danger"
              onClick={() => setForm((f) => ({ ...f, adMediaUrl: '' }))}
            >
              Clear media
            </button>
          ) : null}
        </div>
        {form.adMediaUrl ? (
          <div className="admin-thumbs admin-col-full" style={{ marginTop: 12 }}>
            <div className="admin-thumb-wrap">
              {form.adMediaType === 'video' ? (
                <video className="admin-thumb" src={form.adMediaUrl} muted playsInline />
              ) : (
                <span className="admin-thumb" style={{ backgroundImage: `url('${form.adMediaUrl}')` }} />
              )}
            </div>
          </div>
        ) : null}
      </FormSection>

      <div className="admin-form-foot">
        <button type="submit" className="admin-btn" disabled={busy}>
          {busy ? 'Saving…' : 'Save event'}
        </button>
      </div>
    </form>
  );
}

export default function EventsAdmin() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setEvents(await adminFetchEvents());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const editingEvent = useMemo(() => {
    if (editing === 'new') return { ...EMPTY_EVENT };
    if (!editing) return null;
    const found = events.find((e) => e.id === editing);
    if (!found) return null;
    return {
      ...EMPTY_EVENT,
      ...found,
      startDate: found.startDate ? String(found.startDate).slice(0, 10) : '',
      images: found.images?.length ? found.images : found.img ? [found.img] : [],
    };
  }, [editing, events]);

  const handleDelete = async (id, title) => {
    const entered = window.prompt(`Type the delete password to remove “${title}”`);
    if (entered == null) return;
    if (entered !== DELETE_PASSWORD) {
      window.alert('Incorrect delete password');
      return;
    }
    await adminDeleteEvent(id);
    if (editing === id) setEditing(null);
    await load();
  };

  if (editingEvent) {
    return (
      <EventForm
        initial={editingEvent}
        onCancel={() => setEditing(null)}
        onSaved={async () => {
          setEditing(null);
          await load();
        }}
      />
    );
  }

  return (
    <div className="admin-events">
      <div className="admin-section-head">
        <div>
          <h2>Events</h2>
          <p className="admin-hint">
            Live &amp; upcoming show on Experiences (newest first). Past events sort by latest date first.
          </p>
        </div>
        <button type="button" className="admin-btn" onClick={() => setEditing('new')}>
          New event
        </button>
      </div>

      {loading && <p className="admin-hint">Loading events…</p>}
      {!loading && events.length === 0 && <p className="admin-hint">No events yet. Create one.</p>}

      <div className="admin-list">
        {events.map((ev) => {
          const thumb = ev.img || ev.images?.[0] || '';
          return (
            <article
              key={ev.id}
              className={`admin-listing${ev.active === false ? ' admin-listing--inactive' : ''}`}
            >
              <span
                className="admin-listing-thumb"
                style={thumb ? { backgroundImage: `url('${thumb}')` } : undefined}
                role="img"
                aria-label={thumb ? `${ev.title} cover` : 'No image'}
              />
              <div className="admin-listing-info">
                <div className="admin-listing-title">
                  {ev.title}
                  {ev.active === false ? <span className="admin-tag">hidden</span> : null}
                </div>
                <div className="admin-listing-meta">
                  {ev.status} · {ev.dateLabel || [ev.month, ev.day].filter(Boolean).join(' ') || 'no date'}
                  {ev.place ? ` · ${ev.place}` : ''}
                </div>
              </div>
              <div className="admin-listing-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn--sm"
                  onClick={() => setEditing(ev.id)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--danger admin-btn--sm"
                  onClick={() => handleDelete(ev.id, ev.title)}
                >
                  Delete
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
