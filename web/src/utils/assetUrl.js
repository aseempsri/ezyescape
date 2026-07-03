/** Public asset path that respects Vite base (GitHub Pages subpath). */
export default function assetUrl(path) {
  const clean = path.replace(/^\//, '');
  return `${import.meta.env.BASE_URL}${clean}`;
}
