import { useCallback, useEffect, useState } from 'react';
import {
  adminEmailBooking,
  adminFetchBookings,
  adminRemindBooking,
  adminUpdateBooking,
} from '../lib/api';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'requested', label: 'Requests' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'rejected', label: 'Rejected' },
];

function money(n) {
  return `₹${Math.round(Number(n) || 0).toLocaleString('en-IN')}`;
}

function when(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function BookingsAdmin() {
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');
  const [data, setData] = useState({ bookings: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyId, setBusyId] = useState('');
  const [openMail, setOpenMail] = useState(null);
  const [mail, setMail] = useState({ subject: '', message: '' });
  const [notes, setNotes] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const next = await adminFetchBookings({ status, q: query.trim() });
      setData(next);
      setNotes((prev) => {
        const copy = { ...prev };
        (next.bookings || []).forEach((b) => {
          if (copy[b.id] === undefined) copy[b.id] = b.adminNote || '';
        });
        return copy;
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [status, query]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  async function act(id, payload, okText) {
    setBusyId(id);
    setError('');
    setNotice('');
    try {
      const updated = await adminUpdateBooking(id, payload);
      if (payload.status === 'completed') {
        if (updated.thankYou === 'sent') setNotice(`Stay marked complete. Thank-you email sent to ${updated.guest?.email}.`);
        else if (updated.thankYou === 'failed') setNotice('Stay marked complete. The thank-you email could not be sent.');
        else setNotice('Stay marked complete. This guest has no email, so the thank-you was not sent.');
      } else {
        setNotice(okText);
      }
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId('');
    }
  }

  async function remind(booking) {
    setBusyId(booking.id);
    setError('');
    setNotice('');
    try {
      await adminRemindBooking(booking.id);
      setNotice(`Reminder sent to ${booking.guest.email || 'the guest'}.`);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId('');
    }
  }

  async function sendMail(booking) {
    setBusyId(booking.id);
    setError('');
    setNotice('');
    try {
      await adminEmailBooking(booking.id, mail);
      setNotice(`Email sent to ${booking.guest.email}.`);
      setOpenMail(null);
      setMail({ subject: '', message: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId('');
    }
  }

  const summary = data.summary || {};
  const bookings = data.bookings || [];

  return (
    <section className="admin-card bk-desk">
      <h2>Manage bookings</h2>
      <p className="admin-hint" style={{ marginTop: 0 }}>
        Requests wait for you to approve or reject. Confirmed stays can be marked paid, reminded, or cancelled.
        Completing a stay emails the guest a thank-you and a link to leave a postcard.
        Stay reminders go out on their own 2 days, 1 day, and 12 hours before a 2pm check-in.
        Ezy coin expiry notes still go out separately — 3 days, 2 days, and on the day they expire.
      </p>

      <div className="bk-stats">
        <div><strong>{summary.requested || 0}</strong><span>Requests</span></div>
        <div><strong>{summary.confirmed || 0}</strong><span>Confirmed</span></div>
        <div><strong>{summary.arrivingToday || 0}</strong><span>Arriving today</span></div>
        <div><strong>{summary.inHouseGuests || 0}</strong><span>Guests in house</span></div>
        <div><strong>{summary.upcomingGuests || 0}</strong><span>Guests this week</span></div>
        <div><strong>{summary.unpaid || 0}</strong><span>Unpaid</span></div>
      </div>

      <div className="bk-toolbar">
        <div className="bk-filters" role="tablist">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`admin-tab${status === f.id ? ' is-on' : ''}`}
              onClick={() => setStatus(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          className="bk-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email, stay, reference"
        />
      </div>

      {error ? <p className="auth-error">{error}</p> : null}
      {notice ? <p className="admin-hint">{notice}</p> : null}
      {loading ? <p className="admin-hint">Loading bookings…</p> : null}
      {!loading && bookings.length === 0 ? <p className="admin-hint">No bookings in this view.</p> : null}

      <div className="bk-list">
        {bookings.map((b) => {
          const busy = busyId === b.id;
          return (
            <article key={b.id} className={`bk-card bk-card--${b.status}`}>
              <header className="bk-card-head">
                <div>
                  <p className="bk-ref">#{b.ref}</p>
                  <h3>{b.stayTitle}</h3>
                  <p className="bk-dates">{when(b.checkIn)} → {when(b.checkOut)} · {b.nights} {b.nights === 1 ? 'night' : 'nights'}</p>
                </div>
                <div className="bk-pills">
                  <span className={`bk-pill bk-pill--${b.status}`}>{b.status}</span>
                  <span className={`bk-pill bk-pill--${b.paymentStatus}`}>{b.paymentStatus}</span>
                  {b.arrivedAt ? <span className="bk-pill">arrived</span> : null}
                </div>
              </header>

              <div className="bk-grid">
                <div>
                  <p className="bk-kicker">Guest</p>
                  <p><strong>{b.guest.name || 'No name yet'}</strong></p>
                  <p>{b.guest.email || 'No email'}</p>
                  <p>{b.guest.mobile || 'No mobile'}</p>
                </div>
                <div>
                  <p className="bk-kicker">Stay</p>
                  <p>{b.bookingMode === 'room' ? `${b.rooms} room${b.rooms === 1 ? '' : 's'}` : 'Entire property'}</p>
                  <p>{b.adults || b.guests} {(b.adults || b.guests) === 1 ? 'adult' : 'adults'}{b.children ? ` · ${b.children} ${b.children === 1 ? 'child' : 'children'}` : ''}</p>
                  <p>{b.extraMattress ? 'Extra mattress' : 'No extra mattress'}</p>
                </div>
                <div>
                  <p className="bk-kicker">Money</p>
                  <p><strong>{money(b.amountPayable)}</strong> payable</p>
                  <p>{money(b.pricePerNight)} / night · coins used {b.coinsRedeemed || 0}</p>
                  <p>{b.rewardGranted ? `+${b.coinsEarned} coins granted` : b.status === 'requested' ? 'Coins reward after approval' : 'No coin reward on this stay'}</p>
                </div>
              </div>

              <label className="bk-note">
                <span>Host note (only you see this)</span>
                <textarea
                  rows={2}
                  value={notes[b.id] ?? ''}
                  onChange={(e) => setNotes((n) => ({ ...n, [b.id]: e.target.value }))}
                />
              </label>

              <div className="bk-actions">
                <button type="button" className="admin-btn admin-btn--sm" disabled={busy} onClick={() => act(b.id, { adminNote: notes[b.id] || '' }, 'Note saved.')}>
                  Save note
                </button>
                {b.paymentStatus !== 'paid' ? (
                  <button type="button" className="admin-btn admin-btn--sm" disabled={busy} onClick={() => act(b.id, { paymentStatus: 'paid' }, 'Marked paid.')}>
                    Mark paid
                  </button>
                ) : (
                  <button type="button" className="admin-btn admin-btn--sm" disabled={busy} onClick={() => act(b.id, { paymentStatus: 'unpaid' }, 'Marked unpaid.')}>
                    Mark unpaid
                  </button>
                )}
                {b.status === 'requested' ? (
                  <>
                    <button type="button" className="admin-btn admin-btn--primary admin-btn--sm" disabled={busy} onClick={() => act(b.id, { status: 'confirmed' }, 'Approved and confirmation emailed.')}>
                      Approve
                    </button>
                    <button type="button" className="admin-btn admin-btn--danger admin-btn--sm" disabled={busy} onClick={() => act(b.id, { status: 'rejected', statusNote: notes[b.id] || '' }, 'Rejected. Redeemed coins were returned.')}>
                      Reject
                    </button>
                  </>
                ) : null}
                {b.status === 'confirmed' ? (
                  <>
                    <button type="button" className="admin-btn admin-btn--sm" disabled={busy} onClick={() => remind(b)}>
                      Send reminder
                    </button>
                    <button type="button" className="admin-btn admin-btn--sm" disabled={busy || b.arrivedAt} onClick={() => act(b.id, { arrived: true }, 'Marked as arrived.')}>
                      Mark arrived
                    </button>
                    <button type="button" className="admin-btn admin-btn--sm" disabled={busy} onClick={() => act(b.id, { status: 'completed' }, 'Stay marked complete.')}>
                      Complete
                    </button>
                    <button type="button" className="admin-btn admin-btn--danger admin-btn--sm" disabled={busy} onClick={() => act(b.id, { status: 'cancelled', statusNote: notes[b.id] || '' }, 'Cancelled and the guest was emailed.')}>
                      Cancel
                    </button>
                  </>
                ) : null}
                <button
                  type="button"
                  className="admin-btn admin-btn--sm"
                  disabled={busy || !b.guest.email}
                  onClick={() => {
                    setOpenMail(openMail === b.id ? null : b.id);
                    setMail({
                      subject: `About your stay at ${b.stayTitle}`,
                      message: `Hi ${b.guest.name || 'there'},\n\n`,
                    });
                  }}
                >
                  Email guest
                </button>
              </div>

              {openMail === b.id ? (
                <div className="bk-mail">
                  <input
                    value={mail.subject}
                    onChange={(e) => setMail((m) => ({ ...m, subject: e.target.value }))}
                    placeholder="Subject"
                  />
                  <textarea
                    rows={4}
                    value={mail.message}
                    onChange={(e) => setMail((m) => ({ ...m, message: e.target.value }))}
                    placeholder="Message to the guest"
                  />
                  <button type="button" className="admin-btn admin-btn--primary admin-btn--sm" disabled={busy} onClick={() => sendMail(b)}>
                    Send from bookings@
                  </button>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
