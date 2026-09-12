import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getJob, submitApplication } from '../../lib/api';

const MAX_RESUME_BYTES = 5 * 1024 * 1024; // keep in sync with backend/routes/applications.js

const EXPERIENCE_OPTIONS = [
  'Fresher',
  '0–1 years',
  '1–3 years',
  '3–5 years',
  '5–8 years',
  '8+ years',
];

const NOTICE_OPTIONS = ['Immediate', '15 days', '30 days', '60 days', '90 days', 'Other'];

const QUALIFICATION_OPTIONS = [
  'Diploma',
  "Bachelor's (B.E./B.Tech)",
  "Bachelor's (B.Sc./B.A./B.Com)",
  "Master's (M.E./M.Tech)",
  "Master's (M.Sc./MBA/Other)",
  'PhD',
  'Other',
];

const CURRENT_YEAR = new Date().getFullYear();
const PASSING_YEAR_OPTIONS = Array.from({ length: 45 }, (_, i) => CURRENT_YEAR - i);

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

// Small red asterisk appended to every required field's label.
function Req() {
  return <span className="apply__req">*</span>;
}

export default function Apply() {
  const { id } = useParams();
  const fileInputRef = useRef(null);

  const [job, setJob] = useState(null);
  const [jobState, setJobState] = useState('loading'); // loading | ready | notfound

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    company: '',
    experience: '',
    notice: '',
    qualification: '',
    passingYear: '',
    college: '',
    specialization: '',
    grade: '',
    message: '',
  });

  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [submitState, setSubmitState] = useState('idle'); // idle | submitting | done | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let cancelled = false;
    setJobState('loading');
    getJob(id)
      .then((data) => {
        if (!cancelled) {
          setJob(data);
          setJobState('ready');
        }
      })
      .catch(() => {
        if (!cancelled) setJobState('notfound');
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const companyRequired = form.experience !== '' && form.experience !== 'Fresher';

  const updateField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const applyFile = (candidate) => {
    if (!candidate) return;
    setErrorMsg('');
    if (candidate.size > MAX_RESUME_BYTES) {
      setErrorMsg('That file is larger than 5MB \u2014 please attach a smaller version.');
      return;
    }
    setFile(candidate);
    // keep the hidden native input in sync so a real <form> submit / FormData read works
    if (fileInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(candidate);
      fileInputRef.current.files = dt.files;
    }
  };

  const handleFileChange = (e) => applyFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    applyFile(e.dataTransfer.files?.[0]);
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!file) {
      setErrorMsg('Please attach your r\u00e9sum\u00e9 (PDF or Word).');
      return;
    }
    if (file.size > MAX_RESUME_BYTES) {
      setErrorMsg('That file is larger than 5MB \u2014 please attach a smaller version.');
      return;
    }

    const fd = new FormData();
    fd.append('job_id', id);
    fd.append('name', form.name);
    fd.append('email', form.email);
    fd.append('phone', form.phone);
    fd.append('linkedin', form.linkedin);
    fd.append('company', form.company);
    fd.append('experience', form.experience);
    fd.append('notice', form.notice);
    fd.append('qualification', form.qualification);
    fd.append('passing_year', form.passingYear);
    fd.append('college', form.college);
    fd.append('specialization', form.specialization);
    fd.append('grade', form.grade);
    fd.append('message', form.message);
    fd.append('resume', file);

    setSubmitState('submitting');
    try {
      await submitApplication(fd);
      setSubmitState('done');
    } catch (err) {
      setSubmitState('error');
      setErrorMsg(err.message || 'Something went wrong \u2014 please try again.');
    }
  };

  return (
    <div className="apply">
      <div className="apply__glow apply__glow--one" aria-hidden="true" />
      <div className="apply__glow apply__glow--two" aria-hidden="true" />
      <div className="apply__grid-bg" aria-hidden="true" />
      <div className="apply__container">
        <Link to="/careers" className="apply__back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
          All open roles
        </Link>

        {jobState === 'loading' && <div className="apply__status">Loading&hellip;</div>}

        {jobState === 'notfound' && (
          <div className="apply__status">
            We couldn&rsquo;t find that role &mdash; it may have closed. See{' '}
            <Link to="/careers">all open roles</Link>.
          </div>
        )}

        {jobState === 'ready' && submitState !== 'done' && (
          <>
            <p className="apply__eyebrow">Applying for</p>
            <h1 className="apply__heading">{job.title}</h1>
            <div className="apply__meta">
              {job.department && <span className="apply__tag">{job.department}</span>}
              {job.location && <span className="apply__tag">{job.location}</span>}
              {job.job_type && <span className="apply__tag">{job.job_type}</span>}
            </div>
            <p className="apply__job-desc">{job.description}</p>

            {job.requirements?.length > 0 && (
              <div className="apply__requirements">
                <p className="apply__requirements-title">What we&rsquo;re looking for</p>
                <ul className="apply__requirements-list">
                  {job.requirements.map((req, i) => (
                    <li key={i}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <form className="apply__form" onSubmit={handleSubmit}>
              <p className="apply__form-legend">Basic details</p>

              <div className="apply__field">
                <label htmlFor="name">Full name<Req /></label>
                <input id="name" type="text" required value={form.name} onChange={updateField('name')} />
              </div>

              <div className="apply__row">
                <div className="apply__field">
                  <label htmlFor="email">Email<Req /></label>
                  <input id="email" type="email" required value={form.email} onChange={updateField('email')} />
                </div>
                <div className="apply__field">
                  <label htmlFor="phone">Phone<Req /></label>
                  <input id="phone" type="tel" required value={form.phone} onChange={updateField('phone')} />
                </div>
              </div>

              <div className="apply__field">
                <label htmlFor="linkedin">LinkedIn / portfolio link<Req /></label>
                <input
                  id="linkedin"
                  type="url"
                  required
                  placeholder="https://linkedin.com/in/your-name"
                  value={form.linkedin}
                  onChange={updateField('linkedin')}
                />
              </div>

              <p className="apply__form-legend apply__form-legend--spaced">Education</p>

              <div className="apply__row">
                <div className="apply__field">
                  <label htmlFor="qualification">Highest qualification<Req /></label>
                  <select id="qualification" required value={form.qualification} onChange={updateField('qualification')}>
                    <option value="" disabled>
                      Select
                    </option>
                    {QUALIFICATION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="apply__field">
                  <label htmlFor="passingYear">Passing year<Req /></label>
                  <select id="passingYear" required value={form.passingYear} onChange={updateField('passingYear')}>
                    <option value="" disabled>
                      Select
                    </option>
                    {PASSING_YEAR_OPTIONS.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="apply__row">
                <div className="apply__field">
                  <label htmlFor="college">College / institute name<Req /></label>
                  <input id="college" type="text" required value={form.college} onChange={updateField('college')} />
                </div>
                <div className="apply__field">
                  <label htmlFor="specialization">Specialization / major<Req /></label>
                  <input
                    id="specialization"
                    type="text"
                    required
                    placeholder="e.g. Electronics & Communication"
                    value={form.specialization}
                    onChange={updateField('specialization')}
                  />
                </div>
              </div>

              <div className="apply__field">
                <label htmlFor="grade">Grade / CGPA / percentage<Req /></label>
                <input
                  id="grade"
                  type="text"
                  required
                  placeholder="e.g. 8.2 CGPA or 78%"
                  value={form.grade}
                  onChange={updateField('grade')}
                />
              </div>

              <p className="apply__form-legend apply__form-legend--spaced">Work details</p>

              <div className="apply__field">
                <label htmlFor="company">
                  Current / most recent company
                  {companyRequired ? <Req /> : <span className="apply__optional">(optional for freshers)</span>}
                </label>
                <input
                  id="company"
                  type="text"
                  required={companyRequired}
                  value={form.company}
                  onChange={updateField('company')}
                />
              </div>

              <div className="apply__row">
                <div className="apply__field">
                  <label htmlFor="experience">Total experience<Req /></label>
                  <select id="experience" required value={form.experience} onChange={updateField('experience')}>
                    <option value="" disabled>
                      Select
                    </option>
                    {EXPERIENCE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="apply__field">
                  <label htmlFor="notice">Notice period<Req /></label>
                  <select id="notice" required value={form.notice} onChange={updateField('notice')}>
                    <option value="" disabled>
                      Select
                    </option>
                    {NOTICE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="apply__field">
                <label htmlFor="message">
                  Cover note <span className="apply__optional">(optional)</span>
                </label>
                <textarea
                  id="message"
                  rows={4}
                  placeholder="Anything you'd like us to know — why this role, relevant projects, etc."
                  value={form.message}
                  onChange={updateField('message')}
                />
              </div>

              <div className="apply__field">
                <label htmlFor="resume">R&eacute;sum&eacute;<Req /></label>

                <div
                  className={`apply__dropzone ${isDragging ? 'apply__dropzone--active' : ''} ${file ? 'apply__dropzone--filled' : ''}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
                  }}
                >
                  <input
                    id="resume"
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                  />

                  {!file && (
                    <div className="apply__dropzone-empty">
                      <span className="apply__dropzone-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
                          <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                        </svg>
                      </span>
                      <span className="apply__dropzone-title">
                        <strong>Click to upload</strong> or drag and drop
                      </span>
                      <span className="apply__dropzone-hint">PDF or Word, up to 5MB</span>
                    </div>
                  )}

                  {file && (
                    <div className="apply__dropzone-filled">
                      <span className="apply__file-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                          <path d="M14 2v6h6" />
                        </svg>
                      </span>
                      <span className="apply__file-info">
                        <span className="apply__file-name">{file.name}</span>
                        <span className="apply__file-size">{formatBytes(file.size)}</span>
                      </span>
                      <button
                        type="button"
                        className="apply__file-remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile();
                        }}
                        aria-label="Remove file"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {errorMsg && <p className="apply__error">{errorMsg}</p>}

              <button type="submit" className="apply__submit" disabled={submitState === 'submitting'}>
                {submitState === 'submitting' ? 'Submitting\u2026' : 'Submit application'}
              </button>
            </form>
          </>
        )}

        {submitState === 'done' && (
          <div className="apply__done">
            <h1 className="apply__heading">Application received</h1>
            <p className="apply__job-desc">
              Thanks for applying to <strong>{job?.title}</strong>. Our team reviews every application
              and will reach out if it&rsquo;s a fit.
            </p>
            <Link to="/careers" className="apply__back apply__back--inline">
              See other open roles
            </Link>
          </div>
        )}
      </div>

      <style>{`
        .apply {
          position: relative;
          overflow: hidden;
          padding: clamp(40px, 6vw, 72px) 0 clamp(64px, 9vw, 100px);
          background:
            radial-gradient(1300px 620px at 8% -14%, rgba(201, 151, 44, 0.16), transparent 60%),
            radial-gradient(1100px 560px at 102% -4%, rgba(27, 75, 115, 0.24), transparent 60%),
            radial-gradient(900px 500px at 50% 110%, rgba(11, 30, 61, 0.08), transparent 65%),
            linear-gradient(180deg, #e7eff8 0%, #f2f7fc 45%, #ffffff 100%);
        }

        .apply::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 0;
          opacity: 0.05;
          mix-blend-mode: overlay;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        .apply__glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          z-index: 0;
        }

        .apply__glow--one {
          top: -160px;
          left: -120px;
          width: 440px;
          height: 440px;
          background: radial-gradient(circle, rgba(201, 151, 44, 0.32), transparent 70%);
        }

        .apply__glow--two {
          top: -60px;
          right: -140px;
          width: 480px;
          height: 480px;
          background: radial-gradient(circle, rgba(27, 75, 115, 0.3), transparent 70%);
        }

        .apply__grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(11, 30, 61, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(11, 30, 61, 0.08) 1px, transparent 1px);
          background-size: 56px 56px;
          -webkit-mask-image: radial-gradient(900px 460px at 25% 0%, #000 0%, transparent 75%);
          mask-image: radial-gradient(900px 460px at 25% 0%, #000 0%, transparent 75%);
          opacity: 0.55;
          pointer-events: none;
          z-index: 0;
        }

        .apply__container {
          position: relative;
          z-index: 1;
        }

        .apply__container {
          max-width: 680px;
          margin: 0 auto;
          padding: 0 clamp(20px, 4vw, 56px);
        }

        .apply__back {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 28px;
          font-family: var(--font-body);
          font-size: 13.5px;
          font-weight: 600;
          color: var(--color-steel);
        }

        .apply__back svg {
          width: 15px;
          height: 15px;
        }

        .apply__back--inline {
          margin-top: 22px;
          margin-bottom: 0;
        }

        .apply__status {
          font-family: var(--font-body);
          font-size: 15px;
          color: var(--color-text-muted);
        }

        .apply__status a {
          color: var(--color-steel);
          font-weight: 600;
          text-decoration: underline;
        }

        .apply__eyebrow {
          margin: 0 0 6px;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          color: var(--color-gold);
        }

        .apply__heading {
          margin: 0;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: clamp(24px, 3vw, 30px);
          line-height: 1.3;
          color: var(--color-navy-deep);
        }

        .apply__meta {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin: 14px 0 0;
        }

        .apply__tag {
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 600;
          color: var(--color-steel);
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(27, 75, 115, 0.08);
          transition: background 0.2s ease, transform 0.2s ease;
        }

        .apply__tag:hover {
          background: rgba(201, 151, 44, 0.16);
          transform: translateY(-1px);
        }

        .apply__job-desc {
          margin: 18px 0 0;
          font-family: var(--font-body);
          font-size: 14.5px;
          line-height: 1.7;
          color: var(--color-text-muted);
        }

        /* ---------- Requirements ---------- */
        .apply__requirements {
          margin: 26px 0 0;
          padding: 22px 24px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.75), rgba(240, 246, 252, 0.55));
          backdrop-filter: blur(10px) saturate(140%);
          -webkit-backdrop-filter: blur(10px) saturate(140%);
          border: 1px solid var(--color-border);
          border-left: 3px solid var(--color-gold);
          border-radius: 12px;
          box-shadow: 0 14px 32px -24px rgba(11, 30, 61, 0.3);
        }

        .apply__requirements-title {
          margin: 0 0 12px;
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-gold);
        }

        .apply__requirements-list {
          margin: 0;
          padding: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .apply__requirements-list li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-family: var(--font-body);
          font-size: 14px;
          line-height: 1.55;
          color: var(--color-text-main);
        }

        .apply__requirements-list svg {
          flex: none;
          width: 16px;
          height: 16px;
          margin-top: 2px;
          color: var(--color-steel);
        }

        /* ---------- Form ---------- */
        .apply__form {
          position: relative;
          margin-top: 34px;
          padding: 30px;
          background:
            linear-gradient(155deg, rgba(255, 255, 255, 0.96), rgba(240, 246, 252, 0.9)),
            var(--color-surface);
          backdrop-filter: blur(10px) saturate(140%);
          -webkit-backdrop-filter: blur(10px) saturate(140%);
          border: 1px solid var(--color-border);
          border-radius: 16px;
          box-shadow: 0 24px 56px -30px rgba(11, 30, 61, 0.4), 0 0 0 1px rgba(201, 151, 44, 0.05);
          transition: box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
          gap: 18px;
          overflow: hidden;
        }

        .apply__form:focus-within {
          box-shadow: 0 28px 64px -28px rgba(11, 30, 61, 0.45), 0 0 0 1px rgba(201, 151, 44, 0.16);
        }

        .apply__form::before {
          content: '';
          position: absolute;
          inset: 0 0 auto 0;
          height: 3px;
          background: linear-gradient(90deg, var(--color-gold), var(--color-steel), var(--color-gold));
        }

        .apply__form-legend {
          margin: 0;
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-gold);
        }

        .apply__form-legend--spaced {
          margin-top: 6px;
          padding-top: 18px;
          border-top: 1px solid var(--color-border);
        }

        .apply__row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .apply__field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .apply__field label {
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          color: var(--color-navy-deep);
        }

        .apply__req {
          margin-left: 3px;
          color: #c0392b;
          font-weight: 700;
        }

        .apply__optional {
          margin-left: 6px;
          font-size: 11.5px;
          font-weight: 500;
          color: var(--color-text-muted);
          text-transform: none;
        }

        .apply__field input[type="text"],
        .apply__field input[type="email"],
        .apply__field input[type="tel"],
        .apply__field input[type="url"],
        .apply__field select,
        .apply__field textarea {
          font-family: var(--font-body);
          font-size: 14.5px;
          color: var(--color-text-main);
          padding: 11px 13px;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          background: var(--color-bg);
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }

        .apply__field input:hover:not(:focus),
        .apply__field select:hover:not(:focus),
        .apply__field textarea:hover:not(:focus) {
          border-color: var(--color-gold-light);
          background: #fff;
        }

        .apply__field select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231B4B73' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 16px;
          padding-right: 36px;
          cursor: pointer;
        }

        .apply__field textarea {
          resize: vertical;
          font-family: var(--font-body);
        }

        .apply__field input:focus,
        .apply__field select:focus,
        .apply__field textarea:focus {
          border-color: var(--color-gold);
          box-shadow: 0 0 0 3px rgba(201, 151, 44, 0.15);
        }

        /* ---------- Résumé dropzone ---------- */
        .apply__dropzone {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 118px;
          padding: 20px;
          border-radius: 12px;
          border: 1.5px dashed var(--color-border);
          background: linear-gradient(180deg, rgba(240, 246, 252, 0.6), rgba(240, 246, 252, 0.3));
          cursor: pointer;
          transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
        }

        .apply__dropzone:hover {
          border-color: var(--color-gold-light);
          background: rgba(201, 151, 44, 0.06);
        }

        .apply__dropzone--active {
          border-color: var(--color-gold);
          background: rgba(201, 151, 44, 0.1);
          box-shadow: 0 0 0 4px rgba(201, 151, 44, 0.12);
        }

        .apply__dropzone--filled {
          border-style: solid;
          border-color: rgba(27, 75, 115, 0.25);
          background: var(--color-bg);
          cursor: default;
        }

        .apply__dropzone input[type="file"] {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip: rect(0 0 0 0);
        }

        .apply__dropzone-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          text-align: center;
        }

        .apply__dropzone-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 999px;
          margin-bottom: 4px;
          color: var(--color-steel);
          background: rgba(27, 75, 115, 0.1);
        }

        .apply__dropzone-icon svg {
          width: 19px;
          height: 19px;
        }

        .apply__dropzone-title {
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--color-text-main);
        }

        .apply__dropzone-title strong {
          color: var(--color-steel);
          font-weight: 700;
        }

        .apply__dropzone-hint {
          font-family: var(--font-body);
          font-size: 12.5px;
          color: var(--color-text-muted);
        }

        .apply__dropzone-filled {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
        }

        .apply__file-icon {
          flex: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          color: var(--color-steel);
          background: rgba(27, 75, 115, 0.1);
        }

        .apply__file-icon svg {
          width: 19px;
          height: 19px;
        }

        .apply__file-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .apply__file-name {
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 600;
          color: var(--color-navy-deep);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .apply__file-size {
          font-family: var(--font-body);
          font-size: 12px;
          color: var(--color-text-muted);
        }

        .apply__file-remove {
          flex: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 999px;
          border: 1px solid var(--color-border);
          background: var(--color-surface);
          color: var(--color-text-muted);
          cursor: pointer;
          transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
        }

        .apply__file-remove svg {
          width: 14px;
          height: 14px;
        }

        .apply__file-remove:hover {
          border-color: #9c3b2f;
          color: #9c3b2f;
          background: rgba(156, 59, 47, 0.08);
        }

        .apply__error {
          margin: 0;
          font-family: var(--font-body);
          font-size: 13.5px;
          color: #9c3b2f;
        }

        .apply__submit {
          align-self: flex-start;
          border: none;
          border-radius: 999px;
          color: #fff;
          font-family: var(--font-body);
          font-size: 14.5px;
          font-weight: 600;
          padding: 13px 26px;
          background: linear-gradient(135deg, var(--color-navy-deep), var(--color-steel));
          box-shadow: 0 4px 14px rgba(11, 30, 61, 0.25);
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
        }

        .apply__submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(11, 30, 61, 0.35);
        }

        .apply__submit:disabled {
          opacity: 0.65;
          cursor: default;
        }

        @media (max-width: 560px) {
          .apply__row {
            grid-template-columns: 1fr;
          }
          .apply__form {
            padding: 22px;
          }
          .apply__requirements {
            padding: 18px;
          }
          .apply__glow--one,
          .apply__glow--two {
            width: 240px;
            height: 240px;
            filter: blur(60px);
          }
          .apply__dropzone {
            padding: 16px;
            min-height: 100px;
          }
        }
      `}</style>
    </div>
  );
}