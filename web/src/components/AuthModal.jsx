import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

function GoogleIcon() {
  return (
    <svg className="auth-google-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function EyeIcon({ off }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {off ? (
        <>
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19M6.61 6.61A18.5 18.5 0 0 0 2 12s3 8 10 8a9.12 9.12 0 0 0 5.39-1.61" />
          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
          <line x1="2" y1="2" x2="22" y2="22" />
        </>
      ) : (
        <>
          <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

function PasswordField({ value, onChange, autoComplete, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <label className="auth-field">
      <span>Password</span>
      <div className="auth-password-wrap">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required
        />
        <button
          type="button"
          className="auth-password-toggle"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          title={show ? 'Hide password' : 'Show password'}
        >
          <EyeIcon off={show} />
        </button>
      </div>
    </label>
  );
}

const EMPTY = { name: '', email: '', mobile: '', password: '' };

export default function AuthModal({ open, onClose, reason }) {
  const { signup, login, verifyOtp, resendOtp, signIn } = useAuth();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'otp'
  const [form, setForm] = useState(EMPTY);
  const [otp, setOtp] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef(null);

  useEffect(() => {
    if (open) {
      setMode('signin');
      setForm(EMPTY);
      setOtp('');
      setPendingEmail('');
      setError('');
      setInfo('');
      setBusy(false);
    }
  }, [open]);

  useEffect(() => () => clearInterval(cooldownRef.current), []);

  function startCooldown() {
    setCooldown(30);
    clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(cooldownRef.current); return 0; }
        return c - 1;
      });
    }, 1000);
  }

  if (!open) return null;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function goOtp(email, phone) {
    setPendingEmail(email);
    setMode('otp');
    setOtp('');
    const where = phone ? `your WhatsApp on +91 ${phone}` : 'your WhatsApp';
    setInfo(`We sent a 6-digit code to ${where}. Enter it below to confirm your account.`);
    startCooldown();
  }

  async function handleSignin(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await login({ email: form.email, password: form.password });
      if (res?.needsOtp) goOtp(res.email, form.mobile);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await signup(form);
      if (res?.needsOtp) goOtp(res.email, form.mobile);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await verifyOtp({ email: pendingEmail, otp });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;
    setError('');
    try {
      await resendOtp(pendingEmail);
      setInfo('A new code was sent to your WhatsApp.');
      startCooldown();
    } catch (err) {
      setError(err.message);
    }
  }

  const title = mode === 'signup' ? 'Create your account' : mode === 'otp' ? 'Verify your number' : 'Welcome back';

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal auth-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="auth-title">
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">×</button>
        <div className="login-modal-icon" aria-hidden="true">◎</div>
        <h2 id="auth-title">{title}</h2>

        {mode !== 'otp' && (
          <p className="auth-reason">{reason || 'Sign in to book your stay and use your ezy coins.'}</p>
        )}

        {mode !== 'otp' && (
          <>
            <button type="button" className="auth-btn auth-btn--google login-modal-btn" onClick={signIn}>
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>
            <div className="auth-divider"><span>or use your email</span></div>
          </>
        )}

        {mode !== 'otp' && (
          <div className="auth-tabs" role="tablist">
            <button type="button" role="tab" aria-selected={mode === 'signin'} className={`auth-tab${mode === 'signin' ? ' is-active' : ''}`} onClick={() => { setMode('signin'); setError(''); }}>Sign in</button>
            <button type="button" role="tab" aria-selected={mode === 'signup'} className={`auth-tab${mode === 'signup' ? ' is-active' : ''}`} onClick={() => { setMode('signup'); setError(''); }}>Sign up</button>
          </div>
        )}

        {info && <p className="auth-info">{info}</p>}
        {error && <p className="auth-error">{error}</p>}

        {mode === 'signin' && (
          <form className="auth-form" onSubmit={handleSignin}>
            <label className="auth-field">
              <span>Email</span>
              <input type="email" value={form.email} onChange={set('email')} autoComplete="email" placeholder="you@example.com" required />
            </label>
            <PasswordField value={form.password} onChange={set('password')} autoComplete="current-password" placeholder="••••••••" />
            <button type="submit" className="btn btn-amber auth-submit" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        )}

        {mode === 'signup' && (
          <form className="auth-form" onSubmit={handleSignup}>
            <label className="auth-field">
              <span>Full name</span>
              <input type="text" value={form.name} onChange={set('name')} autoComplete="name" placeholder="Your name" />
            </label>
            <label className="auth-field">
              <span>Email <em>(your official contact email)</em></span>
              <input type="email" value={form.email} onChange={set('email')} autoComplete="email" placeholder="you@example.com" required />
            </label>
            <label className="auth-field">
              <span>Mobile number</span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={form.mobile}
                onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                autoComplete="tel"
                placeholder="10-digit mobile number"
                required
              />
            </label>
            <PasswordField value={form.password} onChange={set('password')} autoComplete="new-password" placeholder="At least 6 characters" />
            <button type="submit" className="btn btn-amber auth-submit" disabled={busy}>
              {busy ? 'Creating…' : 'Create account'}
            </button>
            <p className="auth-hint">We&apos;ll send a one-time code to your WhatsApp to confirm your number.</p>
          </form>
        )}

        {mode === 'otp' && (
          <form className="auth-form" onSubmit={handleVerify}>
            <label className="auth-field">
              <span>Verification code</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="auth-otp-input"
                placeholder="••••••"
                autoFocus
                required
              />
            </label>
            <button type="submit" className="btn btn-amber auth-submit" disabled={busy || otp.length < 6}>
              {busy ? 'Verifying…' : 'Verify & continue'}
            </button>
            <div className="auth-otp-actions">
              <button type="button" className="auth-linkbtn" onClick={handleResend} disabled={cooldown > 0}>
                {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
              </button>
              <button type="button" className="auth-linkbtn" onClick={() => { setMode('signup'); setError(''); setInfo(''); }}>
                Use a different email
              </button>
            </div>
          </form>
        )}

        {mode === 'signin' && (
          <p className="login-modal-note">New here? <button type="button" className="auth-linkbtn" onClick={() => { setMode('signup'); setError(''); }}>Create an account</button> and get <strong>500 ezy coins</strong>.</p>
        )}
      </div>
    </div>
  );
}
