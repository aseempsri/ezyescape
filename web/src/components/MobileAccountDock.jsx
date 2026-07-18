import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import WalletModal from './WalletModal';
import { profilePath } from '../utils/paths';

export default function MobileAccountDock() {
  const { user, loading, openAuth } = useAuth();
  const [walletOpen, setWalletOpen] = useState(false);

  if (loading) return null;

  return (
    <>
      <div className="mobile-account-dock" aria-label="Account">
        {user ? (
          <>
            <button
              type="button"
              className="mobile-account-coins"
              onClick={() => setWalletOpen(true)}
              aria-label={`${user.ezyCoins ?? 0} ezy coins`}
            >
              <span className="mobile-account-coins-icon" aria-hidden="true">◎</span>
              <span className="mobile-account-coins-num">{user.ezyCoins ?? 0}</span>
              <span className="mobile-account-coins-label">coins</span>
            </button>
            <a
              href={profilePath()}
              className="mobile-account-avatar"
              title="Your profile"
              aria-label="Open profile"
            >
              {user.avatar ? (
                <img src={user.avatar} alt="" />
              ) : (
                <span aria-hidden="true">{(user.name || user.email || '?').charAt(0).toUpperCase()}</span>
              )}
            </a>
          </>
        ) : (
          <button
            type="button"
            className="mobile-account-signin"
            onClick={() => openAuth()}
          >
            Sign in
          </button>
        )}
      </div>
      {user && <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />}
    </>
  );
}
