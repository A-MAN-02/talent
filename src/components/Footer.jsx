import { useState } from 'react';

// Mapped to the actual sections on the home page (only the ones worth a
// direct footer link — trust strip / problem / stats are supporting
// sections, not destinations).
const SITE_LINKS = [
  { label: 'Home', href: '#hero' },
  { label: 'How We Work', href: '#how-we-work' },
  { label: 'AI Advantage', href: '#ai-advantage' },
  { label: 'Expertise', href: '#expertise' },
  { label: 'Engagement Models', href: '#engagement' },
  { label: 'Why Bharyat', href: '#why-bharyat' },
  { label: 'Industries', href: '#industries' },
  { label: 'Contact', href: '#contact' },
];

function scrollToSection(e, href) {
  const el = document.querySelector(href);
  if (el) {
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function scrollToTop(e) {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export default function SiteFooter() {
  const year = new Date().getFullYear();
  const [copiedKey, setCopiedKey] = useState(null);

  const copyToClipboard = (e, value, key) => {
    e.preventDefault();
    navigator.clipboard?.writeText(value).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1600);
    });
  };

  return (
    <footer className="site-footer">
      <span className="site-footer__rail" aria-hidden="true" />

      <div className="site-footer__container">
        <div className="site-footer__top">
          {/* ---------- Column 1: Brand ---------- */}
          <div className="site-footer__brand">
            <a
              className="site-footer__wordmark"
              href="#hero"
              onClick={(e) => scrollToSection(e, '#hero')}
            >
              Bharyat <span>Talent Partners</span>
            </a>
            <p className="site-footer__sub">A Bharyat Advanced Systems Company</p>
            <p className="site-footer__tagline">Engineering-Led Search. AI-Accelerated Delivery.</p>
            <p className="site-footer__desc">
              Bharyat Talent Partners is the engineering-led, AI-accelerated staffing arm of Bharyat
              Advanced Systems, hiring RF, embedded, semiconductor, cloud and AI talent.
            </p>
            <div className="site-footer__status">
              <span className="site-footer__status-dot" aria-hidden="true" />
              Live across 5 engineering &amp; sourcing hubs
            </div>
          </div>

          {/* ---------- Column 2: Site ---------- */}
          <nav className="site-footer__nav" aria-label="Footer">
            <p className="site-footer__col-label">Site</p>
            <ul>
              {SITE_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} onClick={(e) => scrollToSection(e, link.href)}>
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* ---------- Column 3: Contact ---------- */}
          <div className="site-footer__contact">
            <p className="site-footer__col-label">Contact</p>
            <ul>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="8" />
                  <path d="M4.5 9.5h15M4.5 14.5h15" />
                  <path d="M12 4c2.6 2.2 2.6 13.8 0 16M12 4c-2.6 2.2-2.6 13.8 0 16" />
                </svg>
                <a href="https://www.bharyat.com/talent">www.Bharyat.com/talent</a>
              </li>
              <li className="site-footer__copyable">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3.5" y="6" width="17" height="12" rx="1.5" />
                  <path d="M4 7.5l8 6 8-6" />
                </svg>
                <a
                  href="mailto:talent@bharyat.com"
                  onClick={(e) => copyToClipboard(e, 'talent@bharyat.com', 'email')}
                >
                  talent@bharyat.com
                </a>
                <span className={`site-footer__copied ${copiedKey === 'email' ? 'is-visible' : ''}`}>
                  Copied
                </span>
              </li>
              <li className="site-footer__copyable">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6.3 3.5h2.9l1.4 3.8-1.9 1.5a12 12 0 0 0 5.5 5.5l1.5-1.9 3.8 1.4v2.9a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.7a2 2 0 0 1 1.8-2.2Z" />
                </svg>
                <a
                  href="tel:+918073170466"
                  onClick={(e) => copyToClipboard(e, '+918073170466', 'phone')}
                >
                  8073170466
                </a>
                <span className={`site-footer__copied ${copiedKey === 'phone' ? 'is-visible' : ''}`}>
                  Copied
                </span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z" />
                  <circle cx="12" cy="10" r="2.4" />
                </svg>
                <span>3rd &amp; 4th Floor, 80 Feet Main Rd, NGEF Layout, Nagarbhavi, Bengaluru, Karnataka 560072 &middot; HQ</span>
              </li>
            </ul>
            <p className="site-footer__offices">
              Bengaluru &middot; New Delhi &middot; Noida &middot; United States &middot; Germany
            </p>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>
            &copy; {year} Bharyat Talent Partners &mdash; A Bharyat Advanced Systems Company &mdash; Bengaluru,
            India
          </p>

          <button type="button" className="site-footer__top-btn" onClick={scrollToTop} aria-label="Back to top">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 19V5M6 11l6-6 6 6" />
            </svg>
            Back to top
          </button>
        </div>
      </div>

      <style>{`
        .site-footer {
          position: relative;
          overflow: hidden;
          background: #132a52;
          background: color-mix(in srgb, var(--color-navy-deep) 88%, white 12%);
          isolation: isolate;
        }

        .site-footer::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 42px 42px;
          -webkit-mask-image: linear-gradient(to bottom, transparent, black 10%, black 85%, transparent);
          mask-image: linear-gradient(to bottom, transparent, black 10%, black 85%, transparent);
          z-index: 0;
        }

        .site-footer__rail {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--color-gold) 20%, var(--color-gold) 80%, transparent);
          box-shadow: 0 0 14px 1px rgba(228, 184, 92, 0.35);
          opacity: 0.7;
          z-index: 1;
        }

        .site-footer__container {
          position: relative;
          z-index: 1;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 clamp(20px, 4vw, 56px);
        }

        /* ---------- Top: three columns ---------- */
        .site-footer__top {
          display: grid;
          grid-template-columns: 1.3fr 0.8fr 1fr;
          gap: 48px;
          padding: 56px 0 40px;
        }

        .site-footer__wordmark {
          display: inline-block;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 21px;
          letter-spacing: 0.2px;
          color: #ffffff;
          text-decoration: none;
          transition: opacity 0.2s ease;
        }

        .site-footer__wordmark:hover {
          opacity: 0.82;
        }

        .site-footer__wordmark span {
          font-weight: 400;
          color: rgba(255, 255, 255, 0.7);
        }

        .site-footer__sub {
          margin: 8px 0 0;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          color: var(--color-gold);
        }

        .site-footer__tagline {
          margin: 18px 0 0;
          max-width: 30ch;
          font-family: var(--font-display);
          font-size: 17px;
          line-height: 1.4;
          color: rgba(255, 255, 255, 0.92);
        }

        .site-footer__desc {
          margin: 14px 0 0;
          max-width: 40ch;
          font-family: var(--font-body);
          font-size: 13.5px;
          line-height: 1.65;
          color: rgba(255, 255, 255, 0.62);
        }

        .site-footer__status {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-top: 26px;
          padding: 8px 14px 8px 10px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 999px;
          font-family: var(--font-body);
          font-size: 12.5px;
          color: rgba(255, 255, 255, 0.7);
          transition: border-color 0.2s ease, background 0.2s ease;
        }

        .site-footer__status:hover {
          border-color: rgba(228, 184, 92, 0.5);
          background: rgba(228, 184, 92, 0.06);
        }

        .site-footer__status-dot {
          position: relative;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--color-gold);
          flex-shrink: 0;
        }

        .site-footer__status-dot::after {
          content: '';
          position: absolute;
          inset: -5px;
          border-radius: 50%;
          border: 1px solid var(--color-gold);
          opacity: 0.7;
          animation: footer-pulse 2.4s ease-out infinite;
        }

        @keyframes footer-pulse {
          0% { transform: scale(0.5); opacity: 0.6; }
          100% { transform: scale(2); opacity: 0; }
        }

        .site-footer__col-label {
          margin: 0 0 18px;
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-gold);
        }

        /* ---------- Nav column ---------- */
        .site-footer__nav ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .site-footer__nav a {
          position: relative;
          display: inline-flex;
          font-family: var(--font-body);
          font-size: 14.5px;
          color: rgba(255, 255, 255, 0.68);
          text-decoration: none;
          transition: color 0.2s ease, transform 0.2s ease;
        }

        .site-footer__nav a span {
          position: relative;
        }

        .site-footer__nav a span::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: -3px;
          height: 1px;
          background: var(--color-gold);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.25s ease;
        }

        .site-footer__nav a:hover,
        .site-footer__nav a:focus-visible {
          color: #ffffff;
          transform: translateX(4px);
        }

        .site-footer__nav a:hover span::after,
        .site-footer__nav a:focus-visible span::after {
          transform: scaleX(1);
        }

        /* ---------- Contact column ---------- */
        .site-footer__contact ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .site-footer__contact li {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 7px 10px;
          margin: 0 -10px;
          border-radius: 8px;
          font-family: var(--font-body);
          font-size: 14.5px;
          color: rgba(255, 255, 255, 0.68);
          transition: background 0.2s ease;
        }

        .site-footer__copyable:hover {
          background: rgba(255, 255, 255, 0.06);
        }

        .site-footer__contact svg {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          color: var(--color-gold);
        }

        .site-footer__contact a {
          color: inherit;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .site-footer__contact a:hover,
        .site-footer__contact a:focus-visible {
          color: #ffffff;
        }

        .site-footer__copied {
          margin-left: auto;
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.03em;
          color: var(--color-gold);
          opacity: 0;
          transform: translateY(2px);
          transition: opacity 0.2s ease, transform 0.2s ease;
          pointer-events: none;
        }

        .site-footer__copied.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .site-footer__offices {
          margin: 22px 0 0;
          padding-top: 18px;
          border-top: 1px solid rgba(255, 255, 255, 0.14);
          font-family: var(--font-body);
          font-size: 12.5px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.46);
        }

        a:focus-visible {
          outline: 2px solid var(--color-gold);
          outline-offset: 3px;
          border-radius: 2px;
        }

        /* ---------- Bottom bar ---------- */
        .site-footer__bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 14px;
          padding: 20px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.14);
        }

        .site-footer__bottom p {
          margin: 0;
          font-family: var(--font-body);
          font-size: 12.5px;
          color: rgba(255, 255, 255, 0.5);
        }

        .site-footer__top-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 14px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 999px;
          font-family: var(--font-body);
          font-size: 12.5px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.75);
          cursor: pointer;
          transition: border-color 0.2s ease, color 0.2s ease, transform 0.2s ease, background 0.2s ease;
        }

        .site-footer__top-btn svg {
          width: 13px;
          height: 13px;
          transition: transform 0.2s ease;
        }

        .site-footer__top-btn:hover,
        .site-footer__top-btn:focus-visible {
          color: #ffffff;
          border-color: var(--color-gold);
          background: rgba(228, 184, 92, 0.08);
          transform: translateY(-2px);
        }

        .site-footer__top-btn:hover svg {
          transform: translateY(-2px);
        }

        @media (prefers-reduced-motion: reduce) {
          .site-footer__status-dot::after {
            animation: none;
            display: none;
          }
          .site-footer__nav a,
          .site-footer__top-btn,
          .site-footer__top-btn svg {
            transition: none;
          }
        }

        /* ---------- Responsive ---------- */
        @media (max-width: 860px) {
          .site-footer__top {
            grid-template-columns: 1fr 1fr;
            gap: 40px 32px;
            padding: 56px 0 40px;
          }
          .site-footer__brand {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 560px) {
          .site-footer__top {
            grid-template-columns: 1fr;
            gap: 36px;
            padding: 48px 0 32px;
          }
          .site-footer__brand {
            grid-column: auto;
          }
          .site-footer__bottom {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </footer>
  );
}