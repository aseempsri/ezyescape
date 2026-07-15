import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProfileModal({ open, onClose }) {
  const { user, updateProfile, signOut } = useAuth();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open && user) {
      setName(user.name || '');
      setMobile(user.mobile || '');
      setError('');
      setSaved(false);
      setBusy(false);
    }
  }, [open, user]);

  if (!open || !user) return null;

  function goHome() {
    onClose();
    const hero = document.getElementById('heroSection');
    if (hero) hero.scrollIntoView({ behavior: 'smooth' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Form-level validation — block the save and surface the problem.
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter your name.');
      return;
    }
    if (mobile.length !== 10) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      await updateProfile({ name: trimmedName, mobile });
      setSaved(true);
      window.setTimeout(goHome, 1600);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const needsMobile = !user.mobile;

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal auth-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="profile-title">
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">×</button>

        {saved ? (
          <div className="profile-success">
            <div className="profile-success-check" aria-hidden="true">✓</div>
            <h2 id="profile-title">Changes saved</h2>
            <p className="auth-reason">Your profile has been updated. Taking you back home…</p>
            <button type="button" className="btn btn-amber auth-submit" onClick={goHome}>
              Back to home
            </button>
          </div>
        ) : (
          <>
            <div className="login-modal-icon" aria-hidden="true">☺</div>
            <h2 id="profile-title">Your profile</h2>
            <p className="auth-reason">
              {needsMobile
                ? 'Add your mobile number so we can reach you about your bookings.'
                : 'Update your details any time.'}
            </p>

            {error && <p className="auth-error">{error}</p>}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <label className="auth-field">
                <span>Full name</span>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </label>
              <label className="auth-field">
                <span>Email <em>(official contact — not editable)</em></span>
                <input type="email" value={user.email} readOnly disabled />
              </label>
              <label className="auth-field">
                <span>Mobile number</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile number"
                />
              </label>
              <button type="submit" className="btn btn-amber auth-submit" disabled={busy}>
                {busy ? 'Saving…' : 'Save changes'}
              </button>
              <button
                type="button"
                className="auth-btn auth-btn--ghost profile-signout"
                onClick={async () => {
                  await signOut();
                  onClose();
                }}
              >
                Sign out
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
