import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getArticles, getMarketPulse } from '../../lib/api';

/**
 * Fallback content for the "AI in HR" insights strip — used only until
 * getArticles() resolves, or if it fails entirely (no backend yet, or it's
 * down). Once real articles come back, the two most recent ones replace
 * these below, so this section always shows real Insights-page content
 * instead of two disconnected made-up ones.
 *
 * Shape matches what the admin dashboard's Insights form saves:
 *   { id, tag, title, excerpt }
 * (no readTime anymore — dropped along with the field on the admin form).
 */
const FALLBACK_FEATURED = {
  id: 'ai-scored-shortlists',
  tag: 'Market Trends',
  title: 'Why AI-scored shortlists are changing how teams hire engineers',
  excerpt:
    'A look at how AI-assisted screening is compressing time-to-shortlist for RF, embedded and cloud roles — without losing signal on the candidates who actually matter.',
};

const FALLBACK_SECONDARY = {
  id: 'deep-tech-interview-questions',
  tag: 'Hiring Tips',
  title: 'What deep-tech candidates actually ask in interviews',
};

const STAT = {
  value: '3.2x',
  description: 'faster shortlisting reported by teams using AI-scored candidate ranking this quarter',
};

/* ============================================================
   DUMMY MARKET PULSE — DELETE ME
   ------------------------------------------------------------
   Stand-in trend cards for the scrolling strip, so it never looks
   empty while real pulse items are still being added from the admin
   dashboard. Real ones (from getMarketPulse()) are prepended ahead
   of these, same "real first, dummy after" pattern as the articles
   list and DUMMY_ARTICLES in Insights.jsx.

   To remove once there's enough real content: delete this block, and
   in the component below change
     const pulseSource = [...livePulse, ...DUMMY_PULSE];
   to
     const pulseSource = livePulse;
   ============================================================ */
const DUMMY_PULSE = [
  { field: 'AI', trend: 'up', note: 'Enterprise AI adoption accelerating' },
  { field: 'Consumer Electronics', trend: 'down', note: 'Cooling — hiring pace slower this quarter' },
  { field: 'RF & Wireless', trend: 'up', note: 'High demand — 5G/6G rollouts driving hiring' },
  { field: 'Semiconductor', trend: 'up', note: 'Rising — chip design talent stays scarce' },
];
/* ========================= END DUMMY MARKET PULSE ========================= */

function TrendIcon({ trend }) {
  if (trend === 'down') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 7 17 17M17 9v8H9" />
      </svg>
    );
  }
  if (trend === 'flat') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

// Small "new content" glyph for the latest-article pulse card — visually
// distinct from the up/down/flat trend icons so it reads as "fresh post",
// not a market-direction indicator.
function NewIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
    </svg>
  );
}

// Duplication for the seamless marquee loop now happens per-render inside
// the component (see pulseLoop below), since the source list is a mix of
// live data + DUMMY_PULSE and can't be a fixed top-level constant anymore.

function FeaturedArt() {
  // Matches the article subject: a candidate profile being scanned/ranked by AI.
  return (
    <svg viewBox="0 0 400 320" className="insights__art" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="insArtBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-navy-deep)" />
          <stop offset="100%" stopColor="var(--color-steel)" />
        </linearGradient>
      </defs>
      <rect width="400" height="320" fill="url(#insArtBg)" />
      <g opacity="0.35" stroke="#F8F5EF" strokeWidth="1">
        <path d="M0 60h400M0 120h400M0 180h400M0 240h400" />
        <path d="M80 0v320M200 0v320M320 0v320" />
      </g>
      <circle cx="200" cy="150" r="118" fill="none" stroke="#E4B85C" strokeOpacity="0.25" strokeWidth="1.4" />
      <circle cx="200" cy="150" r="82" fill="none" stroke="#E4B85C" strokeOpacity="0.35" strokeWidth="1.4" />
      {/* profile card being scanned */}
      <g transform="translate(150,96)">
        <rect x="0" y="0" width="100" height="128" rx="10" fill="rgba(248,245,239,0.08)" stroke="rgba(248,245,239,0.28)" strokeWidth="1.4" />
        <circle cx="50" cy="34" r="16" fill="rgba(248,245,239,0.5)" />
        <rect x="26" y="60" width="48" height="7" rx="3.5" fill="rgba(248,245,239,0.4)" />
        <rect x="18" y="76" width="64" height="6" rx="3" fill="rgba(248,245,239,0.24)" />
        <rect x="18" y="90" width="64" height="6" rx="3" fill="rgba(248,245,239,0.24)" />
        <rect x="18" y="104" width="40" height="6" rx="3" fill="rgba(248,245,239,0.24)" />
        <rect x="0" y="0" width="100" height="26" rx="10" fill="rgba(228,184,92,0.28)" />
      </g>
      {/* scan sweep */}
      <rect x="150" y="96" width="100" height="128" fill="url(#insArtScan)" opacity="0.55" />
      <linearGradient id="insArtScan" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#E4B85C" stopOpacity="0" />
        <stop offset="48%" stopColor="#E4B85C" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#E4B85C" stopOpacity="0" />
      </linearGradient>
      {/* match nodes */}
      <g fill="#8be9b8">
        <circle cx="120" cy="130" r="4" />
        <circle cx="284" cy="108" r="4" />
        <circle cx="292" cy="176" r="4" />
        <circle cx="108" cy="200" r="4" />
      </g>
      <g stroke="#8be9b8" strokeOpacity="0.5" strokeWidth="1.2" strokeDasharray="3 4">
        <path d="M120 130 150 140" />
        <path d="M284 108 250 118" />
        <path d="M292 176 250 168" />
        <path d="M108 200 150 190" />
      </g>
    </svg>
  );
}

function SecondaryArt() {
  // Matches the article subject: what candidates actually ask in an interview.
  return (
    <svg viewBox="0 0 300 150" className="insights__art" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="insArtBg2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-steel)" />
          <stop offset="100%" stopColor="var(--color-navy-deep)" />
        </linearGradient>
      </defs>
      <rect width="300" height="150" fill="url(#insArtBg2)" />
      <circle cx="255" cy="20" r="70" fill="rgba(228,184,92,0.14)" />
      {/* interviewer bubble */}
      <g transform="translate(36,34)">
        <rect x="0" y="0" width="118" height="52" rx="14" fill="rgba(248,245,239,0.94)" />
        <path d="M18 52 8 68 34 52Z" fill="rgba(248,245,239,0.94)" />
        <rect x="16" y="16" width="70" height="6" rx="3" fill="rgba(11,30,61,0.55)" />
        <rect x="16" y="30" width="46" height="6" rx="3" fill="rgba(11,30,61,0.3)" />
      </g>
      {/* candidate bubble */}
      <g transform="translate(150,70)">
        <rect x="0" y="0" width="112" height="46" rx="14" fill="rgba(228,184,92,0.95)" />
        <path d="M96 46 108 60 82 46Z" fill="rgba(228,184,92,0.95)" />
        <rect x="16" y="14" width="52" height="6" rx="3" fill="rgba(11,30,61,0.55)" />
        <rect x="16" y="27" width="72" height="6" rx="3" fill="rgba(11,30,61,0.4)" />
      </g>
      <text x="150" y="132" textAnchor="middle" fontSize="26" fill="rgba(248,245,239,0.14)" fontFamily="Georgia, serif">
        &ldquo;&nbsp;&nbsp;&rdquo;
      </text>
    </svg>
  );
}

export default function InsightsPreview() {
  const sectionRef = useRef(null);

  // Pulls from the same getArticles() the full Insights page uses, so this
  // preview always shows real Insights-page content instead of separate,
  // disconnected copy. Newest article -> featured slot, next -> secondary,
  // and the newest also gets a card in the "Market pulse" strip below.
  // Until this resolves (or if it fails / the backend isn't up yet), the
  // FALLBACK_* constants above are shown instead.
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getArticles()
      .then((data) => {
        if (cancelled) return;
        setArticles(data || []);
      })
      .catch(() => {
        // No backend yet, or it's down — articles stays [], fallbacks kick in below.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const featured = articles[0] || FALLBACK_FEATURED;
  const secondary = articles[1] || FALLBACK_SECONDARY;
  // Only flag a "new" pulse card when it's real backend data — not for the
  // static fallback, which isn't actually new.
  const latestArticle = articles[0] || null;

  // ---------- Market pulse strip ----------
  // Same "real first, dummy after" pattern as the articles list: whatever
  // getMarketPulse() returns goes first, DUMMY_PULSE fills the rest so the
  // strip never looks sparse while items are still being added.
  const [livePulse, setLivePulse] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getMarketPulse()
      .then((data) => {
        if (cancelled) return;
        setLivePulse(data || []);
      })
      .catch(() => {
        // No backend yet, or it's down — livePulse stays [], DUMMY_PULSE fills the strip.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // The live "latest article" card (if any) goes first, then real pulse
  // items from the backend, then the dummy ones — and the whole thing is
  // duplicated once for the marquee's seamless loop.
  const pulseSource = [...livePulse, ...DUMMY_PULSE];
  const pulseItems = latestArticle
    ? [{ isArticle: true, id: latestArticle.id, field: latestArticle.tag, note: latestArticle.title }, ...pulseSource]
    : pulseSource;
  const pulseLoop = [...pulseItems, ...pulseItems];

  // ---------- Subscribe modal ----------
  // Frontend-only for now — see the matching block in Insights.jsx for the
  // one spot to wire up a real POST /api/subscribers call later.
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState('idle'); // idle | submitting | success | error

  const openSubscribe = () => {
    setSubscribeStatus('idle');
    setSubscribeEmail('');
    setSubscribeOpen(true);
  };

  const closeSubscribe = () => setSubscribeOpen(false);

  const handleSubscribeSubmit = (e) => {
    e.preventDefault();
    setSubscribeStatus('submitting');
    // TODO: replace with the real call once the backend endpoint exists.
    setTimeout(() => setSubscribeStatus('success'), 500);
  };

  useEffect(() => {
    const els = sectionRef.current?.querySelectorAll('.insights__reveal') || [];
    if (!('IntersectionObserver' in window) || !els.length) {
      els.forEach((el) => el.classList.add('insights__reveal--show'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            setTimeout(() => el.classList.add('insights__reveal--show'), (i % 4) * 100);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section className="insights" id="insights" ref={sectionRef}>
      <div className="insights__container">
        <div className="insights__head insights__reveal">
          <div>
            <p className="insights__eyebrow">
              <span className="insights__eyebrow-dot" aria-hidden="true" />
              Thoughts &amp; Insights
            </p>
            <h2 className="insights__heading">What we&rsquo;re seeing in the market</h2>
          </div>

          <div className="insights__head-actions">
            <button type="button" className="insights__subscribe-btn" onClick={openSubscribe}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              Subscribe
            </button>

            <Link to="/insights" className="insights__cta">
              View all articles
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="insights__grid insights__reveal">
          {/* Featured article */}
          <div className="insights__featured-wrap">
            <span className="insights__featured-offset" aria-hidden="true" />
            <Link to={`/insights/${featured.id}`} className="insights__featured">
              <div className="insights__featured-media">
                <FeaturedArt />
              </div>
              <div className="insights__featured-scrim" aria-hidden="true" />
              <span className="insights__arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </span>
              <div className="insights__featured-content">
                <span className="insights__tag">{featured.tag}</span>
                <h3 className="insights__featured-title">{featured.title}</h3>
                <p className="insights__featured-excerpt">{featured.excerpt}</p>
                <p className="insights__meta">
                  {featured.readTime ? `${featured.tag} \u00b7 ${featured.readTime}` : featured.tag}
                </p>
              </div>
            </Link>
          </div>

          {/* Secondary column: small article + stat */}
          <div className="insights__side">
            <div className="insights__card-wrap">
              <span className="insights__card-offset" aria-hidden="true" />
              <Link to={`/insights/${secondary.id}`} className="insights__card">
                <div className="insights__card-media">
                  <SecondaryArt />
                </div>
                <span className="insights__arrow insights__arrow--light" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17 17 7M9 7h8v8" />
                  </svg>
                </span>
                <div className="insights__card-body">
                  <span className="insights__tag insights__tag--muted">{secondary.tag}</span>
                  <h3 className="insights__card-title">{secondary.title}</h3>
                  <p className="insights__meta">
                    {secondary.readTime ? `${secondary.tag} \u00b7 ${secondary.readTime}` : secondary.tag}
                  </p>
                </div>
              </Link>
            </div>

            <div className="insights__stat-wrap">
              <span className="insights__stat-offset" aria-hidden="true" />
              <div className="insights__stat">
                <span className="insights__stat-glow" aria-hidden="true" />
                <strong className="insights__stat-value">{STAT.value}</strong>
                <p className="insights__stat-desc">{STAT.description}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="insights__pulse insights__reveal">
          <p className="insights__pulse-label">
            <span className="insights__pulse-live">
              <span className="insights__pulse-live-dot" aria-hidden="true" />
              Live
            </span>
            Market pulse by field
          </p>

          <div className="insights__pulse-mask">
            <div className="insights__pulse-track">
              {pulseLoop.map((item, i) => {
                const cardContent = (
                  <>
                    <span
                      className={`insights__pulse-icon ${
                        item.isArticle ? 'insights__pulse-icon--new' : `insights__pulse-icon--${item.trend}`
                      }`}
                    >
                      {item.isArticle ? <NewIcon /> : <TrendIcon trend={item.trend} />}
                    </span>
                    <div className="insights__pulse-copy">
                      <span className="insights__pulse-field">{item.field}</span>
                      <span className="insights__pulse-note">{item.note}</span>
                    </div>
                  </>
                );

                return item.isArticle ? (
                  <Link
                    to={`/insights/${item.id}`}
                    className="insights__pulse-card insights__pulse-card--article"
                    key={`article-${item.id}-${i}`}
                  >
                    {cardContent}
                  </Link>
                ) : (
                  <div className="insights__pulse-card" key={`${item.field}-${i}`}>
                    {cardContent}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Subscribe modal ---------- */}
      {subscribeOpen && (
        <div className="insights__subscribe-backdrop" onClick={closeSubscribe}>
          <div
            className="insights__subscribe-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="insights-subscribe-heading"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="insights__subscribe-close" onClick={closeSubscribe} aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            {subscribeStatus === 'success' ? (
              <div className="insights__subscribe-success">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <h2>You&rsquo;re subscribed</h2>
                <p>We&rsquo;ll email {subscribeEmail} whenever a new insight goes up.</p>
                <button type="button" className="insights__subscribe-btn insights__subscribe-btn--modal" onClick={closeSubscribe}>
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubscribeSubmit}>
                <h2 id="insights-subscribe-heading" className="insights__subscribe-heading">
                  Get notified about new insights
                </h2>
                <p className="insights__subscribe-copy">
                  Drop your email and we&rsquo;ll ping you the moment a new article goes live &mdash; nothing else, no spam.
                </p>
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  className="insights__subscribe-input"
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  disabled={subscribeStatus === 'submitting'}
                />
                {subscribeStatus === 'error' && (
                  <p className="insights__subscribe-error">Something went wrong &mdash; please try again.</p>
                )}
                <button
                  type="submit"
                  className="insights__subscribe-btn insights__subscribe-btn--modal"
                  disabled={subscribeStatus === 'submitting'}
                >
                  {subscribeStatus === 'submitting' ? 'Submitting\u2026' : 'Notify me'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bruno+Ace&display=swap');

        .insights {
          position: relative;
          background: var(--color-bg);
          padding: clamp(40px, 6vw, 72px) 0;
        }

        .insights__container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 clamp(20px, 4vw, 56px);
        }

        /* ---------- Head ---------- */
        .insights__head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 32px;
          margin-bottom: 22px;
        }

        .insights__head-actions {
          display: flex;
          align-items: center;
          gap: 18px;
          flex-shrink: 0;
        }

        .insights__subscribe-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: none;
          border-radius: 999px;
          padding: 11px 20px;
          font-family: var(--font-body);
          font-size: 13.5px;
          font-weight: 700;
          letter-spacing: 0.01em;
          color: #fff;
          background: linear-gradient(135deg, #d84343, #b3271f);
          box-shadow: 0 4px 14px rgba(179, 39, 31, 0.35);
          cursor: pointer;
          white-space: nowrap;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .insights__subscribe-btn svg {
          width: 15px;
          height: 15px;
        }

        .insights__subscribe-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(179, 39, 31, 0.45);
        }

        .insights__subscribe-btn--modal {
          width: 100%;
          justify-content: center;
          margin-top: 18px;
        }

        .insights__subscribe-btn--modal:disabled {
          opacity: 0.7;
          cursor: default;
          transform: none;
        }

        /* ---------- Subscribe modal ---------- */
        .insights__subscribe-backdrop {
          position: fixed;
          inset: 0;
          z-index: 80;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(11, 30, 61, 0.45);
          backdrop-filter: blur(3px);
          animation: insightsFadeIn 0.18s ease;
        }

        .insights__subscribe-modal {
          position: relative;
          width: 100%;
          max-width: 420px;
          background: var(--color-surface);
          border-radius: 20px;
          padding: 32px 28px 28px;
          box-shadow: 0 24px 60px -20px rgba(11, 30, 61, 0.5);
        }

        .insights__subscribe-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 50%;
          background: rgba(11, 30, 61, 0.06);
          color: var(--color-text-muted);
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
        }

        .insights__subscribe-close svg {
          width: 15px;
          height: 15px;
        }

        .insights__subscribe-close:hover {
          background: rgba(11, 30, 61, 0.1);
          color: var(--color-navy-deep);
        }

        .insights__subscribe-heading {
          margin: 0 0 8px;
          font-family: var(--font-display);
          font-size: 21px;
          color: var(--color-navy-deep);
        }

        .insights__subscribe-copy {
          margin: 0 0 20px;
          font-family: var(--font-body);
          font-size: 14px;
          line-height: 1.6;
          color: var(--color-text-muted);
        }

        .insights__subscribe-input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid var(--color-border);
          background: rgba(240, 246, 252, 0.6);
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--color-text-main);
        }

        .insights__subscribe-input:focus {
          outline: none;
          border-color: rgba(179, 39, 31, 0.5);
        }

        .insights__subscribe-error {
          margin: 10px 0 0;
          font-family: var(--font-body);
          font-size: 13px;
          color: #b3271f;
        }

        .insights__subscribe-success {
          text-align: center;
        }

        .insights__subscribe-success svg {
          width: 40px;
          height: 40px;
          margin: 4px 0 12px;
          padding: 9px;
          border-radius: 50%;
          color: #1c8a54;
          background: rgba(47, 191, 113, 0.14);
        }

        .insights__subscribe-success h2 {
          margin: 0 0 8px;
          font-family: var(--font-display);
          font-size: 20px;
          color: var(--color-navy-deep);
        }

        .insights__subscribe-success p {
          margin: 0;
          font-family: var(--font-body);
          font-size: 14px;
          line-height: 1.6;
          color: var(--color-text-muted);
        }

        @keyframes insightsFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .insights__eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          margin: 0 0 14px;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 600;
          color: var(--color-gold);
        }

        .insights__eyebrow-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-gold);
          display: inline-block;
        }

        .insights__heading {
          margin: 0;
          font-family: 'Bruno Ace', var(--font-display);
          font-weight: 600;
          font-size: clamp(26px, 3.2vw, 36px);
          line-height: 1.24;
          color: var(--color-navy-deep);
          max-width: 20ch;
        }

        .insights__cta {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 700;
          color: var(--color-navy-deep);
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          padding: 12px 20px;
          border-radius: 999px;
          white-space: nowrap;
          transition: border-color 0.2s ease, background 0.2s ease, gap 0.2s ease;
        }

        .insights__cta svg {
          width: 16px;
          height: 16px;
          transition: transform 0.2s ease;
        }

        .insights__cta:hover {
          border-color: var(--color-gold);
          background: var(--color-bg);
          gap: 11px;
        }

        .insights__cta:hover svg {
          transform: translateX(2px);
        }

        /* ---------- Bento grid ---------- */
        .insights__grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }

        /* Featured card */
        .insights__featured-wrap {
          position: relative;
        }

        .insights__featured-offset {
          position: absolute;
          inset: 0;
          background: var(--color-gold-light);
          border-radius: 18px;
          transform: rotate(-1.6deg);
          transition: transform 0.25s ease;
          z-index: 0;
        }

        .insights__featured-wrap:hover .insights__featured-offset {
          transform: rotate(-2.4deg);
        }

        .insights__featured {
          position: relative;
          z-index: 1;
          display: block;
          height: 100%;
          min-height: 340px;
          border-radius: 18px;
          overflow: hidden;
          text-decoration: none;
          background: linear-gradient(150deg, var(--color-navy-deep), var(--color-steel));
          box-shadow: 0 16px 30px -20px rgba(11, 30, 61, 0.4);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .insights__featured-wrap:hover .insights__featured {
          transform: translateY(-4px);
          box-shadow: 0 22px 38px -20px rgba(11, 30, 61, 0.46);
        }

        .insights__featured-media {
          position: absolute;
          inset: 0;
        }

        .insights__art {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
          transition: transform 6s ease;
        }

        .insights__featured-wrap:hover .insights__art {
          transform: scale(1.05);
        }

        .insights__featured-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(0deg, rgba(11, 30, 61, 0.92) 0%, rgba(11, 30, 61, 0.45) 48%, rgba(11, 30, 61, 0.15) 100%);
        }

        .insights__arrow {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(228, 184, 92, 0.2);
          color: var(--color-gold-light);
          opacity: 0;
          transform: translate(-6px, 6px) scale(0.8);
          transition: opacity 0.22s ease, transform 0.22s ease;
          z-index: 1;
        }

        .insights__arrow svg {
          width: 15px;
          height: 15px;
        }

        .insights__arrow--light {
          background: rgba(11, 30, 61, 0.08);
          color: var(--color-navy-deep);
        }

        .insights__featured:hover .insights__arrow,
        .insights__card:hover .insights__arrow {
          opacity: 1;
          transform: translate(0, 0) scale(1);
        }

        .insights__featured-title {
          transition: color 0.2s ease;
        }

        .insights__featured:hover .insights__featured-title {
          color: var(--color-gold-light);
        }

        .insights__card-title {
          transition: color 0.2s ease;
        }

        .insights__card:hover .insights__card-title {
          color: var(--color-steel);
        }

        .insights__pulse-icon {
          transition: transform 0.2s ease;
        }

        .insights__pulse-card:hover .insights__pulse-icon {
          transform: translateY(-2px) scale(1.08);
        }

        .insights__featured-content {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
          height: 100%;
          padding: 22px 24px 24px;
        }

        .insights__featured-content > *:not(.insights__tag) {
          margin-top: 0;
        }

        .insights__featured-title {
          margin: auto 0 0;
          font-family: 'Bruno Ace', var(--font-display);
          font-weight: 600;
          font-size: clamp(20px, 2.3vw, 26px);
          line-height: 1.3;
          color: #fff;
          max-width: 16ch;
        }

        .insights__featured-excerpt {
          margin: 0;
          max-width: 46ch;
          font-family: var(--font-body);
          font-size: 14px;
          line-height: 1.55;
          color: rgba(248, 245, 239, 0.75);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .insights__tag {
          display: inline-block;
          font-family: var(--font-body);
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.02em;
          color: var(--color-navy-deep);
          background: var(--color-gold-light);
          border-radius: 999px;
          padding: 6px 13px;
        }

        .insights__tag--muted {
          color: var(--color-steel);
          background: rgba(27, 75, 115, 0.1);
        }

        .insights__meta {
          margin: 0;
          font-family: var(--font-body);
          font-size: 12.5px;
          color: rgba(248, 245, 239, 0.6);
        }

        /* Secondary column */
        .insights__side {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .insights__card-wrap {
          position: relative;
          flex: 1;
        }

        .insights__card-offset {
          position: absolute;
          inset: 0;
          background: var(--color-steel);
          border-radius: 18px;
          transform: rotate(1.4deg);
          transition: transform 0.25s ease;
          z-index: 0;
        }

        .insights__card-wrap:hover .insights__card-offset {
          transform: rotate(2.2deg);
        }

        .insights__card {
          position: relative;
          z-index: 1;
          display: block;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 18px;
          overflow: hidden;
          text-decoration: none;
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }

        .insights__card-wrap:hover .insights__card {
          transform: translateY(-4px);
          border-color: rgba(201, 151, 44, 0.4);
          box-shadow: 0 16px 28px -18px rgba(11, 30, 61, 0.3);
        }

        .insights__card-media {
          position: relative;
          height: 120px;
          overflow: hidden;
        }

        .insights__card-media .insights__art {
          position: static;
          width: 100%;
          height: 100%;
        }

        .insights__card-body {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
          padding: 14px 16px 16px;
        }

        .insights__card-title {
          margin: 0;
          font-family: 'Bruno Ace', var(--font-display);
          font-weight: 600;
          font-size: 16px;
          line-height: 1.35;
          color: var(--color-navy-deep);
        }

        .insights__card .insights__meta {
          color: var(--color-text-muted);
        }

        /* Stat card */
        .insights__stat-wrap {
          position: relative;
        }

        .insights__stat-offset {
          position: absolute;
          inset: 0;
          background: var(--color-gold);
          border-radius: 18px;
          transform: rotate(-1.6deg);
          transition: transform 0.25s ease;
          z-index: 0;
        }

        .insights__stat-wrap:hover .insights__stat-offset {
          transform: rotate(-2.4deg);
        }

        .insights__stat {
          position: relative;
          z-index: 1;
          overflow: hidden;
          background: var(--color-navy-deep);
          border-radius: 18px;
          padding: 18px 20px 20px;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .insights__stat-wrap:hover .insights__stat {
          transform: translateY(-4px);
          box-shadow: 0 16px 28px -18px rgba(11, 30, 61, 0.4);
        }

        .insights__stat-glow {
          position: absolute;
          top: -20%;
          right: -10%;
          width: 160px;
          height: 160px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(228, 184, 92, 0.22), transparent 70%);
          pointer-events: none;
        }

        .insights__stat-value {
          position: relative;
          display: block;
          font-family: 'Bruno Ace', var(--font-display);
          font-weight: 700;
          font-size: clamp(30px, 3.4vw, 38px);
          color: var(--color-gold-light);
        }

        .insights__stat-desc {
          position: relative;
          margin: 10px 0 0;
          max-width: 32ch;
          font-family: var(--font-body);
          font-size: 13.5px;
          line-height: 1.55;
          color: rgba(248, 245, 239, 0.82);
        }

        /* ---------- Market pulse strip ---------- */
        .insights__pulse-label {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0 0 14px;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 600;
          color: var(--color-navy-deep);
        }

        .insights__pulse-live {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          font-weight: 700;
          color: #1c8a54;
        }

        .insights__pulse-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #2fbf71;
          animation: insightsLivePulse 1.8s ease-out infinite;
        }

        .insights__pulse-mask {
          overflow: hidden;
          -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 3%, #000 97%, transparent 100%);
          mask-image: linear-gradient(90deg, transparent 0, #000 3%, #000 97%, transparent 100%);
        }

        .insights__pulse-track {
          display: flex;
          gap: 12px;
          width: max-content;
          padding: 2px 2px 6px;
          animation: insightsPulseMarquee 26s linear infinite;
        }

        .insights__pulse-mask:hover .insights__pulse-track {
          animation-play-state: paused;
        }

        .insights__pulse-card {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 260px;
          flex: none;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 14px;
          padding: 14px 16px;
          transition: border-color 0.2s ease, transform 0.2s ease;
        }

        .insights__pulse-card:hover {
          border-color: rgba(201, 151, 44, 0.4);
          transform: translateY(-3px);
        }

        .insights__pulse-icon {
          flex: none;
          width: 34px;
          height: 34px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .insights__pulse-icon svg {
          width: 16px;
          height: 16px;
        }

        .insights__pulse-icon--up {
          color: #1c8a54;
          background: rgba(47, 191, 113, 0.14);
        }

        .insights__pulse-icon--down {
          color: #b3392a;
          background: rgba(179, 57, 42, 0.12);
        }

        .insights__pulse-icon--flat {
          color: var(--color-text-muted);
          background: rgba(11, 30, 61, 0.06);
        }

        .insights__pulse-icon--new {
          color: var(--color-gold);
          background: rgba(201, 151, 44, 0.16);
        }

        /* The latest-article card is a real link — style it like the rest
           but with a gold border so it reads as "featured" in the strip. */
        .insights__pulse-card--article {
          text-decoration: none;
          border-color: rgba(201, 151, 44, 0.45);
          background: rgba(201, 151, 44, 0.05);
        }

        .insights__pulse-card--article .insights__pulse-note {
          color: var(--color-navy-deep);
        }

        .insights__pulse-copy {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .insights__pulse-field {
          font-family: var(--font-body);
          font-size: 13.5px;
          font-weight: 700;
          color: var(--color-navy-deep);
        }

        .insights__pulse-note {
          font-family: var(--font-body);
          font-size: 12px;
          line-height: 1.4;
          color: var(--color-text-muted);
          white-space: normal;
        }

        @keyframes insightsLivePulse {
          0%   { box-shadow: 0 0 0 0 rgba(47, 191, 113, 0.55); }
          70%  { box-shadow: 0 0 0 6px rgba(47, 191, 113, 0); }
          100% { box-shadow: 0 0 0 0 rgba(47, 191, 113, 0); }
        }

        @keyframes insightsPulseMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .insights__reveal {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }

        .insights__reveal--show {
          opacity: 1;
          transform: none;
        }

        @media (prefers-reduced-motion: reduce) {
          .insights__reveal {
            opacity: 1;
            transform: none;
            transition: none;
          }
          .insights__pulse-live-dot {
            animation: none;
          }
          .insights__pulse-track {
            animation: none;
          }
        }

        /* ---------- Responsive ---------- */
        @media (max-width: 980px) {
          .insights__grid {
            grid-template-columns: 1fr;
          }
          .insights__featured {
            min-height: 340px;
          }
          .insights__side {
            flex-direction: row;
          }
          .insights__card-wrap,
          .insights__stat-wrap {
            flex: 1;
          }
        }

        @media (max-width: 720px) {
          .insights {
            padding: 44px 0;
          }
          .insights__head {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .insights__side {
            flex-direction: column;
          }
          .insights__featured-title {
            max-width: none;
          }
        }

        @media (max-width: 560px) {
          .insights__pulse-card {
            width: 230px;
          }
        }
      `}</style>
    </section>
  );
}