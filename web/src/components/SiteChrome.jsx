import Cursor from './Cursor';
import Grain from './Grain';
import Nav from './Nav';
import Footer from './Footer';
import MobileBar from './MobileBar';
import SeoHead from './SeoHead';
import useCustomCursor from '../hooks/useCustomCursor';
import useScrollNav from '../hooks/useScrollNav';
import '../styles/index.css';
import '../styles/hero-nav.css';
import '../styles/site-pages.css';
import '../styles/site-pages-light.css'; // light happy theme — remove this import to reverse
import '../styles/mobile.css'; // last so mobile footer/layout wins on all site pages

/** Shared chrome for marketing pages (Partner, Stories, Shop, Contact). */
export default function SiteChrome({
  children,
  title,
  description,
  path,
  image,
  noindex = false,
  jsonLd,
}) {
  useCustomCursor();
  useScrollNav(40);

  return (
    <div className="site-page">
      <SeoHead
        title={title}
        description={description}
        path={path}
        image={image}
        noindex={noindex}
        jsonLd={jsonLd}
      />
      <Cursor />
      <Grain />
      <Nav />
      <main className="site-page-main">{children}</main>
      <Footer />
      <MobileBar />
    </div>
  );
}
