import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  authStatus,
  fetchMe,
  googleSignInUrl,
  logout,
  loginRequest,
  signupRequest,
  verifyOtpRequest,
  resendOtpRequest,
  updateProfileRequest,
} from '../lib/api';
import AuthModal from '../components/AuthModal';
import ProfileModal from '../components/ProfileModal';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [oauthEnabled, setOauthEnabled] = useState(false);
  const [welcomeToast, setWelcomeToast] = useState(null);

  const [authOpen, setAuthOpen] = useState(false);
  const [authReason, setAuthReason] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const mobilePromptedRef = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const me = await fetchMe();
      setUser(me);
      return me;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function init() {
      try {
        const status = await authStatus().catch(() => ({ googleOAuth: false }));
        if (!active) return;
        setOauthEnabled(Boolean(status.googleOAuth));
        await refresh();
      } finally {
        if (active) setLoading(false);
      }
    }

    init();
    return () => { active = false; };
  }, [refresh]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authResult = params.get('auth');
    const welcome = params.get('welcome');
    if (authResult === 'success' || authResult === 'failed') {
      params.delete('auth');
      params.delete('welcome');
      const next = `${window.location.pathname}${params.toString() ? `?${params}` : ''}${window.location.hash}`;
      window.history.replaceState({}, '', next);
      if (authResult === 'success') {
        refresh().then(() => {
          if (welcome) setWelcomeToast(Number(welcome) || 500);
        });
      }
    }
  }, [refresh]);

  const openAuth = useCallback((reason = '') => {
    setAuthReason(reason);
    setAuthOpen(true);
  }, []);
  const closeAuth = useCallback(() => setAuthOpen(false), []);
  const openProfile = useCallback(() => setProfileOpen(true), []);
  const closeProfile = useCallback(() => setProfileOpen(false), []);

  const applyAuthResult = useCallback((data) => {
    if (data?.user) {
      setUser(data.user);
      setAuthOpen(false);
      if (data.welcome) setWelcomeToast(Number(data.welcome) || 500);
    }
    return data;
  }, []);

  const signup = useCallback(async (payload) => applyAuthResult(await signupRequest(payload)), [applyAuthResult]);
  const login = useCallback(async (payload) => applyAuthResult(await loginRequest(payload)), [applyAuthResult]);
  const verifyOtp = useCallback(async (payload) => applyAuthResult(await verifyOtpRequest(payload)), [applyAuthResult]);
  const resendOtp = useCallback((email) => resendOtpRequest(email), []);

  const updateProfile = useCallback(async (payload) => {
    const updated = await updateProfileRequest(payload);
    setUser(updated);
    return updated;
  }, []);

  const signIn = useCallback(() => {
    window.location.href = googleSignInUrl();
  }, []);

  const signOut = useCallback(async () => {
    await logout();
    setUser(null);
    mobilePromptedRef.current = false;
  }, []);

  // Nudge users who signed in without a mobile number (e.g. via Google) to add
  // one — but only once per session so it isn't annoying.
  useEffect(() => {
    if (loading || !user || user.mobile || mobilePromptedRef.current) return;
    mobilePromptedRef.current = true;
    setProfileOpen(true);
  }, [loading, user]);

  const value = useMemo(
    () => ({
      user,
      loading,
      oauthEnabled,
      signIn,
      signOut,
      refresh,
      signup,
      login,
      verifyOtp,
      resendOtp,
      updateProfile,
      openAuth,
      closeAuth,
      openProfile,
      closeProfile,
      welcomeToast,
      dismissWelcome: () => setWelcomeToast(null),
    }),
    [user, loading, oauthEnabled, signIn, signOut, refresh, signup, login, verifyOtp, resendOtp, updateProfile, openAuth, closeAuth, openProfile, closeProfile, welcomeToast]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal open={authOpen} onClose={closeAuth} reason={authReason} />
      <ProfileModal open={profileOpen} onClose={closeProfile} />
      {welcomeToast && (
        <div className="toast-overlay" onClick={() => setWelcomeToast(null)} role="presentation">
          <div className="toast welcome-toast" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setWelcomeToast(null)} aria-label="Close">×</button>
            <div className="toast-icon">◎</div>
            <h3>Welcome to Ezy Escape!</h3>
            <p>You received <strong>{welcomeToast} ezy coins</strong> in your wallet.</p>
            <p className="toast-sub">1 coin = ₹1 · Redeem on your next booking</p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
