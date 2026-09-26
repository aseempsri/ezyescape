import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import AdminApp from './admin/AdminApp.jsx';
import StayDetailPage from './components/StayDetailPage.jsx';
import HomestaysPage from './components/HomestaysPage.jsx';
import PartnerPage from './components/PartnerPage.jsx';
import PostcardsPage from './components/PostcardsPage.jsx';
import ShopPage from './components/ShopPage.jsx';
import ContactPage from './components/ContactPage.jsx';
import ExperiencesPage from './components/ExperiencesPage.jsx';
import EventDetailPage from './components/EventDetailPage.jsx';
import ProfilePage from './components/ProfilePage.jsx';
import PoliciesPage from './components/PoliciesPage.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

const rawPath = window.location.pathname.replace(/\/+$/, '') || '/';
// Strip Vite base (e.g. /ezyescape) so routes work on GitHub Pages too.
const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
const path = base && base !== '/' && rawPath.startsWith(base)
  ? rawPath.slice(base.length) || '/'
  : rawPath;

const isAdminRoute = path === '/admin' || path.endsWith('/admin');
const isStaysIndex = path === '/stays';
const stayMatch = path.match(/^\/stays\/([^/]+)$/);
const isPartner = path === '/partner';
const postcardMatch = path.match(/^\/postcards\/([^/]+)$/) || path.match(/^\/stories\/([^/]+)$/);
const isPostcards = path === '/postcards' || path === '/stories';
const isShop = path === '/shop';
const isContact = path === '/contact';
const experienceMatch = path.match(/^\/experiences\/([^/]+)$/);
const isExperiences = path === '/experiences';
const isProfile = path === '/profile';
const isPolicies = path === '/policies' || path === '/terms' || path === '/privacy';
const policyFocus = path === '/terms' ? 'terms' : path === '/privacy' ? 'privacy' : '';

function wrap(node) {
  return <AuthProvider>{node}</AuthProvider>;
}

let page = <App />;
if (isAdminRoute) page = <AdminApp />;
else if (isStaysIndex) page = wrap(<HomestaysPage />);
else if (stayMatch) page = wrap(<StayDetailPage idOrSlug={decodeURIComponent(stayMatch[1])} />);
else if (isPartner) page = wrap(<PartnerPage />);
else if (postcardMatch) page = wrap(<PostcardsPage focusId={decodeURIComponent(postcardMatch[1])} />);
else if (isPostcards) page = wrap(<PostcardsPage />);
else if (isShop) page = wrap(<ShopPage />);
else if (isContact) page = wrap(<ContactPage />);
else if (experienceMatch) page = wrap(<EventDetailPage idOrSlug={decodeURIComponent(experienceMatch[1])} />);
else if (isExperiences) page = wrap(<ExperiencesPage />);
else if (isProfile) page = wrap(<ProfilePage />);
else if (isPolicies) page = wrap(<PoliciesPage focus={policyFocus} />);
else page = wrap(<App />);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {page}
  </StrictMode>
);
