import { useEffect, useMemo, useState } from 'react';
import { createBooking } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { policiesPath } from '../utils/paths';

const ADULTS_PER_ROOM = 2;
const CHILDREN_PER_ROOM = 1;
const MAX_REDEEM_PER_BOOKING = 100;

function tomorrowIso() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export default function BookingForm({ stay, onSuccess, onRequireLogin }) {
  const { user, refresh, openAuth } = useAuth();
  const requireLogin =
    onRequireLogin ||
    (() => openAuth(`Sign in to book ${stay?.title || 'this stay'} and use your ezy coins.`));
  const stayRooms = Math.max(1, Number(stay?.rooms) || 1);
  const [bookingMode, setBookingMode] = useState(stayRooms > 1 ? 'room' : 'entire');
  const [rooms, setRooms] = useState(1);
  const [nights, setNights] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [extraMattress, setExtraMattress] = useState(false);
  const [checkIn, setCheckIn] = useState(tomorrowIso());
  const [coinsToRedeem, setCoinsToRedeem] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const roomsBooked =
    bookingMode === 'room'
      ? Math.min(stayRooms, Math.max(1, Number(rooms) || 1))
      : stayRooms;
  const maxAdults = ADULTS_PER_ROOM * roomsBooked;
  const maxChildren = CHILDREN_PER_ROOM * roomsBooked;

  useEffect(() => {
    const maxRooms = Math.max(1, Number(stay?.rooms) || 1);
    setBookingMode(maxRooms > 1 ? 'room' : 'entire');
    setRooms(1);
    setNights(1);
    setAdults(2);
    setChildren(0);
    setExtraMattress(false);
    setCheckIn(tomorrowIso());
    setCoinsToRedeem(0);
    setError('');
  }, [stay]);

  useEffect(() => {
    setAdults((prev) => Math.min(Math.max(1, Number(prev) || 1), maxAdults));
    setChildren((prev) => Math.min(Math.max(0, Number(prev) || 0), maxChildren));
  }, [maxAdults, maxChildren]);

  const entirePerNight = stay?.price ?? 0;
  const perRoomRate = Math.max(1, Math.round(entirePerNight / stayRooms));
  const nightlyTotal = bookingMode === 'room' ? perRoomRate * roomsBooked : entirePerNight;

  const subtotal = useMemo(() => nightlyTotal * nights, [nightlyTotal, nights]);
  const maxRedeem = useMemo(
    () => Math.min(user?.ezyCoins ?? 0, subtotal, MAX_REDEEM_PER_BOOKING),
    [user, subtotal],
  );
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

    const numAdults = Math.min(maxAdults, Math.max(1, Number(adults) || 1));
    const numChildren = Math.min(maxChildren, Math.max(0, Number(children) || 0));

    setSubmitting(true);
    setError('');
    try {
      const result = await createBooking({
        stayId: stay.id,
        nights: Number(nights),
        adults: numAdults,
        children: numChildren,
        guests: numAdults + numChildren,
        checkIn,
        coinsToRedeem: Number(coinsToRedeem),
        bookingMode,
        rooms: roomsBooked,
        extraMattress: !!extraMattress,
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
        <button
          type="button"
          className="auth-btn auth-btn--google"
          onClick={() => {
            if (!window.location.hash.includes('book')) {
              window.history.replaceState(
                {},
                '',
                `${window.location.pathname}${window.location.search}#book`
              );
            }
            requireLogin();
          }}
        >
          Sign in to book
        </button>
      </div>
    );
  }

  const priceLine =
    bookingMode === 'room'
      ? `₹${perRoomRate}/room × ${roomsBooked} × ${nights} night${nights > 1 ? 's' : ''}`
      : `₹${entirePerNight}/night × ${nights} night${nights > 1 ? 's' : ''}`;

  const guestCapLine =
    roomsBooked === 1
      ? 'Max Adults: 2 + 1 Child per room'
      : `Max Adults: ${maxAdults} + ${maxChildren} Child${maxChildren === 1 ? '' : 'ren'} (${ADULTS_PER_ROOM} + ${CHILDREN_PER_ROOM} child / room)`;

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <div className="booking-mode" role="group" aria-label="Booking type">
        <button
          type="button"
          className={`booking-mode-btn${bookingMode === 'room' ? ' is-on' : ''}`}
          onClick={() => setBookingMode('room')}
        >
          Book by room
        </button>
        <button
          type="button"
          className={`booking-mode-btn${bookingMode === 'entire' ? ' is-on' : ''}`}
          onClick={() => setBookingMode('entire')}
        >
          Book entire property
        </button>
      </div>

      <p className="booking-guest-cap">{guestCapLine}</p>
      <p className="booking-guest-cap booking-guest-cap--sub">Max Guests: 2 adults per room</p>

      <div className={`booking-field-row${bookingMode === 'room' ? ' booking-field-row--4' : ''}`}>
        <label className="booking-field">
          <span>Check-in</span>
          <input
            type="date"
            value={checkIn}
            min={tomorrowIso()}
            onChange={(e) => setCheckIn(e.target.value)}
            required
          />
        </label>
        {bookingMode === 'room' ? (
          <label className="booking-field">
            <span>Rooms</span>
            <input
              type="number"
              min={1}
              max={stayRooms}
              value={rooms}
              onChange={(e) => setRooms(e.target.value)}
              required
            />
          </label>
        ) : null}
        <label className="booking-field">
          <span>Nights</span>
          <input
            type="number"
            min={1}
            max={14}
            value={nights}
            onChange={(e) => setNights(e.target.value)}
            required
          />
        </label>
      </div>

      <div className="booking-field-row booking-field-row--guests">
        <label className="booking-field">
          <span>Adults</span>
          <input
            type="number"
            min={1}
            max={maxAdults}
            value={adults}
            onChange={(e) => setAdults(e.target.value)}
            required
          />
        </label>
        <label className="booking-field">
          <span>Children</span>
          <input
            type="number"
            min={0}
            max={maxChildren}
            value={children}
            onChange={(e) => setChildren(e.target.value)}
          />
        </label>
      </div>

      <label className="booking-check">
        <input
          type="checkbox"
          checked={extraMattress}
          onChange={(e) => setExtraMattress(e.target.checked)}
        />
        <span>Request an extra mattress</span>
      </label>

      <div className="booking-summary">
        <div className="booking-rate-hint">
          {bookingMode === 'room' ? (
            <>
              <span>
                ₹{perRoomRate}
                <em>/room</em>
              </span>
              <span>
                ₹{nightlyTotal}
                <em>/night</em>
              </span>
            </>
          ) : (
            <>
              <span>
                ₹{entirePerNight}
                <em>/night</em>
              </span>
              {stayRooms > 1 ? <span>Entire home · {stayRooms} rooms</span> : null}
            </>
          )}
        </div>

        <div className="booking-line">
          <span>{priceLine}</span>
          <span>₹{subtotal}</span>
        </div>
        <div className="booking-line booking-line--meta">
          <span>
            {adults} adult{Number(adults) === 1 ? '' : 's'}
            {Number(children) > 0
              ? ` · ${children} child${Number(children) === 1 ? '' : 'ren'}`
              : ''}
            {extraMattress ? ' · extra mattress' : ''}
          </span>
        </div>

        {user.ezyCoins > 0 && (
          <div className="booking-redeem">
            <div className="booking-redeem-head">
              <span>Redeem ezy coins</span>
              <span className="booking-coin-balance">
                {user.ezyCoins} available · max {MAX_REDEEM_PER_BOOKING}/booking
              </span>
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
        <p className="booking-reward-hint">
          You&apos;ll earn <strong>+500 ezy coins</strong> when the host confirms.
        </p>
        <p className="booking-legal-note">
          By requesting this stay you agree to the{' '}
          <a href={policiesPath('terms')}>terms</a>, the{' '}
          <a href={policiesPath('privacy')}>privacy policy</a>, and the host&apos;s right of admission.
        </p>
      </div>

      {error && <p className="booking-error">{error}</p>}

      <button type="submit" className="btn btn-amber booking-submit" disabled={submitting}>
        {submitting ? 'Sending request…' : `Request stay · ₹${amountPayable}`}
      </button>
    </form>
  );
}
