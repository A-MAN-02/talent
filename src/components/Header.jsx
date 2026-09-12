import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

// Points at sections that already exist on the single home page.
// Swap these back to routes once the standalone pages are built.
// "Home" is covered by the logo, "Contact" by the Start a Search button —
// no need to duplicate either here.
// Careers is a real route (`to`), not an in-page anchor (`href`) — it's its
// own page, so it navigates instead of scrolling. "AI Advantage" was
// dropped to make room for it (still covered inside How We Work).
const NAV_LINKS = [
  { to: '/careers', label: 'Careers' },
  { href: '#how-we-work', label: 'How We Work' },
  { href: '#expertise', label: 'Expertise' },
  { href: '#engagement', label: 'Engagement Models' },
  { href: '#why-bharyat', label: 'Why Bharyat' },
  { href: '#industries', label: 'Industries' },
];

// Header hides once you've scrolled past 100px and are moving down;
// reveals again the moment you scroll up.

// Scrolls to the section if it exists on the current page.
// Returns true/false so callers know whether it actually happened.
function scrollToSection(href) {
  const el = document.querySelector(href);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return true;
  }
  return false;
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);
  const tickingRef = useRef(false);
  const closeMenu = () => setIsOpen(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  // Single entry point for every in-page-anchor click (logo, nav links, CTA).
  // On the home page it just scrolls. On any other page, the section doesn't
  // exist yet — so navigate to home carrying the hash, and let the effect
  // below finish the scroll once the home page has mounted.
  const goToSection = (e, href) => {
    e.preventDefault();
    if (isHome) {
      scrollToSection(href);
    } else {
      // String form (not a { pathname, hash } object) — matches the exact
      // "/talent/#hero" shape the rest of the app produces, instead of
      // collapsing to "/talent#hero" which doesn't match the home route.
      navigate(`/${href}`);
    }
  };

  // Logo is just "go home" — the hero section is already what you see at
  // the top of the home page, so there's no need to carry a #hero hash
  // (which was causing the "/talent#hero" vs "/talent/" URL mismatch).
  const goHome = (e) => {
    e.preventDefault();
    if (isHome) {
      scrollToSection('#hero');
    } else {
      navigate('/');
    }
  };

  const handleNavClick = (e, href) => {
    goToSection(e, href);
    closeMenu();
  };

  // After navigating to "/" with a hash (from another page), the section
  // wasn't in the DOM at click time. Once we've landed on home and it has
  // rendered, scroll to it. Retries briefly in case sections mount async.
  useEffect(() => {
    if (!isHome || !location.hash) return;
    let attempts = 0;
    let raf;
    const tryScroll = () => {
      attempts += 1;
      const scrolled = scrollToSection(location.hash);
      if (!scrolled && attempts < 20) {
        raf = requestAnimationFrame(tryScroll);
      }
    };
    raf = requestAnimationFrame(tryScroll);
    return () => cancelAnimationFrame(raf);
  }, [isHome, location.hash]);

  useEffect(() => {
    // Plain window scroll — this page scrolls via the document/window itself
    // (no overflow wrapper), so we don't need the capture-on-document trick.
    // rAF-throttled so we read scrollY at most once per frame.
    lastScrollY.current = window.scrollY || 0;

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        const current = window.scrollY || 0;
        const previous = lastScrollY.current;
        const delta = current - previous;

        setIsScrolled(current > 8);

        // Ignore tiny jitters (e.g. iOS rubber-banding) so the header
        // doesn't flicker; only react once there's a real, deliberate scroll.
        if (Math.abs(delta) > 4) {
          if (current > 100 && delta > 0) {
            setIsHidden(true);
          } else if (delta < 0) {
            setIsHidden(false);
          }
          lastScrollY.current = current;
        }

        if (current <= 100) {
          setIsHidden(false);
        }

        tickingRef.current = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Don't hide the header while the mobile menu is open
  const hiddenClass = isHidden && !isOpen ? 'header--hidden' : '';

  return (
    <header className={`header ${isScrolled ? 'header--scrolled' : ''} ${hiddenClass}`}>
      <div className="header__container">
        {/* Div 1 — Logo */}
        <div className="header__logo">
          <a href="#hero" onClick={goHome}>
            <img src={logo} alt="Bharyat Talent Partners" />
          </a>
        </div>

        {/* Div 2 — Nav links (Careers routes to its own page; rest scroll to in-page sections) */}
        <nav className="header__nav">
          {NAV_LINKS.map((link) =>
            link.to ? (
              <Link key={link.to} to={link.to} className="header__link">
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="header__link"
                onClick={(e) => goToSection(e, link.href)}
              >
                {link.label}
              </a>
            )
          )}
        </nav>

        {/* Div 3 — CTA + mobile toggle */}
        <div className="header__actions">
          <a href="#contact" className="header__btn" onClick={(e) => goToSection(e, '#contact')}>
            Start a Search
          </a>

          <button
            className={`header__toggle ${isOpen ? 'header__toggle--active' : ''}`}
            onClick={() => setIsOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`header__mobile-menu ${isOpen ? 'header__mobile-menu--open' : ''}`}
        aria-hidden={!isOpen}
      >
        <div className="header__mobile-list">
          {NAV_LINKS.map((link) =>
            link.to ? (
              <Link key={link.to} to={link.to} className="header__link" onClick={closeMenu}>
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="header__link"
                onClick={(e) => handleNavClick(e, link.href)}
              >
                {link.label}
              </a>
            )
          )}
          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, '#contact')}
            className="header__mobile-btn"
          >
            Start a Search
          </a>
        </div>
      </div>

      {/* Backdrop behind the mobile menu */}
      {isOpen && <button className="header__backdrop" aria-label="Close menu" onClick={closeMenu} />}

      {/* All CSS for this component lives right here — edit freely */}
      <style>{`
        * { box-sizing: border-box; }

        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          width: 100%;
          height: 78px;
          background: linear-gradient(135deg, rgba(196, 232, 253, 0.85), rgba(166, 216, 247, 0.72));
          backdrop-filter: blur(14px) saturate(160%);
          -webkit-backdrop-filter: blur(14px) saturate(160%);
          border-bottom: 1px solid rgba(27, 75, 115, 0.16);
          transition: box-shadow 0.25s ease, background 0.25s ease, height 0.25s ease,
            transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
        }

        .header--scrolled {
          height: 68px;
          background: linear-gradient(135deg, rgba(210, 238, 253, 0.96), rgba(178, 222, 249, 0.92));
          box-shadow: 0 8px 24px -14px rgba(11, 30, 61, 0.35);
        }

        .header--hidden {
          transform: translateY(-100%);
        }

        .header__container {
          max-width: 1440px;
          width: 100%;
          height: 100%;
          margin: 0 auto;
          padding: 0 clamp(18px, 3vw, 48px) 0 clamp(8px, 1.4vw, 20px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        /* Div 1 — Logo */
        .header__logo {
          flex-shrink: 0;
          min-width: 0;
          margin-left: clamp(-14px, -1.2vw, -6px);
        }

        .header__logo img {
          height: clamp(42px, 4.2vw, 54px);
          width: auto;
          display: block;
          transition: transform 0.2s ease;
        }

        .header__logo:hover img {
          transform: scale(1.03);
        }

        /* Div 2 — Nav links */
        .header__nav {
          display: flex;
          align-items: center;
          gap: clamp(2px, 0.4vw, 6px);
          flex-wrap: nowrap;
          flex-shrink: 1;
          min-width: 0;
        }

        .header__link {
          position: relative;
          display: inline-block;
          font-size: 14.5px;
          font-weight: 500;
          letter-spacing: 0.01em;
          color: var(--color-navy-deep);
          padding: 8px 12px;
          border-radius: 999px;
          white-space: nowrap;
          text-decoration: none;
          cursor: pointer;
          transition: color 0.2s ease, background 0.2s ease;
        }

        .header__link:hover {
          color: var(--color-steel);
          background: rgba(27, 75, 115, 0.08);
        }

        /* Div 3 — CTA + mobile toggle */
        .header__actions {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-shrink: 0;
        }

        .header__btn {
          display: inline-flex;
          align-items: center;
          border: none;
          border-radius: 999px;
          color: #fff;
          font-size: 13.5px;
          font-weight: 600;
          letter-spacing: 0.01em;
          padding: 11px 22px;
          background: linear-gradient(135deg, var(--color-navy-deep), var(--color-steel));
          box-shadow: 0 4px 14px rgba(11, 30, 61, 0.25);
          white-space: nowrap;
          text-decoration: none;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }

        .header__btn:hover {
          background: linear-gradient(135deg, var(--color-steel), var(--color-navy-deep));
          box-shadow: 0 6px 20px rgba(11, 30, 61, 0.35);
          transform: translateY(-2px);
        }

        .header__toggle {
          display: none;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
          width: 32px;
          height: 32px;
          padding: 0;
          background: none;
          border: none;
          cursor: pointer;
          flex-shrink: 0;
        }

        .header__toggle span {
          display: block;
          height: 2px;
          width: 100%;
          background-color: var(--color-navy-deep);
          border-radius: 2px;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }

        .header__toggle--active span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }
        .header__toggle--active span:nth-child(2) {
          opacity: 0;
        }
        .header__toggle--active span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }

        /* Backdrop */
        .header__backdrop {
          position: fixed;
          inset: 78px 0 0 0;
          border: none;
          padding: 0;
          background: rgba(11, 30, 61, 0.35);
          z-index: 45;
          cursor: default;
          animation: headerFadeIn 0.2s ease;
        }

        @keyframes headerFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Mobile menu panel */
        .header__mobile-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          z-index: 46;
          max-height: 0;
          overflow: hidden;
          background-color: var(--color-surface);
          border-bottom: 1px solid var(--color-border);
          box-shadow: 0 16px 32px -18px rgba(11, 30, 61, 0.3);
          transition: max-height 0.32s ease;
        }

        .header__mobile-menu--open {
          max-height: 640px;
          overflow-y: auto;
        }

        .header__mobile-list {
          max-width: 1440px;
          margin: 0 auto;
          padding: 12px 20px 20px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .header__mobile-list .header__link {
          border-radius: 8px;
          padding: 13px 14px;
        }

        .header__mobile-btn {
          margin-top: 12px;
          text-align: center;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--color-navy-deep), var(--color-steel));
          color: #fff;
          padding: 14px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
        }

        @media (prefers-reduced-motion: reduce) {
          .header {
            transition: none;
          }
        }

        /* Single, reliable breakpoint — nav + CTA hide together, hamburger takes over.
           Raised so long nav labels never get squeezed into overflow first. */
        @media (max-width: 1260px) {
          .header__nav,
          .header__btn {
            display: none;
          }
          .header__toggle {
            display: flex;
          }
        }
      `}</style>
    </header>
  );
}