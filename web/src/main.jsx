import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import AdminApp from './admin/AdminApp.jsx';
import StayDetailPage from './components/StayDetailPage.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

const rawPath = window.location.pathname.replace(/\/+$/, '') || '/';
// Strip Vite base (e.g. /ezyescape) so routes work on GitHub Pages too.
const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
const path = base && base !== '/' && rawPath.startsWith(base)
  ? rawPath.slice(base.length) || '/'
  : rawPath;

const isAdminRoute = path === '/admin' || path.endsWith('/admin');
const stayMatch = path.match(/^\/stays\/([^/]+)$/);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdminRoute ? (
      <AdminApp />
    ) : stayMatch ? (
      <AuthProvider>
        <StayDetailPage idOrSlug={decodeURIComponent(stayMatch[1])} />
      </AuthProvider>
    ) : (
      <AuthProvider>
        <App />
      </AuthProvider>
    )}
  </StrictMode>
);
