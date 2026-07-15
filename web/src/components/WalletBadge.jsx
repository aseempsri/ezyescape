import { useAuth } from '../context/AuthContext';

export default function WalletBadge({ onClick }) {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <button type="button" className="wallet-badge" onClick={onClick} aria-label="Open ezy wallet">
      <span className="wallet-badge-icon" aria-hidden="true">◎</span>
      <span className="wallet-badge-amount">{user.ezyCoins ?? 0}</span>
      <span className="wallet-badge-label">ezy coins</span>
    </button>
  );
}
