import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import WalletModal from './WalletModal';

export default function MobileBar() {
  const { user, openAuth, openProfile } = useAuth();
  const [show, setShow] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > window.innerHeight * 0.45);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div className={`mobile-bar${show ? ' show' : ''}`} aria-hidden={!show}>
        {user ? (
          <button
            type="button"
            className="mobile-bar-coins"
            onClick={() => setWalletOpen(true)}
            aria-label={`${user.ezyCoins ?? 0} ezy coins`}
          >
            <span aria-hidden="true">◎</span>
            <strong>{user.ezyCoins ?? 0}</strong>
          </button>
        ) : (
          <button type="button" className="mobile-bar-signin" onClick={() => openAuth()}>
            Sign in
          </button>
        )}

        <a href="#quiz" className="mobile-bar-cta">
          Match My Stay <span aria-hidden="true">→</span>
        </a>

        {user && (
          <button
            type="button"
            className="mobile-bar-avatar"
            onClick={openProfile}
            aria-label="Open profile"
          >
            {user.avatar ? (
              <img src={user.avatar} alt="" />
            ) : (
              <span aria-hidden="true">{(user.name || user.email || '?').charAt(0).toUpperCase()}</span>
            )}
          </button>
        )}

        <a href="#" className="mobile-bar-wa" aria-label="WhatsApp us">💬</a>
      </div>
      {user && <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />}
    </>
  );
}
