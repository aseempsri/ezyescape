/** Public paths that respect Vite base (GitHub Pages subpath). */
export function appPath(path = '') {
  const base = import.meta.env.BASE_URL || '/';
  const clean = String(path).replace(/^\//, '');
  if (!clean) return base;
  return `${base}${clean}`;
}

export function staysIndexPath() {
  return appPath('stays');
}

export function stayPath(slugOrId) {
  return appPath(`stays/${encodeURIComponent(slugOrId)}`);
}

export function partnerPath() {
  return appPath('partner');
}

/** @deprecated Prefer postcardsPath — kept for older links. */
export function storiesPath() {
  return postcardsPath();
}

export function postcardsPath() {
  return appPath('postcards');
}

export function postcardPath(id) {
  return appPath(`postcards/${encodeURIComponent(id)}`);
}

export function shopPath() {
  return appPath('shop');
}

export function contactPath() {
  return appPath('contact');
}

export function experiencesPath() {
  return appPath('experiences');
}

export function profilePath() {
  return appPath('profile');
}

/** Homepage section anchors that work from any route. */
export function homeSectionPath(sectionId) {
  return `${appPath()}#${sectionId}`;
}

export function goHome() {
  window.location.assign(appPath());
}

export function goStays() {
  window.location.assign(staysIndexPath());
}

export function goStay(slugOrId) {
  window.location.assign(stayPath(slugOrId));
}
