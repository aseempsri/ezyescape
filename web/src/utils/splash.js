const SPLASH_KEY = 'ezyescape:splash-done';

export function hasSeenSplash() {
  try {
    return sessionStorage.getItem(SPLASH_KEY) === '1';
  } catch {
    return false;
  }
}

export function markSplashDone() {
  try {
    sessionStorage.setItem(SPLASH_KEY, '1');
  } catch {
    /* private mode / blocked storage */
  }
}
