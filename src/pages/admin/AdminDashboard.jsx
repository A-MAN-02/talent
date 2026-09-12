import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  clearAdminToken,
  createJob,
  deleteJob,
  downloadResume,
  getAdminToken,
  getAllJobsAdmin,
  getApplications,
  updateApplicationStatus,
  updateJob,
} from '../../lib/api';

const EMPTY_JOB = {
  title: '',
  department: '',
  location: '',
  job_type: '',
  description: '',
  requirements: [''],
  status: 'active',
};
const APP_STATUSES = ['new', 'shortlisted', 'rejected', 'hired'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = getAdminToken();

  const [tab, setTab] = useState('jobs'); // jobs | applications

  const [jobs, setJobs] = useState([]);
  const [jobsState, setJobsState] = useState('loading');
  const [jobForm, setJobForm] = useState(null); // null = hidden, object = editing/creating
  const [savingJob, setSavingJob] = useState(false);
  const [jobError, setJobError] = useState('');

  const [applications, setApplications] = useState([]);
  const [appsState, setAppsState] = useState('loading');
  const [appError, setAppError] = useState('');
  const [viewingApp, setViewingApp] = useState(null); // the application currently shown in the detail card

  const loadJobs = () => {
    setJobsState('loading');
    getAllJobsAdmin(token)
      .then((data) => {
        setJobs(data);
        setJobsState('ready');
      })
      .catch(() => setJobsState('error'));
  };

  const loadApplications = () => {
    setAppsState('loading');
    getApplications(token)
      .then((data) => {
        setApplications(data);
        setAppsState('ready');
      })
      .catch(() => setAppsState('error'));
  };

  useEffect(() => {
    loadJobs();
    loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    clearAdminToken();
    navigate('/admin/login');
  };

  // ---------- Jobs ----------

  const openNewJobForm = () => {
    setJobError('');
    setJobForm({ ...EMPTY_JOB });
  };

  const openEditJobForm = (job) => {
    setJobError('');
    // requirements is a flat array on the job record — edit it as
    // individual list rows, always with at least one (blank) row to fill.
    const reqs = job.requirements && job.requirements.length ? [...job.requirements] : [''];
    setJobForm({ ...job, requirements: reqs });
  };

  const closeJobForm = () => setJobForm(null);

  const handleJobFieldChange = (field) => (e) =>
    setJobForm((f) => ({ ...f, [field]: e.target.value }));

  const handleRequirementChange = (index) => (e) => {
    const value = e.target.value;
    setJobForm((f) => {
      const next = [...f.requirements];
      next[index] = value;
      return { ...f, requirements: next };
    });
  };

  const addRequirementRow = () => {
    setJobForm((f) => ({ ...f, requirements: [...f.requirements, ''] }));
  };

  const removeRequirementRow = (index) => {
    setJobForm((f) => {
      const next = f.requirements.filter((_, i) => i !== index);
      return { ...f, requirements: next.length ? next : [''] };
    });
  };

  // Enter in a requirement row adds the next row and focuses it, so the
  // list can be filled out without reaching for the mouse each time.
  const handleRequirementKeyDown = (index) => (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (index === jobForm.requirements.length - 1) {
      addRequirementRow();
      requestAnimationFrame(() => {
        const inputs = document.querySelectorAll('.dash__req-row input');
        inputs[inputs.length - 1]?.focus();
      });
    } else {
      const inputs = document.querySelectorAll('.dash__req-row input');
      inputs[index + 1]?.focus();
    }
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    setJobError('');
    setSavingJob(true);

    // Drop blank rows before saving.
    const payload = {
      ...jobForm,
      requirements: (jobForm.requirements || []).map((r) => r.trim()).filter(Boolean),
    };

    try {
      if (payload.id) {
        await updateJob(token, payload.id, payload);
      } else {
        await createJob(token, payload);
      }
      setJobForm(null);
      loadJobs();
    } catch (err) {
      setJobError(err.message || 'Could not save this job');
    } finally {
      setSavingJob(false);
    }
  };

  const handleDeleteJob = async (job) => {
    if (!window.confirm(`Delete "${job.title}"? This can't be undone.`)) return;

    try {
      await deleteJob(token, job.id);
      loadJobs();
    } catch (err) {
      alert(err.message || 'Could not delete this job');
    }
  };

  const handleToggleStatus = async (job) => {
    const nextStatus = job.status === 'active' ? 'closed' : 'active';

    try {
      await updateJob(token, job.id, { status: nextStatus });
      loadJobs();
    } catch (err) {
      alert(err.message || 'Could not update this job');
    }
  };

  // ---------- Applications ----------

  const handleStatusChange = async (application, status) => {
    try {
      await updateApplicationStatus(token, application.id, status);
      setApplications((rows) => rows.map((r) => (r.id === application.id ? { ...r, status } : r)));
    } catch (err) {
      alert(err.message || 'Could not update status');
    }
  };

  const handleDownload = async (application) => {
    try {
      await downloadResume(token, application.id, application.resume_filename);
    } catch (err) {
      alert(err.message || 'Could not download resume');
    }
  };

  const openViewApp = (application) => setViewingApp(application);
  const closeViewApp = () => setViewingApp(null);

  return (
    <div className="dash">
      <div className="dash__glow dash__glow--one" aria-hidden="true" />
      <div className="dash__glow dash__glow--two" aria-hidden="true" />
      <div className="dash__grid-bg" aria-hidden="true" />
      <div className="dash__noise" aria-hidden="true" />
      <div className="dash__container">
        <div className="dash__header">
          <div>
            <p className="dash__eyebrow">
              <span className="dash__eyebrow-dot" aria-hidden="true" />
              Admin
            </p>
            <h1 className="dash__heading">Career portal</h1>
          </div>
          <button type="button" className="dash__logout" onClick={handleLogout}>
            Log out
          </button>
        </div>

        <div className="dash__tabs">
          <button
            type="button"
            className={`dash__tab ${tab === 'jobs' ? 'dash__tab--active' : ''}`}
            onClick={() => setTab('jobs')}
          >
            Jobs
          </button>
          <button
            type="button"
            className={`dash__tab ${tab === 'applications' ? 'dash__tab--active' : ''}`}
            onClick={() => setTab('applications')}
          >
            Applications
            {applications.length > 0 && <span className="dash__tab-count">{applications.length}</span>}
          </button>
        </div>

        {/* ---------- Jobs tab ---------- */}
        {tab === 'jobs' && (
          <div className="dash__panel">
            <div className="dash__panel-head">
              <p className="dash__panel-sub">
                {jobsState === 'ready' ? `${jobs.length} job${jobs.length === 1 ? '' : 's'}` : '\u00a0'}
              </p>
              <button type="button" className="dash__btn dash__btn--primary" onClick={openNewJobForm}>
                Add job
              </button>
            </div>

            {jobsState === 'loading' && <p className="dash__status">Loading&hellip;</p>}
            {jobsState === 'error' && <p className="dash__status dash__status--error">Couldn&rsquo;t load jobs.</p>}
            {jobsState === 'ready' && jobs.length === 0 && (
              <p className="dash__status">No jobs yet &mdash; add your first one above.</p>
            )}

            {jobsState === 'ready' && jobs.length > 0 && (
              <div className="dash__job-list">
                {jobs.map((job) => (
                  <div className="dash__job-row" data-status={job.status} key={job.id}>
                    <div className="dash__job-info">
                      <div className="dash__job-title-row">
                        <span className="dash__job-title">{job.title}</span>
                        <span className={`dash__status-pill dash__status-pill--${job.status}`}>
                          {job.status === 'active' ? 'Open' : 'Closed'}
                        </span>
                      </div>
                      <span className="dash__job-meta">
                        {[job.department, job.location, job.job_type].filter(Boolean).join(' \u00b7 ') || '\u2014'}
                      </span>
                    </div>
                    <div className="dash__job-actions">
                      <button type="button" className="dash__link-btn" onClick={() => handleToggleStatus(job)}>
                        {job.status === 'active' ? 'Close' : 'Reopen'}
                      </button>
                      <button type="button" className="dash__link-btn" onClick={() => openEditJobForm(job)}>
                        Edit
                      </button>
                      <button type="button" className="dash__link-btn dash__link-btn--danger" onClick={() => handleDeleteJob(job)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---------- Applications tab ---------- */}
        {tab === 'applications' && (
          <div className="dash__panel">
            <p className="dash__panel-sub">
              {appsState === 'ready' ? `${applications.length} application${applications.length === 1 ? '' : 's'}` : '\u00a0'}
            </p>

            {appsState === 'loading' && <p className="dash__status">Loading&hellip;</p>}
            {appsState === 'error' && <p className="dash__status dash__status--error">Couldn&rsquo;t load applications.</p>}
            {appsState === 'ready' && applications.length === 0 && (
              <p className="dash__status">No applications yet.</p>
            )}

            {appsState === 'ready' && applications.length > 0 && (
              <div className="dash__app-list">
                {applications.map((app) => (
                  <div className="dash__app-row" key={app.id}>
                    <div className="dash__app-info">
                      <div className="dash__job-title-row">
                        <span className="dash__job-title">{app.name}</span>
                        <select
                          className={`dash__status-select dash__status-pill--${app.status}`}
                          value={app.status}
                          onChange={(e) => handleStatusChange(app, e.target.value)}
                        >
                          {APP_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <span className="dash__job-meta">
                        Applied for <strong>{app.job_title}</strong> &middot; {app.email}
                        {app.phone ? ` \u00b7 ${app.phone}` : ''}
                      </span>
                      {app.message && <p className="dash__app-message">{app.message}</p>}
                    </div>
                    <div className="dash__job-actions">
                      <button type="button" className="dash__link-btn" onClick={() => openViewApp(app)}>
                        View
                      </button>
                      <button type="button" className="dash__link-btn" onClick={() => handleDownload(app)}>
                        Download r&eacute;sum&eacute;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ---------- Application detail card ---------- */}
      {viewingApp && (
        <div className="dash__modal-backdrop" onClick={closeViewApp}>
          <div className="dash__modal" onClick={(e) => e.stopPropagation()}>
            <div className="dash__view-head">
              <h2 className="dash__modal-heading">{viewingApp.name}</h2>
              <span className={`dash__status-pill dash__status-pill--${viewingApp.status}`}>
                {viewingApp.status.charAt(0).toUpperCase() + viewingApp.status.slice(1)}
              </span>
            </div>

            <p className="dash__view-section-title">Basic details</p>
            <div className="dash__view-grid">
              <div className="dash__view-item">
                <span className="dash__view-label">Applied for</span>
                <span className="dash__view-value">{viewingApp.job_title || '\u2014'}</span>
              </div>
              <div className="dash__view-item">
                <span className="dash__view-label">Email</span>
                <span className="dash__view-value">{viewingApp.email || '\u2014'}</span>
              </div>
              <div className="dash__view-item">
                <span className="dash__view-label">Phone</span>
                <span className="dash__view-value">{viewingApp.phone || '\u2014'}</span>
              </div>
              <div className="dash__view-item">
                <span className="dash__view-label">LinkedIn / portfolio</span>
                {viewingApp.linkedin ? (
                  <a className="dash__view-link" href={viewingApp.linkedin} target="_blank" rel="noreferrer">
                    {viewingApp.linkedin}
                  </a>
                ) : (
                  <span className="dash__view-value">&mdash;</span>
                )}
              </div>
            </div>

            <p className="dash__view-section-title dash__view-section-title--spaced">Education</p>
            <div className="dash__view-grid">
              <div className="dash__view-item">
                <span className="dash__view-label">Highest qualification</span>
                <span className="dash__view-value">{viewingApp.qualification || '\u2014'}</span>
              </div>
              <div className="dash__view-item">
                <span className="dash__view-label">Passing year</span>
                <span className="dash__view-value">{viewingApp.passing_year || '\u2014'}</span>
              </div>
              <div className="dash__view-item">
                <span className="dash__view-label">College / institute</span>
                <span className="dash__view-value">{viewingApp.college || '\u2014'}</span>
              </div>
              <div className="dash__view-item">
                <span className="dash__view-label">Specialization</span>
                <span className="dash__view-value">{viewingApp.specialization || '\u2014'}</span>
              </div>
              <div className="dash__view-item">
                <span className="dash__view-label">Grade / CGPA</span>
                <span className="dash__view-value">{viewingApp.grade || '\u2014'}</span>
              </div>
            </div>

            <p className="dash__view-section-title dash__view-section-title--spaced">Work details</p>
            <div className="dash__view-grid">
              <div className="dash__view-item">
                <span className="dash__view-label">Current / most recent company</span>
                <span className="dash__view-value">{viewingApp.company || '\u2014'}</span>
              </div>
              <div className="dash__view-item">
                <span className="dash__view-label">Total experience</span>
                <span className="dash__view-value">{viewingApp.experience || '\u2014'}</span>
              </div>
              <div className="dash__view-item">
                <span className="dash__view-label">Notice period</span>
                <span className="dash__view-value">{viewingApp.notice || '\u2014'}</span>
              </div>
              <div className="dash__view-item">
                <span className="dash__view-label">R&eacute;sum&eacute;</span>
                <span className="dash__view-value">{viewingApp.resume_filename || '\u2014'}</span>
              </div>
            </div>

            <div className="dash__view-message">
              <span className="dash__view-label">Cover note</span>
              <p>{viewingApp.message || 'No cover note left with this application.'}</p>
            </div>

            <div className="dash__modal-actions">
              <button type="button" className="dash__btn" onClick={() => handleDownload(viewingApp)}>
                Download r&eacute;sum&eacute;
              </button>
              <button type="button" className="dash__btn dash__btn--primary" onClick={closeViewApp}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Job add/edit modal ---------- */}
      {jobForm && (
        <div className="dash__modal-backdrop" onClick={closeJobForm}>
          <form className="dash__modal" onClick={(e) => e.stopPropagation()} onSubmit={handleJobSubmit}>
            <h2 className="dash__modal-heading">{jobForm.id ? 'Edit job' : 'Add job'}</h2>

            <div className="dash__field">
              <label>Title</label>
              <input type="text" required value={jobForm.title} onChange={handleJobFieldChange('title')} />
            </div>

            <div className="dash__field-row">
              <div className="dash__field">
                <label>Department</label>
                <input type="text" value={jobForm.department || ''} onChange={handleJobFieldChange('department')} />
              </div>
              <div className="dash__field">
                <label>Location</label>
                <input type="text" value={jobForm.location || ''} onChange={handleJobFieldChange('location')} />
              </div>
            </div>

            <div className="dash__field-row">
              <div className="dash__field">
                <label>Job type</label>
                <input
                  type="text"
                  placeholder="Full-time, Contract\u2026"
                  value={jobForm.job_type || ''}
                  onChange={handleJobFieldChange('job_type')}
                />
              </div>
              <div className="dash__field">
                <label>Status</label>
                <select value={jobForm.status} onChange={handleJobFieldChange('status')}>
                  <option value="active">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="dash__field">
              <label>Description</label>
              <textarea rows={6} required value={jobForm.description} onChange={handleJobFieldChange('description')} />
            </div>

            <div className="dash__field">
              <label>
                Requirements <span className="dash__field-hint">(shown as &ldquo;What we&rsquo;re looking for&rdquo; on the apply page)</span>
              </label>

              <div className="dash__req-list">
                {jobForm.requirements.map((req, i) => (
                  <div className="dash__req-row" key={i}>
                    <span className="dash__req-bullet" aria-hidden="true" />
                    <input
                      type="text"
                      placeholder="e.g. B.E./B.Tech in a related field"
                      value={req}
                      required={i === 0}
                      onChange={handleRequirementChange(i)}
                      onKeyDown={handleRequirementKeyDown(i)}
                    />
                    <button
                      type="button"
                      className="dash__req-remove"
                      onClick={() => removeRequirementRow(i)}
                      disabled={jobForm.requirements.length === 1}
                      aria-label="Remove this requirement"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <button type="button" className="dash__req-add" onClick={addRequirementRow}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add requirement
              </button>
            </div>

            {jobError && <p className="dash__form-error">{jobError}</p>}

            <div className="dash__modal-actions">
              <button type="button" className="dash__btn" onClick={closeJobForm}>
                Cancel
              </button>
              <button type="submit" className="dash__btn dash__btn--primary" disabled={savingJob}>
                {savingJob ? 'Saving\u2026' : 'Save job'}
              </button>
            </div>
          </form>
        </div>
      )}

      <style>{`
        .dash {
          position: relative;
          overflow: hidden;
          padding: clamp(32px, 5vw, 56px) 0 96px;
          min-height: calc(100vh - 78px);
          background:
            radial-gradient(1000px 500px at 8% -12%, rgba(201, 151, 44, 0.12), transparent 60%),
            radial-gradient(900px 460px at 95% 0%, rgba(27, 75, 115, 0.16), transparent 60%),
            linear-gradient(180deg, #eef3f9 0%, #f7fafd 45%, #ffffff 100%);
        }

        .dash__glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }

        .dash__glow--one {
          top: -120px;
          left: -90px;
          width: 360px;
          height: 360px;
          background: radial-gradient(circle, rgba(201, 151, 44, 0.24), transparent 70%);
        }

        .dash__glow--two {
          top: -60px;
          right: -110px;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(27, 75, 115, 0.22), transparent 70%);
        }

        .dash__grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(11, 30, 61, 0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(11, 30, 61, 0.07) 1px, transparent 1px);
          background-size: 56px 56px;
          -webkit-mask-image: radial-gradient(900px 440px at 15% 0%, #000 0%, transparent 75%);
          mask-image: radial-gradient(900px 440px at 15% 0%, #000 0%, transparent 75%);
          opacity: 0.6;
          pointer-events: none;
          z-index: 0;
        }

        .dash__noise {
          position: absolute;
          inset: 0;
          z-index: 0;
          opacity: 0.045;
          mix-blend-mode: overlay;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        .dash__container {
          position: relative;
          z-index: 2;
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 clamp(20px, 4vw, 56px);
        }

        .dash__header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 28px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--color-border);
        }

        .dash__eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 6px;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          color: var(--color-gold);
        }

        .dash__eyebrow-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-gold);
          display: inline-block;
        }

        .dash__heading {
          margin: 0;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: clamp(24px, 3.4vw, 32px);
          color: var(--color-navy-deep);
        }

        .dash__logout {
          flex: none;
          font-family: var(--font-body);
          font-size: 13.5px;
          font-weight: 600;
          color: var(--color-text-muted);
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 999px;
          padding: 9px 18px;
          cursor: pointer;
          box-shadow: 0 2px 8px -4px rgba(11, 30, 61, 0.12);
          transition: border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
        }

        .dash__logout:hover {
          border-color: var(--color-steel);
          color: var(--color-steel);
          box-shadow: 0 6px 16px -6px rgba(11, 30, 61, 0.22);
          transform: translateY(-1px);
        }

        .dash__tabs {
          display: flex;
          gap: 6px;
          background: rgba(11, 30, 61, 0.05);
          border: 1px solid var(--color-border);
          border-radius: 999px;
          padding: 5px;
          margin-bottom: 24px;
          width: fit-content;
        }

        .dash__tab {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text-muted);
          background: none;
          border: none;
          border-radius: 999px;
          padding: 9px 18px;
          cursor: pointer;
          transition: color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
        }

        .dash__tab--active {
          color: var(--color-navy-deep);
          background: var(--color-surface);
          box-shadow: 0 4px 14px -6px rgba(11, 30, 61, 0.25);
        }

        .dash__tab-count {
          font-size: 11.5px;
          font-weight: 700;
          color: var(--color-steel);
          background: rgba(27, 75, 115, 0.1);
          border-radius: 999px;
          padding: 1px 7px;
        }

        .dash__tab--active .dash__tab-count {
          color: #fff;
          background: var(--color-gold);
        }

        .dash__panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .dash__panel-sub {
          margin: 0 0 16px;
          font-family: var(--font-body);
          font-size: 13px;
          color: var(--color-text-muted);
        }

        .dash__panel-head .dash__panel-sub {
          margin: 0;
        }

        .dash__status {
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--color-text-muted);
          padding: 24px 0;
        }

        .dash__status--error {
          color: #9c3b2f;
        }

        .dash__btn {
          font-family: var(--font-body);
          font-size: 13.5px;
          font-weight: 600;
          padding: 9px 16px;
          border-radius: 999px;
          border: 1px solid var(--color-border);
          background: var(--color-surface);
          color: var(--color-navy-deep);
          cursor: pointer;
          transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
        }

        .dash__btn--primary {
          border: none;
          color: #fff;
          padding: 10px 20px;
          background: linear-gradient(135deg, var(--color-navy-deep), var(--color-steel));
          box-shadow: 0 6px 18px -6px rgba(11, 30, 61, 0.45);
        }

        .dash__btn--primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px -8px rgba(11, 30, 61, 0.5);
        }

        .dash__btn:disabled {
          opacity: 0.6;
          cursor: default;
        }

        /* ---------- Job / application rows ---------- */
        .dash__job-list,
        .dash__app-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .dash__job-row,
        .dash__app-row {
          position: relative;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          padding: 18px 20px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-left: 3px solid transparent;
          border-radius: 12px;
          box-shadow: 0 2px 10px -5px rgba(11, 30, 61, 0.14);
          flex-wrap: wrap;
          transition: box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease;
        }

        .dash__job-row:hover,
        .dash__app-row:hover {
          box-shadow: 0 16px 32px -18px rgba(11, 30, 61, 0.32);
          transform: translateY(-2px);
        }

        .dash__job-row[data-status='active'] {
          border-left-color: var(--color-gold);
        }

        .dash__job-row[data-status='closed'] {
          border-left-color: var(--color-border);
        }

        .dash__job-info,
        .dash__app-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 240px;
        }

        .dash__job-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .dash__job-title {
          font-family: var(--font-body);
          font-size: 15px;
          font-weight: 700;
          color: var(--color-navy-deep);
        }

        .dash__job-meta {
          font-family: var(--font-body);
          font-size: 13px;
          color: var(--color-text-muted);
        }

        .dash__app-message {
          margin: 6px 0 0;
          font-family: var(--font-body);
          font-size: 13px;
          font-style: italic;
          color: var(--color-text-muted);
          max-width: 60ch;
        }

        .dash__job-actions {
          display: flex;
          align-items: center;
          gap: 14px;
          flex: none;
        }

        .dash__link-btn {
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          color: var(--color-steel);
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
        }

        .dash__link-btn:hover {
          text-decoration: underline;
        }

        .dash__link-btn--danger {
          color: #9c3b2f;
        }

        .dash__status-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-family: var(--font-body);
          font-size: 11.5px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 999px;
        }

        .dash__status-pill::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
          display: inline-block;
        }

        .dash__status-pill--active,
        .dash__status-pill--new {
          background: rgba(27, 75, 115, 0.1);
          color: var(--color-steel);
        }

        .dash__status-pill--closed,
        .dash__status-pill--rejected {
          background: rgba(11, 30, 61, 0.08);
          color: var(--color-text-muted);
        }

        .dash__status-pill--shortlisted {
          background: rgba(201, 151, 44, 0.14);
          color: var(--color-gold);
        }

        .dash__status-pill--hired {
          background: rgba(46, 125, 76, 0.12);
          color: #2e7d4c;
        }

        select.dash__status-select {
          font-family: var(--font-body);
          font-size: 11.5px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
        }

        /* ---------- Modal ---------- */
        .dash__modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(11, 30, 61, 0.5);
          backdrop-filter: blur(3px);
          -webkit-backdrop-filter: blur(3px);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 48px 20px;
          overflow-y: auto;
          z-index: 100;
        }

        .dash__modal {
          width: 100%;
          max-width: 560px;
          background: var(--color-surface);
          border-radius: 16px;
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: 0 40px 80px -30px rgba(11, 30, 61, 0.55);
        }

        .dash__modal-heading {
          margin: 0;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 21px;
          color: var(--color-navy-deep);
        }

        /* ---------- Application detail card ---------- */
        .dash__view-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--color-border);
        }

        .dash__view-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px 20px;
        }

        .dash__view-section-title {
          margin: 0;
          font-family: var(--font-body);
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-gold);
        }

        .dash__view-section-title--spaced {
          padding-top: 4px;
          border-top: 1px solid var(--color-border);
        }

        .dash__view-link {
          font-family: var(--font-body);
          font-size: 13.5px;
          font-weight: 600;
          color: var(--color-steel);
          text-decoration: underline;
          word-break: break-all;
        }

        .dash__view-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .dash__view-label {
          font-family: var(--font-body);
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          color: var(--color-text-muted);
        }

        .dash__view-value {
          font-family: var(--font-body);
          font-size: 14.5px;
          font-weight: 600;
          color: var(--color-navy-deep);
        }

        .dash__view-message {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 14px 16px;
          background: var(--color-bg);
          border-radius: 10px;
        }

        .dash__view-message p {
          margin: 0;
          font-family: var(--font-body);
          font-size: 14px;
          line-height: 1.6;
          font-style: italic;
          color: var(--color-text-main);
        }

        .dash__field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .dash__field-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .dash__field label {
          font-family: var(--font-body);
          font-size: 12.5px;
          font-weight: 600;
          color: var(--color-navy-deep);
        }

        .dash__field-hint {
          font-weight: 500;
          text-transform: none;
          letter-spacing: normal;
          color: var(--color-text-muted);
        }

        /* ---------- Requirements list builder ---------- */
        .dash__req-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .dash__req-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dash__req-bullet {
          flex: none;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-gold);
        }

        .dash__req-row input {
          flex: 1;
          min-width: 0;
          font-family: var(--font-body);
          font-size: 14px;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          background: var(--color-bg);
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .dash__req-row input:focus {
          border-color: var(--color-gold);
          box-shadow: 0 0 0 3px rgba(201, 151, 44, 0.15);
        }

        .dash__req-row input:hover:not(:focus) {
          border-color: var(--color-gold-light);
        }

        .dash__req-remove {
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

        .dash__req-remove svg {
          width: 13px;
          height: 13px;
        }

        .dash__req-remove:hover:not(:disabled) {
          border-color: #9c3b2f;
          color: #9c3b2f;
          background: rgba(156, 59, 47, 0.08);
        }

        .dash__req-remove:disabled {
          opacity: 0.35;
          cursor: default;
        }

        .dash__req-add {
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 10px;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          color: var(--color-steel);
          padding: 8px 14px;
          border-radius: 999px;
          border: 1px dashed var(--color-border);
          background: rgba(27, 75, 115, 0.04);
          cursor: pointer;
          transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
        }

        .dash__req-add svg {
          width: 14px;
          height: 14px;
        }

        .dash__req-add:hover {
          border-color: var(--color-gold);
          color: var(--color-gold);
          background: rgba(201, 151, 44, 0.08);
        }

        .dash__field input,
        .dash__field select,
        .dash__field textarea {
          font-family: var(--font-body);
          font-size: 14px;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          background: var(--color-bg);
          outline: none;
        }

        .dash__field input:focus,
        .dash__field select:focus,
        .dash__field textarea:focus {
          border-color: var(--color-gold);
          box-shadow: 0 0 0 3px rgba(201, 151, 44, 0.15);
        }

        .dash__field textarea {
          resize: vertical;
        }

        .dash__form-error {
          margin: 0;
          font-family: var(--font-body);
          font-size: 13px;
          color: #9c3b2f;
        }

        .dash__modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 4px;
        }

        /* Tablet: action buttons wrap onto their own line instead of
           squeezing next to the title/meta text */
        @media (max-width: 860px) {
          .dash__job-actions {
            width: 100%;
            justify-content: flex-start;
          }
        }

        /* Mobile: fully stacked rows, tighter modal chrome */
        @media (max-width: 560px) {
          .dash__field-row,
          .dash__view-grid {
            grid-template-columns: 1fr;
          }
          .dash__job-row,
          .dash__app-row {
            flex-direction: column;
            align-items: stretch;
          }
          .dash__modal {
            padding: 20px;
          }
          .dash__modal-backdrop {
            padding: 24px 12px;
          }
          .dash__tabs {
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          .dash__glow--one,
          .dash__glow--two {
            width: 220px;
            height: 220px;
            filter: blur(55px);
          }
        }
      `}</style>
    </div>
  );
}