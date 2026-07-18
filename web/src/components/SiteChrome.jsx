import { useEffect } from 'react';
import Cursor from './Cursor';
import Grain from './Grain';
import Nav from './Nav';
import Footer from './Footer';
import MobileBar from './MobileBar';
import useCustomCursor from '../hooks/useCustomCursor';
import useScrollNav from '../hooks/useScrollNav';
import '../styles/index.css';
import '../styles/hero-nav.css';
import '../styles/mobile.css';
import '../styles/site-pages.css';

/** Shared chrome for marketing pages (Partner, Stories, Shop, Contact). */
export default function SiteChrome({ children, title }) {
  useCustomCursor();
  useScrollNav(40);

  useEffect(() => {
    if (!title) return undefined;
    const prev = document.title;
    document.title = title;
    return () => { document.title = prev; };
  }, [title]);

  return (
    <div className="site-page">
      <Cursor />
      <Grain />
      <Nav />
      <main className="site-page-main">{children}</main>
      <Footer />
      <MobileBar />
    </div>
  );
}
