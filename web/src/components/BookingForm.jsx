import { useEffect, useMemo, useState } from 'react';
import { createBooking } from '../lib/api';
import { useAuth } from '../context/AuthContext';

function tomorrowIso() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export default function BookingForm({ stay, onSuccess, onRequireLogin }) {
  const { user, refresh, openAuth } = useAuth();
  const requireLogin = onRequireLogin || (() => openAuth(`Sign in to book ${stay?.title || 'this stay'} and use your ezy coins.`));
  const [nights, setNights] = useState(1);
  const [guests, setGuests] = useState(2);
  const [checkIn, setCheckIn] = useState(tomorrowIso());
  const [coinsToRedeem, setCoinsToRedeem] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setNights(1);
    setGuests(Math.min(stay?.guest ?? 2, 2));
    setCheckIn(tomorrowIso());
    setCoinsToRedeem(0);
    setError('');
  }, [stay]);

  const subtotal = useMemo(() => (stay?.price ?? 0) * nights, [stay, nights]);
  const maxRedeem = useMemo(() => Math.min(user?.ezyCoins ?? 0, subtotal), [user, subtotal]);
  const amountPayable = subtotal - coinsToRedeem;

  useEffect(() => {
    setCoinsToRedeem((prev) => Math.min(prev, maxRedeem));
  }, [maxRedeem]);

  if (!stay) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      requireLogin();
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const result = await createBooking({
        stayId: stay.id,
        nights: Number(nights),
        guests: Number(guests),
        checkIn,
        coinsToRedeem: Number(coinsToRedeem),
      });
      await refresh();
      onSuccess?.(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) {
    return (
      <div className="booking-signin-prompt">
        <p>Sign in to book this cottage and use your ezy coins.</p>
        <button type="button" className="auth-btn auth-btn--google" onClick={() => requireLogin()}>
          Sign in to book
        </button>
      </div>
    );
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <div className="booking-field-row">
        <label className="booking-field">
          <span>Check-in</span>
          <input type="date" value={checkIn} min={tomorrowIso()} onChange={(e) => setCheckIn(e.target.value)} required />
        </label>
        <label className="booking-field">
          <span>Nights</span>
          <input type="number" min={1} max={14} value={nights} onChange={(e) => setNights(e.target.value)} required />
        </label>
        <label className="booking-field">
          <span>Guests</span>
          <input type="number" min={1} max={stay.guest} value={guests} onChange={(e) => setGuests(e.target.value)} required />
        </label>
      </div>

      <div className="booking-summary">
        <div className="booking-line">
          <span>₹{stay.price} × {nights} night{nights > 1 ? 's' : ''}</span>
          <span>₹{subtotal}</span>
        </div>

        {user.ezyCoins > 0 && (
          <div className="booking-redeem">
            <div className="booking-redeem-head">
              <span>Redeem ezy coins</span>
              <span className="booking-coin-balance">{user.ezyCoins} available</span>
            </div>
            <input
              type="range"
              min={0}
              max={maxRedeem}
              value={coinsToRedeem}
              onChange={(e) => setCoinsToRedeem(Number(e.target.value))}
              disabled={maxRedeem === 0}
            />
            <div className="booking-redeem-value">
              Using <strong>{coinsToRedeem}</strong> coins (−₹{coinsToRedeem})
            </div>
          </div>
        )}

        <div className="booking-line booking-line--total">
          <span>Amount payable</span>
          <span>₹{amountPayable}</span>
        </div>
        <p className="booking-reward-hint">You&apos;ll earn <strong>+500 ezy coins</strong> after this booking.</p>
      </div>

      {error && <p className="booking-error">{error}</p>}

      <button type="submit" className="btn btn-amber booking-submit" disabled={submitting}>
        {submitting ? 'Confirming…' : `Confirm Booking · ₹${amountPayable}`}
      </button>
    </form>
  );
}
