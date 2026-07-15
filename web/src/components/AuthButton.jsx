import { useAuth } from '../context/AuthContext';

export default function AuthButton({ compact = false }) {
  const { user, loading, openAuth, openProfile, signOut } = useAuth();

  if (loading) {
    return <span className="auth-btn auth-btn--ghost" aria-busy="true">…</span>;
  }

  if (user) {
    return (
      <div className={`auth-user${compact ? ' auth-user--compact' : ''}`}>
        <button type="button" className="auth-user-btn" onClick={openProfile} title="Edit profile">
          {user.avatar ? (
            <img src={user.avatar} alt="" className="auth-avatar" />
          ) : (
            <span className="auth-avatar auth-avatar--fallback" aria-hidden="true">
              {(user.name || user.email || '?').charAt(0).toUpperCase()}
            </span>
          )}
          {!compact && <span className="auth-name">{user.name || user.email}</span>}
        </button>
        <button type="button" className="auth-btn auth-btn--ghost" onClick={signOut}>
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button type="button" className="auth-btn auth-btn--google" onClick={() => openAuth()}>
      <span>Sign in</span>
    </button>
  );
}
