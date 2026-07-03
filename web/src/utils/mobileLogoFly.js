import assetUrl from './assetUrl';

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

let flyInProgress = false;

export function animateLogoToHero({ onStart, onComplete } = {}) {
  const done = typeof onComplete === 'function' ? onComplete : () => {};
  const start = typeof onStart === 'function' ? onStart : () => {};

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (!isMobile) {
    start();
    done();
    return;
  }

  if (flyInProgress) return;

  const loader = document.getElementById('loader');
  const loaderImg = loader?.querySelector('.loader-logo img');
  const heroLogo = document.querySelector('.hero-mobile-logo');
  const heroImg = heroLogo?.querySelector('img');
  const heroSection = document.getElementById('heroSection');

  if (!loader || !loaderImg || !heroLogo || !heroImg || !heroSection) {
    start();
    done();
    return;
  }

  const from = loaderImg.getBoundingClientRect();
  const to = heroImg.getBoundingClientRect();

  if (!from.width || !to.width) {
    start();
    done();
    return;
  }

  const scale = to.width / from.width;
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const heroRect = heroSection.getBoundingClientRect();
  const lockedTop = to.top - heroRect.top;

  flyInProgress = true;
  heroLogo.classList.add('hero-mobile-logo--flying');
  loaderImg.style.visibility = 'hidden';
  heroLogo.style.visibility = 'hidden';
  loader.classList.add('fly-exit');

  // Reveal hero content during the fly so layout is stable before the logo lands
  start();

  const fly = document.createElement('div');
  fly.className = 'logo-fly';
  const img = document.createElement('img');
  img.src = loaderImg.currentSrc || loaderImg.src || assetUrl('images/logo.png');
  img.alt = '';
  fly.appendChild(img);
  document.body.appendChild(fly);

  Object.assign(fly.style, {
    position: 'fixed',
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
    zIndex: '9999',
    pointerEvents: 'none',
    transformOrigin: 'center center',
    transition: `transform 0.95s ${EASE}, filter 0.95s ${EASE}`,
  });

  img.style.width = '100%';
  img.style.height = '100%';
  img.style.objectFit = 'contain';
  img.style.display = 'block';

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    flyInProgress = false;

    heroLogo.style.top = `${lockedTop}px`;
    heroLogo.style.visibility = '';
    heroLogo.style.opacity = '1';
    heroLogo.classList.remove('hero-mobile-logo--flying');
    heroLogo.classList.add('hero-mobile-logo--landed');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        fly.remove();
        done();
      });
    });
  };

  fly.addEventListener(
    'transitionend',
    (e) => {
      if (e.propertyName === 'transform') finish();
    },
    { once: true },
  );

  window.setTimeout(finish, 1100);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      fly.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
      fly.style.filter = 'drop-shadow(0 0 18px rgba(245, 166, 35, 0.4))';
      fly.classList.add('logo-fly--glow');
    });
  });
}
