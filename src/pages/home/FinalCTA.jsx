import { useEffect, useState } from 'react';

const HIRING_FOR_OPTIONS = [
  'RF / mmWave',
  'FPGA / ASIC',
  'Embedded / Firmware',
  'Mechanical',
  'Cloud / AI',
  'IT Services',
  'Executive Search',
  'Other',
];

const ENGAGEMENT_OPTIONS = [
  'Dedicated Talent Pod',
  'Contract-to-Hire',
  'Staff Augmentation',
  'Direct Hire',
  'RPO',
  'Executive Search',
  'Not sure yet',
];

const CONTACT_EMAIL = 'talent@bharyat.com';
const CONTACT_PHONE = '807 317 0466';
const CONTACT_SITE = 'Bharyat.com/talent';

const INITIAL_FORM = {
  name: '',
  company: '',
  email: '',
  phone: '',
  hiringFor: '',
  engagementModel: '',
  message: '',
};

function buildMailto(form) {
  const subject = encodeURIComponent(
    `Start a Search — ${form.company || form.name || 'New Enquiry'}`
  );
  const lines = [
    `Name: ${form.name}`,
    `Company: ${form.company}`,
    `Work Email: ${form.email}`,
    form.phone && `Phone: ${form.phone}`,
    form.hiringFor && `Hiring for: ${form.hiringFor}`,
    form.engagementModel && `Engagement model: ${form.engagementModel}`,
    '',
    form.message || '',
  ].filter(Boolean);
  const body = encodeURIComponent(lines.join('\n'));
  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

export default function FinalCTA() {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  function openForm() {
    setSubmitted(false);
    setForm(INITIAL_FORM);
    setIsOpen(true);
  }

  function closeForm() {
    setIsOpen(false);
  }

  function handleChange(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.company || !form.email) return;
    window.location.href = buildMailto(form);
    setSubmitted(true);
  }

  return (
    <section className="final-cta" id="contact">
      <div className="final-cta__grid" aria-hidden="true" />

      <div className="final-cta__container">
        <div className="final-cta__frame">
          <span className="final-cta__corner final-cta__corner--tl" />
          <span className="final-cta__corner final-cta__corner--tr" />
          <span className="final-cta__corner final-cta__corner--bl" />
          <span className="final-cta__corner final-cta__corner--br" />

          <div className="final-cta__copy">
            <h2 className="final-cta__heading">Let&rsquo;s build your team</h2>
            <p className="final-cta__note">
              We don&rsquo;t just fill roles &mdash; we vet them the way we&rsquo;d hire for
              ourselves.
            </p>
          </div>

          <div className="final-cta__action">
            <button type="button" className="final-cta__button" onClick={openForm}>
              <span className="final-cta__button-dot" />
              Start a search
            </button>

            <dl className="final-cta__contact">
              <div className="final-cta__contact-row">
                <dt>Site</dt>
                <dd>{CONTACT_SITE}</dd>
              </div>
              <div className="final-cta__contact-row">
                <dt>Email</dt>
                <dd>{CONTACT_EMAIL}</dd>
              </div>
              <div className="final-cta__contact-row">
                <dt>Phone</dt>
                <dd className="final-cta__contact-num">{CONTACT_PHONE}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="final-cta__overlay"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeForm();
          }}
        >
          <div
            className="final-cta__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="start-search-title"
          >
            <span className="final-cta__corner final-cta__corner--tl" />
            <span className="final-cta__corner final-cta__corner--br" />

            <div className="final-cta__modal-head">
              <h3 id="start-search-title">Start a search</h3>
              <button
                type="button"
                className="final-cta__modal-close"
                onClick={closeForm}
                aria-label="Close form"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            {submitted ? (
              <div className="final-cta__success">
                <span className="final-cta__success-node" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <p>
                  Thanks, {form.name.split(' ')[0] || 'there'}. Your email client should have
                  opened with your details pre-filled &mdash; send it across and our team will
                  get back to you.
                </p>
                <button type="button" className="final-cta__button final-cta__button--modal" onClick={closeForm}>
                  Done
                </button>
              </div>
            ) : (
              <form className="final-cta__form" onSubmit={handleSubmit}>
                <div className="final-cta__row">
                  <label className="final-cta__field">
                    <span>Full name*</span>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={handleChange('name')}
                      placeholder="Your name"
                    />
                  </label>
                  <label className="final-cta__field">
                    <span>Company*</span>
                    <input
                      type="text"
                      required
                      value={form.company}
                      onChange={handleChange('company')}
                      placeholder="Company name"
                    />
                  </label>
                </div>

                <div className="final-cta__row">
                  <label className="final-cta__field">
                    <span>Work email*</span>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange('email')}
                      placeholder="you@company.com"
                    />
                  </label>
                  <label className="final-cta__field">
                    <span>Phone</span>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={handleChange('phone')}
                      placeholder="Optional"
                    />
                  </label>
                </div>

                <div className="final-cta__row">
                  <label className="final-cta__field">
                    <span>What are you hiring for?</span>
                    <select value={form.hiringFor} onChange={handleChange('hiringFor')}>
                      <option value="">Select an option</option>
                      {HIRING_FOR_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="final-cta__field">
                    <span>Engagement model</span>
                    <select value={form.engagementModel} onChange={handleChange('engagementModel')}>
                      <option value="">Select an option</option>
                      {ENGAGEMENT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="final-cta__field">
                  <span>Message</span>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={handleChange('message')}
                    placeholder="Tell us a bit about the role and timeline"
                  />
                </label>

                <button type="submit" className="final-cta__button final-cta__button--modal">
                  Send to our team
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bruno+Ace&display=swap');

        .final-cta {
          position: relative;
          background: var(--color-navy-deep);
          padding: clamp(48px, 7vw, 88px) 0;
          overflow: hidden;
        }

        /* faint schematic grid backdrop — the one deliberate texture on the page */
        .final-cta__grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(201, 151, 44, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201, 151, 44, 0.08) 1px, transparent 1px);
          background-size: 42px 42px;
          -webkit-mask-image: radial-gradient(ellipse 70% 90% at 70% 40%, black, transparent);
          mask-image: radial-gradient(ellipse 70% 90% at 70% 40%, black, transparent);
        }

        .final-cta__container {
          position: relative;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 clamp(20px, 4vw, 56px);
        }

        .final-cta__frame {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
          flex-wrap: wrap;
          padding: clamp(28px, 4vw, 44px) clamp(24px, 4vw, 48px);
          border: 1px solid rgba(248, 245, 239, 0.14);
          border-radius: 4px;
          background: rgba(248, 245, 239, 0.02);
        }

        .final-cta__corner {
          position: absolute;
          width: 18px;
          height: 18px;
          border: 2px solid var(--color-gold);
          pointer-events: none;
        }
        .final-cta__corner--tl { top: -1px; left: -1px; border-right: none; border-bottom: none; }
        .final-cta__corner--tr { top: -1px; right: -1px; border-left: none; border-bottom: none; }
        .final-cta__corner--bl { bottom: -1px; left: -1px; border-right: none; border-top: none; }
        .final-cta__corner--br { bottom: -1px; right: -1px; border-left: none; border-top: none; }

        .final-cta__copy {
          max-width: 580px;
        }

        .final-cta__heading {
          margin: 0;
          font-family: 'Bruno Ace', var(--font-display);
          font-weight: 700;
          font-size: clamp(28px, 4vw, 42px);
          line-height: 1.2;
          color: #fff;
        }

        .final-cta__note {
          margin: 16px 0 0;
          padding-left: 16px;
          border-left: 2px solid rgba(201, 151, 44, 0.55);
          font-family: var(--font-body);
          font-size: 15px;
          line-height: 1.6;
          color: rgba(248, 245, 239, 0.7);
        }

        .final-cta__action {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 20px;
          flex-shrink: 0;
        }

        .final-cta__button {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          appearance: none;
          border: none;
          cursor: pointer;
          background: linear-gradient(135deg, var(--color-gold), var(--color-gold-light));
          color: var(--color-navy-deep);
          font-family: var(--font-body);
          font-size: 15px;
          font-weight: 700;
          padding: 14px 26px;
          border-radius: 6px;
          white-space: nowrap;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .final-cta__button-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--color-navy-deep);
          animation: finalCtaPulse 2.2s ease-in-out infinite;
        }

        .final-cta__button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 26px -10px rgba(201, 151, 44, 0.55);
        }

        .final-cta__contact {
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 5px;
          align-items: flex-end;
        }

        .final-cta__contact-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          font-family: var(--font-body);
          font-size: 13px;
          color: rgba(248, 245, 239, 0.55);
          white-space: nowrap;
        }

        .final-cta__contact-row dt {
          color: rgba(248, 245, 239, 0.35);
        }

        .final-cta__contact-row dd {
          margin: 0;
          color: rgba(248, 245, 239, 0.82);
        }

        .final-cta__contact-num {
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.02em;
        }

        /* ---------- Modal ---------- */
        .final-cta__overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(11, 30, 61, 0.62);
          backdrop-filter: blur(3px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: finalCtaFadeIn 0.2s ease;
        }

        .final-cta__modal {
          position: relative;
          width: 100%;
          max-width: 560px;
          max-height: 90vh;
          overflow-y: auto;
          background: var(--color-surface);
          border-radius: 6px;
          padding: 26px clamp(20px, 3vw, 32px) 28px;
          box-shadow: 0 40px 80px -30px rgba(11, 30, 61, 0.5);
          animation: finalCtaRiseIn 0.25s ease;
        }

        .final-cta__modal .final-cta__corner {
          border-color: var(--color-navy-deep);
          opacity: 0.18;
        }

        .final-cta__modal-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--color-border);
          position: relative;
        }

        .final-cta__modal-head::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -1px;
          width: 46px;
          height: 2px;
          background: var(--color-gold);
        }

        .final-cta__modal-head h3 {
          margin: 0;
          font-family: 'Bruno Ace', var(--font-display);
          font-weight: 600;
          font-size: 22px;
          color: var(--color-navy-deep);
        }

        .final-cta__modal-close {
          appearance: none;
          border: none;
          background: rgba(11, 30, 61, 0.06);
          color: var(--color-text-muted);
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
        }

        .final-cta__modal-close:hover {
          background: rgba(11, 30, 61, 0.12);
          color: var(--color-navy-deep);
        }

        .final-cta__modal-close svg {
          width: 16px;
          height: 16px;
        }

        .final-cta__form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .final-cta__row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .final-cta__field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-family: var(--font-body);
        }

        .final-cta__field span {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--color-navy-deep);
        }

        .final-cta__field input,
        .final-cta__field select,
        .final-cta__field textarea {
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--color-navy-deep);
          background: var(--color-bg);
          border: 1.5px solid var(--color-border);
          border-radius: 6px;
          padding: 10px 12px;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .final-cta__field select {
          appearance: none;
          background-image: linear-gradient(45deg, transparent 50%, var(--color-text-muted) 50%),
            linear-gradient(135deg, var(--color-text-muted) 50%, transparent 50%);
          background-position: calc(100% - 18px) center, calc(100% - 13px) center;
          background-size: 5px 5px, 5px 5px;
          background-repeat: no-repeat;
          padding-right: 34px;
        }

        .final-cta__field textarea {
          resize: vertical;
          min-height: 80px;
        }

        .final-cta__field input:focus,
        .final-cta__field select:focus,
        .final-cta__field textarea:focus {
          border-color: var(--color-gold);
        }

        .final-cta__button--modal {
          width: 100%;
          margin-top: 4px;
          justify-content: center;
        }

        .final-cta__button--modal .final-cta__button-dot {
          display: none;
        }

        .final-cta__success {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
        }

        .final-cta__success-node {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1.5px solid var(--color-gold);
          color: var(--color-gold);
        }

        .final-cta__success-node svg {
          width: 18px;
          height: 18px;
        }

        .final-cta__success p {
          margin: 0;
          font-family: var(--font-body);
          font-size: 14.5px;
          line-height: 1.6;
          color: var(--color-text-muted);
        }

        @keyframes finalCtaFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes finalCtaRiseIn {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: none; }
        }

        @keyframes finalCtaPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }

        @media (prefers-reduced-motion: reduce) {
          .final-cta__overlay,
          .final-cta__modal,
          .final-cta__button-dot {
            animation: none;
          }
        }

        @media (max-width: 760px) {
          .final-cta__frame {
            flex-direction: column;
            align-items: flex-start;
          }
          .final-cta__action {
            align-items: flex-start;
            width: 100%;
          }
          .final-cta__contact {
            align-items: flex-start;
          }
          .final-cta__button {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 520px) {
          .final-cta__row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}