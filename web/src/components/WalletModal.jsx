import { useEffect, useState } from 'react';
import { fetchWallet } from '../lib/api';
import { useAuth } from '../context/AuthContext';

function formatReason(reason) {
  const map = {
    welcome_bonus: 'Welcome bonus',
    booking_reward: 'Booking reward',
    booking_redemption: 'Redeemed on booking',
    expiry: 'Coins expired',
  };
  return map[reason] || reason;
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function WalletModal({ open, onClose }) {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    let active = true;
    setLoading(true);
    setWallet(null);
    fetchWallet()
      .then((data) => { if (active) setWallet(data); })
      .catch(() => { if (active) setWallet(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [open, user?.id]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal wallet-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="wallet-title">
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">×</button>

        <div className="wallet-modal-header">
          <div className="eyebrow">Your Wallet</div>
          <h2 id="wallet-title">Ezy Coins</h2>
          <p className="wallet-balance">
            <span className="wallet-balance-num">{wallet?.ezyCoins ?? user?.ezyCoins ?? 0}</span>
            <span className="wallet-balance-sub">coins · 1 coin = ₹1</span>
          </p>
          {wallet?.nextExpiry && (
            <p className="wallet-expiry-note">
              <strong>{wallet.nextExpiry.amount}</strong> coins expire on {formatDate(wallet.nextExpiry.expiresAt)}
            </p>
          )}
        </div>

        <div className="wallet-rules">
          <div className="wallet-rule">
            <strong>+500</strong> on first sign-in
          </div>
          <div className="wallet-rule">
            <strong>+500</strong> on every booking
          </div>
          <div className="wallet-rule">
            Redeem on your <strong>next booking</strong>
          </div>
          <div className="wallet-rule">
            Coins <strong>expire 30 days</strong> after earning
          </div>
        </div>

        <div className="wallet-history">
          <h3>Recent activity</h3>
          {loading && <p className="wallet-empty">Loading…</p>}
          {!loading && wallet?.transactions?.length === 0 && (
            <p className="wallet-empty">No transactions yet. Book a stay to earn more coins.</p>
          )}
          {!loading && !wallet && (
            <p className="wallet-empty">Could not load activity. Check that the server is running.</p>
          )}
          {!loading && wallet?.transactions?.map((tx) => (
            <div key={tx._id} className="wallet-tx">
              <div>
                <div className="wallet-tx-title">{formatReason(tx.reason)}</div>
                <div className="wallet-tx-date">{formatDate(tx.createdAt)}</div>
              </div>
              <div className={`wallet-tx-amount ${tx.type}`}>
                {tx.type === 'credit' ? '+' : '−'}{tx.amount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
