/** Public paths that respect Vite base (GitHub Pages subpath). */
export function appPath(path = '') {
  const base = import.meta.env.BASE_URL || '/';
  const clean = String(path).replace(/^\//, '');
  if (!clean) return base;
  return `${base}${clean}`;
}

export function stayPath(slugOrId) {
  return appPath(`stays/${encodeURIComponent(slugOrId)}`);
}

export function goHome() {
  window.location.assign(appPath());
}

export function goStay(slugOrId) {
  window.location.assign(stayPath(slugOrId));
}
