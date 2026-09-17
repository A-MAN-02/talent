import { useEffect, useRef, useState } from 'react';
import { getArticles } from '../../lib/api';

/* ============================================================
   DUMMY DATA — DELETE ME
   ------------------------------------------------------------
   Stand-in articles so this page never looks empty while real
   content is still trickling into the backend. They're appended
   *after* whatever getArticles() returns, so real articles always
   show first and these sit at the bottom, clearly last.

   To remove them once there's enough real content:
     1. Delete this whole DUMMY_ARTICLES block.
     2. In the useEffect below, change
          setArticles([...(data || []), ...DUMMY_ARTICLES]);
        to
          setArticles(data || []);
        and delete the `.catch` fallback that also uses DUMMY_ARTICLES
        (let it fall through to setState('error') instead).
   That's it — nothing else in this file references dummy content.
   ============================================================ */
const DUMMY_ARTICLES = [
  {
    id: 'ai-scored-shortlists',
    tag: 'Market Trends',
    title: 'Why AI-scored shortlists are changing how teams hire engineers',
    excerpt:
      'A look at how AI-assisted screening is compressing time-to-shortlist for RF, embedded and cloud roles — without losing signal on the candidates who actually matter.',
  },
  {
    id: 'deep-tech-interview-questions',
    tag: 'Hiring Tips',
    title: 'What deep-tech candidates actually ask in interviews',
    excerpt:
      'Real questions we hear on RF, embedded and cloud interview loops — and how strong candidates use them to size up a team before they say yes.',
  },
  {
    id: 'rf-6g-hiring-surge',
    tag: 'RF & Wireless',
    title: 'Inside the 5G/6G hiring surge nobody quite planned for',
    excerpt:
      'Demand for RF and wireless engineers has outpaced supply for three straight quarters. Here\u2019s where teams are actually finding them.',
  },
  {
    id: 'semiconductor-talent-crunch',
    tag: 'Semiconductor',
    title: 'The semiconductor talent crunch, one quarter at a time',
    excerpt:
      'Chip design headcount keeps climbing while the qualified pool barely moves. A look at where the pressure is building and why.',
  },
];
/* ========================== END DUMMY DATA ========================== */

export default function Insights() {
  const [articles, setArticles] = useState([]);
  const [state, setState] = useState('loading'); // loading | ready | error

  // ---------- Subscribe modal ----------
  // Frontend-only for now — no real endpoint yet. `handleSubscribeSubmit`
  // below is the one spot to wire up once the backend has something like
  // POST /api/subscribers: swap the setTimeout for a real call, keep the
  // same success/error handling.
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

    // TODO: replace with the real call once the backend endpoint exists, e.g.
    //   subscribeToInsights(subscribeEmail)
    //     .then(() => setSubscribeStatus('success'))
    //     .catch(() => setSubscribeStatus('error'));
    setTimeout(() => setSubscribeStatus('success'), 500);
  };

  // Mouse-reactive background: the diagonal stripes + spotlight behind the
  // article list drift toward the cursor. Writing CSS vars straight onto
  // the DOM node (instead of useState) skips a re-render on every
  // mousemove — the vars just cascade down to whatever reads them in CSS.
  const rootRef = useRef(null);
  const frame = useRef(null);

  useEffect(() => () => {
    if (frame.current) cancelAnimationFrame(frame.current);
  }, []);

  function handlePointerMove(e) {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      if (!rootRef.current) return;
      rootRef.current.style.setProperty('--px', (relX - 0.5).toFixed(3));
      rootRef.current.style.setProperty('--py', (relY - 0.5).toFixed(3));
      rootRef.current.style.setProperty('--mx', `${(relX * 100).toFixed(1)}%`);
      rootRef.current.style.setProperty('--my', `${(relY * 100).toFixed(1)}%`);
      rootRef.current.style.setProperty('--spot-opacity', '1');
    });
  }

  function handlePointerLeave() {
    rootRef.current?.style.setProperty('--spot-opacity', '0');
  }

  useEffect(() => {
    let cancelled = false;
    getArticles()
      .then((data) => {
        if (cancelled) return;
        // Real articles first, dummy ones after — see the DELETE ME block
        // above for how to drop DUMMY_ARTICLES once it's not needed.
        setArticles([...(data || []), ...DUMMY_ARTICLES]);
        setState('ready');
      })
      .catch(() => {
        if (cancelled) return;
        // Backend not reachable (or not wired up yet) — fall back to the
        // dummy list so the page still has something to show.
        setArticles(DUMMY_ARTICLES);
        setState('ready');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="articles" ref={rootRef} onMouseMove={handlePointerMove} onMouseLeave={handlePointerLeave}>
      <section className="articles__hero">
        <div className="articles__glow articles__glow--one" aria-hidden="true" />
        <div className="articles__glow articles__glow--two" aria-hidden="true" />
        <div className="articles__grid-bg" aria-hidden="true" />
        <div className="articles__noise" aria-hidden="true" />
        <div className="articles__container">
          <div className="articles__hero-top">
            <div className="articles__hero-copy">
              <p className="articles__eyebrow">
                <span className="articles__eyebrow-dot" aria-hidden="true" />
                Thoughts &amp; Insights
              </p>
              <h1 className="articles__heading">Everything we&rsquo;re writing about deep-tech hiring.</h1>
              <p className="articles__sub">
                Market trends, hiring playbooks and what we&rsquo;re seeing across RF, embedded,
                semiconductor, cloud and AI search &mdash; updated as our team publishes.
              </p>
            </div>

            <button type="button" className="articles__subscribe-btn" onClick={openSubscribe}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              Subscribe
            </button>
          </div>
        </div>
      </section>

      <section className="articles__list">
        <div className="articles__stripes" aria-hidden="true" />
        <div className="articles__spotlight" aria-hidden="true" />
        <div className="articles__container">
          {state === 'loading' && (
            <div className="articles__status">Loading articles&hellip;</div>
          )}

          {state === 'error' && (
            <div className="articles__status articles__status--error">
              We couldn&rsquo;t load articles right now. Please refresh, or write to{' '}
              <a href="mailto:talent@bharyat.com">talent@bharyat.com</a>.
            </div>
          )}

          {state === 'ready' && articles.length === 0 && (
            <div className="articles__status">
              No articles yet &mdash; check back soon.
            </div>
          )}

          {state === 'ready' && articles.length > 0 && (
            <>
              <p className="articles__count">
                {articles.length} article{articles.length === 1 ? '' : 's'}
              </p>

              <div className="articles__timeline">
                {articles.map((article) => (
                  <div className="articles__row" key={article.id}>
                    <span className="articles__offset" aria-hidden="true" />
                    <div className="articles__card">
                      <span className="articles__tag">{article.tag}</span>
                      <h2 className="articles__title">{article.title}</h2>
                      <p className="articles__excerpt">{article.excerpt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ---------- Subscribe modal ---------- */}
      {subscribeOpen && (
        <div className="articles__subscribe-backdrop" onClick={closeSubscribe}>
          <div
            className="articles__subscribe-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="subscribe-heading"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="articles__subscribe-close" onClick={closeSubscribe} aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            {subscribeStatus === 'success' ? (
              <div className="articles__subscribe-success">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <h2>You&rsquo;re subscribed</h2>
                <p>We&rsquo;ll email {subscribeEmail} whenever a new insight goes up.</p>
                <button type="button" className="articles__subscribe-btn articles__subscribe-btn--modal" onClick={closeSubscribe}>
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubscribeSubmit}>
                <h2 id="subscribe-heading" className="articles__subscribe-heading">
                  Get notified about new insights
                </h2>
                <p className="articles__subscribe-copy">
                  Drop your email and we&rsquo;ll ping you the moment a new article goes live &mdash; nothing else, no spam.
                </p>
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  className="articles__subscribe-input"
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  disabled={subscribeStatus === 'submitting'}
                />
                {subscribeStatus === 'error' && (
                  <p className="articles__subscribe-error">Something went wrong &mdash; please try again.</p>
                )}
                <button
                  type="submit"
                  className="articles__subscribe-btn articles__subscribe-btn--modal"
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

        .articles {
          min-height: 60vh;
          background:
            radial-gradient(1100px 560px at 12% -8%, rgba(201, 151, 44, 0.14), transparent 60%),
            radial-gradient(1000px 520px at 92% 4%, rgba(27, 75, 115, 0.20), transparent 60%),
            linear-gradient(180deg, #e9f0f8 0%, #f5f8fc 42%, #ffffff 100%);
        }

        .articles__container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 clamp(20px, 4vw, 56px);
          position: relative;
          z-index: 2;
        }

        /* ---------- Hero (same treatment as the Careers page hero) ---------- */
        .articles__hero {
          position: relative;
          overflow: hidden;
          padding: clamp(48px, 7vw, 84px) 0 clamp(32px, 5vw, 56px);
        }

        .articles__glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }

        .articles__glow--one {
          top: -140px;
          left: -100px;
          width: 420px;
          height: 420px;
          background: radial-gradient(circle, rgba(201, 151, 44, 0.30), transparent 70%);
        }

        .articles__glow--two {
          top: -80px;
          right: -120px;
          width: 460px;
          height: 460px;
          background: radial-gradient(circle, rgba(27, 75, 115, 0.26), transparent 70%);
        }

        .articles__noise {
          position: absolute;
          inset: 0;
          z-index: 0;
          opacity: 0.05;
          mix-blend-mode: overlay;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        .articles__grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(11, 30, 61, 0.09) 1px, transparent 1px),
            linear-gradient(90deg, rgba(11, 30, 61, 0.09) 1px, transparent 1px);
          background-size: 56px 56px;
          -webkit-mask-image: radial-gradient(1000px 480px at 20% 0%, #000 0%, transparent 75%);
          mask-image: radial-gradient(1000px 480px at 20% 0%, #000 0%, transparent 75%);
          opacity: 0.6;
          pointer-events: none;
          z-index: 0;
        }

        .articles__eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          margin: 0 0 14px;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 600;
          color: var(--color-gold);
        }

        .articles__eyebrow-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-gold);
          display: inline-block;
        }

        .articles__heading {
          margin: 0;
          max-width: 22ch;
          font-family: 'Bruno Ace', var(--font-display);
          font-weight: 700;
          font-size: clamp(2.1rem, 4.8vw, 3.6rem);
          line-height: 1.15;
          letter-spacing: -0.01em;
          color: var(--color-navy-deep);
          text-shadow: 0 6px 24px rgba(11, 30, 61, 0.14);
        }

        .articles__sub {
          margin: 18px 0 0;
          max-width: 62ch;
          font-family: var(--font-body);
          font-size: 15.5px;
          line-height: 1.7;
          color: var(--color-text-muted);
        }

        /* Heading copy on the left, Subscribe button pinned top-right. */
        .articles__hero-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
        }

        .articles__hero-copy {
          min-width: 0;
        }

        .articles__subscribe-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
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

        .articles__subscribe-btn svg {
          width: 15px;
          height: 15px;
        }

        .articles__subscribe-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(179, 39, 31, 0.45);
        }

        .articles__subscribe-btn--modal {
          width: 100%;
          justify-content: center;
          margin-top: 18px;
        }

        .articles__subscribe-btn--modal:disabled {
          opacity: 0.7;
          cursor: default;
          transform: none;
        }

        /* ---------- Subscribe modal ---------- */
        .articles__subscribe-backdrop {
          position: fixed;
          inset: 0;
          z-index: 80;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(11, 30, 61, 0.45);
          backdrop-filter: blur(3px);
          animation: articlesFadeIn 0.18s ease;
        }

        .articles__subscribe-modal {
          position: relative;
          width: 100%;
          max-width: 420px;
          background: var(--color-surface);
          border-radius: 20px;
          padding: 32px 28px 28px;
          box-shadow: 0 24px 60px -20px rgba(11, 30, 61, 0.5);
        }

        .articles__subscribe-close {
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

        .articles__subscribe-close svg {
          width: 15px;
          height: 15px;
        }

        .articles__subscribe-close:hover {
          background: rgba(11, 30, 61, 0.1);
          color: var(--color-navy-deep);
        }

        .articles__subscribe-heading {
          margin: 0 0 8px;
          font-family: var(--font-display);
          font-size: 21px;
          color: var(--color-navy-deep);
        }

        .articles__subscribe-copy {
          margin: 0 0 20px;
          font-family: var(--font-body);
          font-size: 14px;
          line-height: 1.6;
          color: var(--color-text-muted);
        }

        .articles__subscribe-input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid var(--color-border);
          background: rgba(240, 246, 252, 0.6);
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--color-text-main);
        }

        .articles__subscribe-input:focus {
          outline: none;
          border-color: rgba(179, 39, 31, 0.5);
        }

        .articles__subscribe-error {
          margin: 10px 0 0;
          font-family: var(--font-body);
          font-size: 13px;
          color: #b3271f;
        }

        .articles__subscribe-success {
          text-align: center;
        }

        .articles__subscribe-success svg {
          width: 40px;
          height: 40px;
          margin: 4px 0 12px;
          padding: 9px;
          border-radius: 50%;
          color: #1c8a54;
          background: rgba(47, 191, 113, 0.14);
        }

        .articles__subscribe-success h2 {
          margin: 0 0 8px;
          font-family: var(--font-display);
          font-size: 20px;
          color: var(--color-navy-deep);
        }

        .articles__subscribe-success p {
          margin: 0;
          font-family: var(--font-body);
          font-size: 14px;
          line-height: 1.6;
          color: var(--color-text-muted);
        }

        @keyframes articlesFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 640px) {
          .articles__hero-top {
            flex-direction: column;
          }
        }

        /* ---------- List ---------- */
        .articles__list {
          position: relative;
          overflow: hidden;
          padding: 0 0 clamp(56px, 8vw, 96px);
        }

        /* Diagonal texture behind the timeline, tinted with the site's own
           palette instead of a flat white background. Drifts slightly
           toward the cursor via --px/--py, set on mousemove above. */
        .articles__stripes {
          position: absolute;
          inset: -60px;
          z-index: 0;
          pointer-events: none;
          background-image: radial-gradient(
            rgba(27, 75, 115, 0.16) 1.6px,
            transparent 1.6px
          );
          background-size: 26px 26px;
          -webkit-mask-image: radial-gradient(900px 620px at 22% 18%, #000 0%, transparent 72%);
          mask-image: radial-gradient(900px 620px at 22% 18%, #000 0%, transparent 72%);
          transform: translate3d(calc(var(--px, 0) * 26px), calc(var(--py, 0) * 18px), 0);
          transition: transform 0.35s ease-out;
        }

        /* Soft light that follows the cursor — fades in on mousemove,
           fades out on mouseleave via --spot-opacity. */
        .articles__spotlight {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: var(--spot-opacity, 0);
          background: radial-gradient(480px circle at var(--mx, 50%) var(--my, 30%), rgba(201, 151, 44, 0.16), transparent 68%);
          transition: opacity 0.4s ease;
        }

        .articles__status {
          padding: 40px 0;
          font-family: var(--font-body);
          font-size: 15px;
          line-height: 1.7;
          color: var(--color-text-muted);
        }

        .articles__status a {
          color: var(--color-steel);
          font-weight: 600;
          text-decoration: underline;
        }

        .articles__status--error {
          color: #9c3b2f;
        }

        .articles__count {
          margin: 0 0 28px;
          font-family: var(--font-body);
          font-size: 13.5px;
          font-weight: 600;
          color: var(--color-text-muted);
        }

        /* Straight single-column timeline — every row is full-width up to a
           comfortable reading max-width, stacked with a small, consistent
           gap. No left/right alternation, so nothing can overlap or run
           off-screen as the viewport narrows. The offset sticker behind
           each card still alternates gold/steel with opposite rotation,
           purely as a cosmetic accent. */
        /* Two-column layout on desktop — left and right columns fall out
           naturally from the 2-col grid (item 1 → col 1, item 2 → col 2,
           item 3 → col 1, etc.), and the right column is nudged down so
           it starts a little lower than the left one. Below the
           breakpoint there isn't room for two columns without things
           getting tight, so it collapses to a single column. */
        .articles__timeline {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(20px, 3vw, 32px);
          align-items: start;
        }

        .articles__row {
          position: relative;
          width: 100%;
        }

        .articles__row:nth-child(even) {
          margin-top: clamp(28px, 6vw, 56px);
        }

        .articles__offset {
          position: absolute;
          inset: 0;
          background: var(--color-gold-light);
          border-radius: 16px;
          transform: rotate(-1.6deg);
          transition: transform 0.25s ease;
          z-index: 0;
        }

        .articles__row:nth-child(even) .articles__offset {
          background: var(--color-steel);
          transform: rotate(1.4deg);
        }

        .articles__row:hover .articles__offset {
          transform: rotate(-2.4deg);
        }

        .articles__row:nth-child(even):hover .articles__offset {
          transform: rotate(2.2deg);
        }

        .articles__card {
          position: relative;
          z-index: 1;
          display: block;
          padding: 28px 30px 26px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 16px;
          text-decoration: none;
          box-shadow: 0 2px 10px -4px rgba(11, 30, 61, 0.12);
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }

        .articles__row:hover .articles__card {
          transform: translateY(-4px);
          border-color: rgba(201, 151, 44, 0.35);
          box-shadow: 0 20px 40px -18px rgba(11, 30, 61, 0.28);
        }

        .articles__tag {
          display: inline-block;
          font-family: var(--font-body);
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.02em;
          color: var(--color-steel);
          background: rgba(27, 75, 115, 0.08);
          border-radius: 999px;
          padding: 6px 13px;
        }

        .articles__title {
          margin: 14px 0 0;
          font-family: 'Bruno Ace', var(--font-display);
          font-weight: 600;
          font-size: 21px;
          line-height: 1.32;
          color: var(--color-navy-deep);
          max-width: 34ch;
        }

        .articles__excerpt {
          margin: 12px 0 0;
          max-width: 54ch;
          font-family: var(--font-body);
          font-size: 14.5px;
          line-height: 1.65;
          color: var(--color-text-muted);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (max-width: 860px) {
          .articles__timeline {
            grid-template-columns: 1fr;
            gap: clamp(14px, 3vw, 20px);
          }
          .articles__row {
            max-width: none;
          }
          .articles__row:nth-child(even) {
            margin-top: 0;
          }
          .articles__card {
            padding: 22px 22px 20px;
          }
          .articles__glow--one,
          .articles__glow--two {
            width: 200px;
            height: 200px;
            filter: blur(50px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .articles__row,
          .articles__offset,
          .articles__card,
          .articles__stripes,
          .articles__spotlight,
          .articles__subscribe-backdrop {
            transition: none;
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}