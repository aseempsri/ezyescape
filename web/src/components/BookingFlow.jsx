import { useState } from 'react';
import ListingModal from './ListingModal';

export function BookingSuccessToast({ result, onClose }) {
  if (!result) return null;

  const { booking, wallet } = result;

  return (
    <div className="toast-overlay" onClick={onClose} role="presentation">
      <div className="toast booking-success-toast" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">×</button>
        <div className="toast-icon">✓</div>
        <h3>Booking confirmed!</h3>
        <p>{booking.stayTitle} · {booking.nights} night{booking.nights > 1 ? 's' : ''}</p>
        <div className="toast-stats">
          {wallet.coinsRedeemed > 0 && <span>Redeemed {wallet.coinsRedeemed} coins</span>}
          <span>Earned +{wallet.coinsEarned} coins</span>
          <span>Balance: {wallet.ezyCoins} coins</span>
        </div>
      </div>
    </div>
  );
}

export function useBookingFlow() {
  const [selectedStay, setSelectedStay] = useState(null);
  const [listingOpen, setListingOpen] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  function openListing(stay) {
    setSelectedStay(stay);
    setListingOpen(true);
  }

  function closeListing() {
    setListingOpen(false);
  }

  function onBookingSuccess(result) {
    setBookingResult(result);
    setListingOpen(false);
  }

  const modals = (
    <>
      <ListingModal
        stay={selectedStay}
        open={listingOpen}
        onClose={closeListing}
        onBookingSuccess={onBookingSuccess}
      />
      <BookingSuccessToast result={bookingResult} onClose={() => setBookingResult(null)} />
    </>
  );

  return { openListing, modals };
}
