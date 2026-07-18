import { useEffect, useMemo, useState } from 'react';
import SiteChrome from './SiteChrome';
import { useAuth } from '../context/AuthContext';
import { fetchBookings, fetchWallet } from '../lib/api';
import { homeSectionPath, stayPath, staysIndexPath } from '../utils/paths';
import '../styles/profile-page.css';

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatReason(reason) {
  const map = {
    welcome_bonus: 'Welcome bonus',
    booking_reward: 'Booking reward',
    booking_redemption: 'Redeemed on booking',
    expiry: 'Coins expired',
  };
  return map[reason] || reason;
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function isCurrentBooking(b) {
  if (b.status === 'cancelled') return false;
  const out = new Date(b.checkOut);
  return !Number.isNaN(out.getTime()) && out >= startOfToday();
}

function BookingCard({ booking }) {
  const stayHref = booking.stayId ? stayPath(booking.stayId) : staysIndexPath();
  const cancelled = booking.status === 'cancelled';

  return (
    <article className={`pf-booking${cancelled ? ' pf-booking--cancelled' : ''}`}>
      <div className="pf-booking-top">
        <div>
          <p className="pf-booking-status">
            {cancelled ? 'Cancelled' : isCurrentBooking(booking) ? 'Upcoming / current' : 'Completed'}
          </p>
          <h3>{booking.stayTitle || 'Homestay'}</h3>
        </div>
        <a href={stayHref} className="pf-booking-link">View stay →</a>
      </div>
      <div className="pf-booking-meta">
        <div>
          <span>Check-in</span>
          <strong>{formatDate(booking.checkIn)}</strong>
        </div>
        <div>
          <span>Check-out</span>
          <strong>{formatDate(booking.checkOut)}</strong>
        </div>
        <div>
          <span>Guests</span>
          <strong>{booking.guests}</strong>
        </div>
        <div>
          <span>Nights</span>
          <strong>{booking.nights}</strong>
        </div>
      </div>
      <div className="pf-booking-foot">
        <div>
          <span>Paid</span>
          <strong>₹{Number(booking.amountPayable || 0).toLocaleString('en-IN')}</strong>
          {booking.coinsRedeemed > 0 && (
            <em> · −{booking.coinsRedeemed} coins</em>
          )}
        </div>
        {booking.coinsEarned > 0 && (
          <div className="pf-booking-earn">+{booking.coinsEarned} coins earned</div>
        )}
      </div>
    </article>
  );
}

export default function ProfilePage() {
  const { user, loading: authLoading, openAuth, updateProfile, signOut, refresh } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name || '');
    setMobile(user.mobile || '');
  }, [user]);

  useEffect(() => {
    if (!user) {
      setWallet(null);
      setBookings([]);
      return undefined;
    }
    let active = true;
    setDataLoading(true);
    Promise.all([fetchWallet(), fetchBookings()])
      .then(([w, b]) => {
        if (!active) return;
        setWallet(w);
        setBookings(Array.isArray(b) ? b : []);
      })
      .catch(() => {
        if (!active) return;
        setWallet(null);
        setBookings([]);
      })
      .finally(() => {
        if (active) setDataLoading(false);
      });
    return () => { active = false; };
  }, [user?.id]);

  const { current, historic } = useMemo(() => {
    const cur = [];
    const hist = [];
    bookings.forEach((b) => {
      if (isCurrentBooking(b)) cur.push(b);
      else hist.push(b);
    });
    cur.sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn));
    hist.sort((a, b) => new Date(b.checkOut) - new Date(a.checkOut));
    return { current: cur, historic: hist };
  }, [bookings]);

  async function handleSave(e) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter your name.');
      return;
    }
    if (mobile && mobile.length !== 10) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    if (!mobile) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    setBusy(true);
    setError('');
    setSaved(false);
    try {
      await updateProfile({ name: trimmedName, mobile });
      await refresh();
      setSaved(true);
    } catch (err) {
      setError(err.message || 'Could not save');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteChrome title="Your Profile — Ezy Escape">
      <div className="pf-page">
        <header className="pf-hero">
          <p className="sp-eyebrow">Account</p>
          <h1 className="sp-title">Your profile</h1>
          <p className="sp-lead">
            Details, ezy coins, and every stay you’ve booked with us — current and past.
          </p>
        </header>

        {authLoading && (
          <p className="pf-status">Loading your account…</p>
        )}

        {!authLoading && !user && (
          <section className="pf-card pf-signin">
            <h2>Sign in to view your profile</h2>
            <p>See your wallet, coin history, and bookings in one place.</p>
            <button type="button" className="btn btn-amber" onClick={() => openAuth('Sign in to open your profile')}>
              Sign in
            </button>
          </section>
        )}

        {!authLoading && user && (
          <div className="pf-layout">
            <section className="pf-card pf-identity">
              <div className="pf-identity-head">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="pf-avatar" />
                ) : (
                  <span className="pf-avatar pf-avatar--fallback" aria-hidden="true">
                    {(user.name || user.email || '?').charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="pf-identity-copy">
                  <h2>{user.name || 'Traveller'}</h2>
                  <p className="pf-email">{user.email}</p>
                  <p className="pf-meta-line">
                    <span>{user.authProvider === 'google' ? 'Google account' : 'Email account'}</span>
                    {user.emailVerified ? <span>Verified</span> : null}
                    {user.createdAt ? <span>Joined {formatDate(user.createdAt)}</span> : null}
                  </p>
                </div>
              </div>

              <form className="pf-form" onSubmit={handleSave}>
                <label>
                  <span>Name</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
                </label>
                <label>
                  <span>Mobile</span>
                  <input
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    inputMode="numeric"
                    placeholder="10-digit number"
                    autoComplete="tel"
                    required
                  />
                </label>
                {error && <p className="pf-error">{error}</p>}
                {saved && <p className="pf-ok">Profile saved.</p>}
                <div className="pf-form-actions">
                  <button type="submit" className="btn btn-amber" disabled={busy}>
                    {busy ? 'Saving…' : 'Save details'}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={signOut}>
                    Sign out
                  </button>
                </div>
              </form>
            </section>

            <section className="pf-card pf-wallet">
              <div className="pf-wallet-head">
                <div>
                  <p className="sp-eyebrow">Wallet</p>
                  <h2>Ezy coins</h2>
                </div>
                <div className="pf-balance">
                  <strong>{wallet?.ezyCoins ?? user.ezyCoins ?? 0}</strong>
                  <span>coins · ₹1 each</span>
                </div>
              </div>

              {wallet?.nextExpiry && (
                <p className="pf-expiry">
                  <strong>{wallet.nextExpiry.amount}</strong> coins expire on {formatDate(wallet.nextExpiry.expiresAt)}
                </p>
              )}

              <div className="pf-rules">
                <div>+{wallet?.rules?.welcomeBonus ?? 500} welcome bonus</div>
                <div>+{wallet?.rules?.bookingReward ?? 500} per booking</div>
                <div>Redeem on your next stay</div>
                <div>Expire 30 days after earning</div>
              </div>

              <div className="pf-tx">
                <h3>Recent activity</h3>
                {dataLoading && <p className="pf-muted">Loading wallet…</p>}
                {!dataLoading && (!wallet?.transactions || wallet.transactions.length === 0) && (
                  <p className="pf-muted">No transactions yet. Book a stay to earn coins.</p>
                )}
                {wallet?.transactions?.map((tx) => (
                  <div key={tx._id} className="pf-tx-row">
                    <div>
                      <strong>{formatReason(tx.reason)}</strong>
                      <span>{formatDateTime(tx.createdAt)}</span>
                    </div>
                    <em className={tx.type === 'credit' ? 'is-credit' : 'is-debit'}>
                      {tx.type === 'credit' ? '+' : '−'}{tx.amount}
                    </em>
                  </div>
                ))}
              </div>
            </section>

            <section className="pf-bookings">
              <div className="pf-bookings-block">
                <div className="pf-section-head">
                  <p className="sp-eyebrow">Current</p>
                  <h2>Upcoming &amp; ongoing stays</h2>
                </div>
                {dataLoading && <p className="pf-muted">Loading bookings…</p>}
                {!dataLoading && current.length === 0 && (
                  <div className="pf-empty">
                    <p>No current bookings.</p>
                    <a href={staysIndexPath()} className="btn btn-ghost">Browse homestays →</a>
                    <a href={homeSectionPath('quiz')} className="btn btn-ghost">Match my stay →</a>
                  </div>
                )}
                <div className="pf-booking-list">
                  {current.map((b) => (
                    <BookingCard key={b._id} booking={b} />
                  ))}
                </div>
              </div>

              <div className="pf-bookings-block">
                <div className="pf-section-head">
                  <p className="sp-eyebrow">History</p>
                  <h2>Past bookings</h2>
                </div>
                {!dataLoading && historic.length === 0 && (
                  <p className="pf-muted">Completed and cancelled stays will show up here.</p>
                )}
                <div className="pf-booking-list">
                  {historic.map((b) => (
                    <BookingCard key={b._id} booking={b} />
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </SiteChrome>
  );
}
