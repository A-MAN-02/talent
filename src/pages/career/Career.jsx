import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getJobs } from '../../lib/api';

export default function Career() {
  const [jobs, setJobs] = useState([]);
  const [state, setState] = useState('loading'); // loading | ready | error

  useEffect(() => {
    let cancelled = false;
    getJobs()
      .then((data) => {
        if (cancelled) return;
        setJobs(data);
        setState('ready');
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="career">
      <section className="career__hero">
        <div className="career__glow career__glow--one" aria-hidden="true" />
        <div className="career__glow career__glow--two" aria-hidden="true" />
        <div className="career__grid-bg" aria-hidden="true" />
        <div className="career__noise" aria-hidden="true" />
        <div className="career__container">
          <p className="career__eyebrow">
            <span className="career__eyebrow-dot" aria-hidden="true" />
            Careers
          </p>
          <h1 className="career__heading">Build what deep-tech teams run on.</h1>
          <p className="career__sub">
            We&rsquo;re Bharyat&rsquo;s own engineering and search team &mdash; open roles across RF,
            embedded, semiconductor, cloud and AI. If a listing below isn&rsquo;t an exact match, reach
            out anyway.
          </p>
        </div>
      </section>

      <section className="career__list">
        <div className="career__container">
          {state === 'loading' && (
            <div className="career__status">Loading open roles&hellip;</div>
          )}

          {state === 'error' && (
            <div className="career__status career__status--error">
              We couldn&rsquo;t load open roles right now. Please refresh, or write to{' '}
              <a href="mailto:talent@bharyat.com">talent@bharyat.com</a>.
            </div>
          )}

          {state === 'ready' && jobs.length === 0 && (
            <div className="career__status">
              No open roles at the moment &mdash; check back soon, or send your r&eacute;sum&eacute; to{' '}
              <a href="mailto:talent@bharyat.com">talent@bharyat.com</a> and we&rsquo;ll reach out when
              something fits.
            </div>
          )}

          {state === 'ready' && jobs.length > 0 && (
            <div className="career__grid">
              {jobs.map((job) => (
                <article className="career__card" key={job.id}>
                  <h2 className="career__card-title">{job.title}</h2>

                  <div className="career__card-meta">
                    {job.department && <span className="career__tag">{job.department}</span>}
                    {job.location && <span className="career__tag">{job.location}</span>}
                    {job.job_type && <span className="career__tag">{job.job_type}</span>}
                  </div>

                  <p className="career__card-desc">{job.description}</p>

                  <Link to={`/careers/apply/${job.id}`} className="career__card-btn">
                    View &amp; apply
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bruno+Ace&display=swap');

        .career {
          min-height: 60vh;
          background:
            radial-gradient(1100px 560px at 12% -8%, rgba(201, 151, 44, 0.14), transparent 60%),
            radial-gradient(1000px 520px at 92% 4%, rgba(27, 75, 115, 0.20), transparent 60%),
            linear-gradient(180deg, #e9f0f8 0%, #f5f8fc 42%, #ffffff 100%);
        }

        .career__container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 clamp(20px, 4vw, 56px);
          position: relative;
          z-index: 2;
        }

        /* ---------- Hero ---------- */
        .career__hero {
          position: relative;
          overflow: hidden;
          padding: clamp(48px, 7vw, 84px) 0 clamp(32px, 5vw, 56px);
        }

        /* Soft ambient light blobs behind the heading — same trick the
           site's hero section uses, just toned down for a supporting page. */
        .career__glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }

        .career__glow--one {
          top: -140px;
          left: -100px;
          width: 420px;
          height: 420px;
          background: radial-gradient(circle, rgba(201, 151, 44, 0.30), transparent 70%);
        }

        .career__glow--two {
          top: -80px;
          right: -120px;
          width: 460px;
          height: 460px;
          background: radial-gradient(circle, rgba(27, 75, 115, 0.26), transparent 70%);
        }

        /* Faint grain — the thing that quietly separates "flat gradient"
           from "premium matte surface". Barely visible on its own. */
        .career__noise {
          position: absolute;
          inset: 0;
          z-index: 0;
          opacity: 0.05;
          mix-blend-mode: overlay;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        .career__grid-bg {
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

        .career__eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          margin: 0 0 14px;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 600;
          color: var(--color-gold);
        }

        .career__eyebrow-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-gold);
          display: inline-block;
        }

        .career__heading {
          margin: 0;
          max-width: 20ch;
          font-family: 'Bruno Ace', var(--font-display);
          font-weight: 700;
          font-size: clamp(2.1rem, 4.8vw, 3.6rem);
          line-height: 1.15;
          letter-spacing: -0.01em;
          color: var(--color-navy-deep);
          text-shadow: 0 6px 24px rgba(11, 30, 61, 0.14);
        }

        .career__sub {
          margin: 18px 0 0;
          max-width: 62ch;
          font-family: var(--font-body);
          font-size: 15.5px;
          line-height: 1.7;
          color: var(--color-text-muted);
        }

        /* ---------- List ---------- */
        .career__list {
          padding: 0 0 clamp(56px, 8vw, 96px);
        }

        .career__status {
          padding: 40px 0;
          font-family: var(--font-body);
          font-size: 15px;
          line-height: 1.7;
          color: var(--color-text-muted);
        }

        .career__status a {
          color: var(--color-steel);
          font-weight: 600;
          text-decoration: underline;
        }

        .career__status--error {
          color: #9c3b2f;
        }

        /* Cards auto-fit the row and reflow on their own as the screen
           resizes — this is what makes new jobs (added from the admin
           dashboard) just slot into the grid with no code changes needed.
           The explicit breakpoints below fine-tune the column count at
           each size instead of leaving it purely to minmax(). */
        .career__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        /* Desktop: roomy cards, never more than ~3 per row even on ultra-wide */
        @media (min-width: 1280px) {
          .career__grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        /* Tablet: two per row */
        @media (min-width: 641px) and (max-width: 1279px) {
          .career__grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .career__card {
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 26px 26px 22px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-left: 3px solid transparent;
          border-radius: 12px;
          box-shadow: 0 2px 10px -4px rgba(11, 30, 61, 0.12);
          transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
        }

        /* Faint light sweep along the top edge — reads as a subtle highlight
           rather than a flat card, without adding any extra markup. */
        .career__card::before {
          content: '';
          position: absolute;
          inset: 0 0 auto 0;
          height: 1px;
          border-radius: 12px 12px 0 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.9), transparent);
          opacity: 0.7;
          pointer-events: none;
        }

        .career__card:hover {
          border-left-color: var(--color-gold);
          box-shadow: 0 20px 40px -18px rgba(11, 30, 61, 0.32), 0 0 0 1px rgba(201, 151, 44, 0.12);
          transform: translateY(-4px);
        }

        .career__card-title {
          margin: 0;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 19px;
          line-height: 1.35;
          color: var(--color-navy-deep);
        }

        .career__card-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin: 12px 0 0;
        }

        .career__tag {
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 600;
          color: var(--color-steel);
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(27, 75, 115, 0.08);
        }

        .career__card-desc {
          margin: 16px 0 0;
          flex: 1;
          font-family: var(--font-body);
          font-size: 14px;
          line-height: 1.65;
          color: var(--color-text-muted);
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .career__card-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 20px;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 600;
          color: var(--color-steel);
          transition: color 0.2s ease, font-size 0.2s ease, gap 0.2s ease;
        }

        .career__card-btn svg {
          width: 15px;
          height: 15px;
          transition: transform 0.2s ease;
        }

        .career__card:hover .career__card-btn {
          color: var(--color-gold);
          font-size: 15.5px;
          gap: 10px;
        }

        .career__card:hover .career__card-btn svg {
          transform: translateX(3px);
        }

        @media (max-width: 640px) {
          .career__grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .career__card {
            padding: 20px 20px 18px;
          }
          .career__glow--one,
          .career__glow--two {
            width: 200px;
            height: 200px;
            filter: blur(50px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .career__card,
          .career__card-btn,
          .career__card-btn svg {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}