import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiActivity, FiArrowUpRight, FiBriefcase, FiCheck, FiCheckCircle, FiChevronRight,
  FiClock, FiCode, FiDownload, FiEdit3, FiExternalLink, FiEye, FiImage, FiLayout,
  FiLogOut, FiMail, FiMenu, FiMessageSquare, FiPlus, FiRefreshCw, FiSearch,
  FiSettings, FiTrash2, FiTrendingUp, FiUploadCloud, FiX
} from 'react-icons/fi';
import {
  createProject, createSimpleRecord, fetchAdminContent,
  markMessageRead, removeRecord, supabase, updateRecord, uploadProfilePhoto
} from '../backend';
import {
  CONTENT_KEY, PHOTO_KEY, defaultPhoto, getStoredPhoto, projects,
  readStored, skillsData
} from '../data';

const adminNav = [
  { label: 'Overview',   icon: FiActivity },
  { label: 'Projects',   icon: FiBriefcase },
  { label: 'Skills',     icon: FiCode },
  { label: 'Experience', icon: FiLayout },
  { label: 'Messages',   icon: FiMessageSquare },
  { label: 'Appearance', icon: FiImage },
];

function Arrow() { return <FiArrowUpRight className="arrow-icon" aria-hidden="true" />; }

/* ── Admin Login Screen ──────────────────────────────────────── */
/* ── Admin Login Screen (Single User Database / Master Key) ──── */
function AdminLogin({ onLogin }) {
  const [email,    setEmail]    = useState(() => import.meta.env.VITE_ADMIN_EMAIL || 'kaleabawoe@gmail.com');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [dbStatus, setDbStatus] = useState('checking'); // 'ready' | 'fallback'

  useEffect(() => {
    let isMounted = true;
    async function checkDb() {
      if (!supabase) {
        if (isMounted) setDbStatus('fallback');
        return;
      }
      try {
        const { data, error: qErr } = await supabase.from('admin_auth').select('id, email').limit(1);
        if (isMounted) {
          if (!qErr && data && data.length > 0) {
            setDbStatus('ready');
            if (data[0].email) setEmail(data[0].email);
          } else {
            setDbStatus('fallback');
          }
        }
      } catch {
        if (isMounted) setDbStatus('fallback');
      }
    }
    checkDb();
    return () => { isMounted = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const envEmail = (import.meta.env.VITE_ADMIN_EMAIL || 'kaleabawoe@gmail.com').trim().toLowerCase();
    const envPass  = (import.meta.env.VITE_ADMIN_PASSWORD || 'kalab2026').trim();
    const inputEmail = email.trim().toLowerCase();
    const inputPass  = password.trim();

    let authenticated = false;
    let authUser = { email: inputEmail, role: 'Lead Architect', source: 'local' };

    // 1. Try checking against Supabase 'admin_auth' table directly
    if (supabase) {
      try {
        const { data, error: dbError } = await supabase.from('admin_auth').select('*').limit(1);
        if (!dbError && data && data.length > 0) {
          const row = data[0];
          const dbEmail = (row.email || '').trim().toLowerCase();
          const emailMatch = !dbEmail || dbEmail === inputEmail;
          const passMatch  = (row.password === inputPass) || (row.password_hash === inputPass);

          if (emailMatch && passMatch) {
            authenticated = true;
            authUser = { email: row.email || email, role: 'Lead Architect', source: 'database' };
          }
        }
      } catch (err) {
        // Table query error, fallback to env check below
      }
    }

    // 2. Check against environment variable fallback
    if (!authenticated) {
      const emailMatch = inputEmail === envEmail;
      const passMatch  = inputPass === envPass;

      if (emailMatch && passMatch) {
        authenticated = true;
        authUser = { email: envEmail, role: 'Lead Architect', source: 'env' };
      }
    }

    setLoading(false);

    if (authenticated) {
      localStorage.setItem('kalab_admin_session', JSON.stringify({ ...authUser, timestamp: Date.now() }));
      onLogin(authUser);
    } else {
      setError('Incorrect password. Please verify and try again.');
    }
  };

  return (
    <motion.div className="admin-shell auth-shell" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div className="auth-card" initial={{ y: 28, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
        <div className="auth-header-row">
          <a className="reference-brand" href="/">
            <span>KA</span><strong>Kalab</strong>
          </a>
          <span className="auth-badge">
            {dbStatus === 'ready' ? 'SUPABASE DB AUTH' : 'SECURE MASTER ACCESS'}
          </span>
        </div>

        <p className="eyebrow">Executive Management Portal</p>
        <h1>Owner Sign In</h1>
        <p>Private command center for Kalab Awoke. Enter your password to manage your projects, skills, and portfolio telemetry.</p>

        <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
          <label>
            Administrator Email
            <input
              required
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </label>
          <label>
            Master Password
            <input
              required
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
            />
          </label>

          <button className="primary-button auth-submit-btn" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Authenticating…' : 'Sign in to Console'} <Arrow />
          </button>

          {error && <div className="auth-error-chip">{error}</div>}
        </form>

        <div className="auth-footer-nav" style={{ marginTop: '28px' }}>
          <a href="/">← Return to Public Portfolio</a>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Admin Dashboard ─────────────────────────────────────────── */
function AdminDashboard({ user, onLogout }) {
  const saved = readStored(CONTENT_KEY, {});
  const [active,         setActive]         = useState('Overview');
  const [sidebarOpen,    setSidebarOpen]    = useState(false);
  const [projectList,    setProjectList]    = useState(saved.projects   || projects);
  const [skillList,      setSkillList]      = useState(saved.skillsList || skillsData);
  const [experienceList, setExperienceList] = useState(saved.experience || [
    { role: 'Lead Frontend Architect', company: 'Independent Studio', period: '2024 — Present', description: 'Architecting high-frequency financial dashboards and modular design systems.' },
    { role: 'Full-Stack Engineer', company: 'Product Lab', period: '2023 — 2024', description: 'Built real-time collaboration engines and optimized Supabase cloud persistence pipelines.' }
  ]);
  const [messageList,    setMessageList]    = useState([]);
  const [adminToast,     setAdminToast]     = useState('');

  // Modals state
  const [projectModal,    setProjectModal]    = useState(null);
  const [skillModal,      setSkillModal]      = useState(null);
  const [experienceModal, setExperienceModal] = useState(null);

  const showToast = (msg) => {
    setAdminToast(msg);
    setTimeout(() => setAdminToast(''), 3200);
  };

  const unread = messageList.filter(m => !m.is_read).length || 2;

  const persist = (p, s, e) => {
    localStorage.setItem(CONTENT_KEY, JSON.stringify({
      projects: p,
      skills: s.map(item => item.name || item),
      skillsList: s,
      experience: e
    }));
  };

  useEffect(() => {
    if (!supabase) return;
    fetchAdminContent().then(remote => {
      if (!remote) return;
      if (remote.projects.length) {
        setProjectList(remote.projects.map(p => ({
          ...p,
          tags: p.tech_stack || [],
          tone: p.tone || 'blue'
        })));
      }
      if (remote.experience.length) setExperienceList(remote.experience);
      setMessageList(remote.messages);
    }).catch(() => {});
  }, []);

  // Project Actions
  const handleSaveProject = async (item) => {
    let updated;
    const isExisting = projectList.some(p => p.id === item.id || p.title.toLowerCase() === item.title.toLowerCase());

    if (isExisting) {
      updated = projectList.map(p => (p.id === item.id || p.title.toLowerCase() === item.title.toLowerCase()) ? item : p);
      if (supabase) {
        try {
          if (typeof item.id === 'number' || /^\d+$/.test(String(item.id))) {
            await updateRecord('projects', item.id, {
              title: item.title,
              category: item.category,
              description: item.description,
              tech_stack: item.tags || [],
              featured: Boolean(item.featured),
              published: true,
              tone: item.tone,
              url: item.url,
              metric: item.metric
            });
          } else {
            const { data: existingDb } = await supabase.from('projects').select('id').eq('title', item.title).limit(1);
            if (existingDb && existingDb.length > 0) {
              await updateRecord('projects', existingDb[0].id, {
                title: item.title,
                category: item.category,
                description: item.description,
                tech_stack: item.tags || [],
                featured: Boolean(item.featured),
                published: true,
                tone: item.tone,
                url: item.url,
                metric: item.metric
              });
            } else {
              const { data: created } = await createProject(item);
              if (created?.id) item.id = created.id;
            }
          }
        } catch (e) {
          console.error('Supabase project sync error:', e);
        }
      }
      showToast(`Updated "${item.title}".`);
    } else {
      const newObj = { ...item };
      if (supabase) {
        try {
          const { data: created } = await createProject(newObj);
          if (created?.id) newObj.id = created.id;
        } catch (e) {
          console.error('Supabase project create error:', e);
        }
      }
      updated = [newObj, ...projectList];
      showToast(`Created "${item.title}".`);
    }
    setProjectList(updated);
    persist(updated, skillList, experienceList);
    setProjectModal(null);
  };

  const handleDeleteProject = async (index) => {
    const item = projectList[index];
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    const updated = projectList.filter((_, i) => i !== index);
    if (supabase && item.id) {
      try {
        if (typeof item.id === 'number' || /^\d+$/.test(String(item.id))) {
          await removeRecord('projects', item.id);
        } else {
          await supabase.from('projects').delete().eq('title', item.title);
        }
      } catch (e) {}
    }
    setProjectList(updated);
    persist(updated, skillList, experienceList);
    showToast(`Deleted "${item.title}".`);
  };

  // Skill Actions
  const handleSaveSkill = async (item) => {
    let updated;
    const existingIndex = skillList.findIndex(s => s.name.toLowerCase() === item.name.toLowerCase());
    if (existingIndex >= 0 && skillModal !== 'new') {
      updated = skillList.map((s, i) => i === existingIndex ? item : s);
      if (supabase) {
        try {
          const { data: existingDb } = await supabase.from('skills').select('id').eq('name', item.name).limit(1);
          if (existingDb && existingDb.length > 0) {
            await updateRecord('skills', existingDb[0].id, { category: item.category });
          } else {
            await createSimpleRecord('skills', { name: item.name, category: item.category, sort_order: existingIndex });
          }
        } catch (e) {}
      }
      showToast(`Updated skill "${item.name}".`);
    } else {
      updated = [...skillList, item];
      if (supabase) {
        try {
          await createSimpleRecord('skills', { name: item.name, category: item.category, sort_order: skillList.length });
        } catch (e) {}
      }
      showToast(`Added skill "${item.name}".`);
    }
    setSkillList(updated);
    persist(projectList, updated, experienceList);
    setSkillModal(null);
  };

  const handleDeleteSkill = async (index) => {
    const item = skillList[index];
    const updated = skillList.filter((_, i) => i !== index);
    if (supabase) {
      try {
        await supabase.from('skills').delete().eq('name', item.name);
      } catch (e) {}
    }
    setSkillList(updated);
    persist(projectList, updated, experienceList);
    showToast(`Removed "${item.name}".`);
  };

  // Experience Actions
  const handleSaveExperience = async (item) => {
    let updated;
    if (experienceModal && typeof experienceModal === 'object' && experienceModal._index !== undefined) {
      updated = experienceList.map((e, i) => i === experienceModal._index ? item : e);
      if (supabase) {
        try {
          const { data: existingDb } = await supabase.from('experience').select('id').eq('role', item.role).limit(1);
          if (existingDb && existingDb.length > 0) {
            await updateRecord('experience', existingDb[0].id, {
              company: item.company,
              date_range: item.period,
              description: item.description
            });
          }
        } catch (e) {}
      }
      showToast(`Updated "${item.role}".`);
    } else {
      updated = [item, ...experienceList];
      if (supabase) {
        try {
          await createSimpleRecord('experience', {
            role: item.role,
            company: item.company,
            date_range: item.period,
            description: item.description
          });
        } catch (e) {}
      }
      showToast(`Added "${item.role}".`);
    }
    setExperienceList(updated);
    persist(projectList, skillList, updated);
    setExperienceModal(null);
  };

  const handleDeleteExperience = (index) => {
    const item = experienceList[index];
    const updated = experienceList.filter((_, i) => i !== index);
    setExperienceList(updated);
    persist(projectList, skillList, updated);
    showToast(`Removed experience entry.`);
  };

  // Backup Export
  const exportBackupJSON = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      projects: projectList,
      skills: skillList,
      experience: experienceList
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kalab-portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showToast('Backup JSON exported successfully.');
  };

  const stats = [
    { label: 'Published Projects', value: projectList.length, icon: FiBriefcase, trend: 'Verified & active in grid' },
    { label: 'Skills in Matrix',   value: skillList.length,   icon: FiCode,      trend: 'Filtered across 3 tiers' },
    { label: 'Client Inquiries',   value: messageList.length || 4, icon: FiMessageSquare, trend: `${unread} unread responses` },
    { label: 'Cloud Persistence',  value: supabase ? 'LIVE' : 'DEMO', icon: FiActivity, trend: supabase ? 'Supabase synced' : 'Local cache synced' },
  ];

  return (
    <motion.div className="admin-shell" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {sidebarOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={sidebarOpen ? 'admin-sidebar is-open' : 'admin-sidebar'}>
        <div className="admin-brand-row">
          <a className="reference-brand" href="/">
            <span>KA</span><strong>Console</strong>
          </a>
          <button className="mobile-toggle" onClick={() => setSidebarOpen(false)}><FiX /></button>
        </div>

        <nav>
          {adminNav.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={active === label ? 'active' : ''}
              onClick={() => { setActive(label); setSidebarOpen(false); }}
            >
              <Icon />
              <span>{label}</span>
              {label === 'Messages' && <b>{unread}</b>}
              {label === 'Projects' && <span className="nav-count">{projectList.length}</span>}
              {label === 'Skills'   && <span className="nav-count">{skillList.length}</span>}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <button className="sidebar-action-btn" onClick={exportBackupJSON} title="Download JSON copy of all data">
            <FiDownload /> Export JSON Backup
          </button>
          <a className="sidebar-action-btn" href="/">
            <FiExternalLink /> View Public Site
          </a>
          <button className="logout" onClick={onLogout}>
            <FiLogOut /> Log out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <button className="admin-menu-button" onClick={() => setSidebarOpen(true)}><FiMenu /></button>
          <div>
            <div className="admin-top-badge">
              <span className={`status-indicator ${supabase ? 'online' : 'demo'}`} />
              <span>{supabase ? 'Supabase Production Sync' : 'Local Storage Cache'}</span>
            </div>
            <h1>{active}</h1>
          </div>

          <div className="admin-top-actions">
            <a href="/" className="public-site-link">
              <span>Live Site</span>
              <FiArrowUpRight />
            </a>
            <div className="admin-user">
              <span className="admin-avatar">{(user.email || 'K').slice(0, 1).toUpperCase()}</span>
              <div>
                <strong>Kalab Awoke</strong>
                <small>{user.email}</small>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {active === 'Overview' && (
              <AdminOverview
                stats={stats}
                projects={projectList}
                messages={messageList}
                onNewProject={() => setProjectModal('new')}
                onNewSkill={() => setSkillModal('new')}
                onEditProject={(p) => setProjectModal(p)}
                setActive={setActive}
                onExport={exportBackupJSON}
              />
            )}

            {active === 'Projects' && (
              <AdminProjectsManager
                projects={projectList}
                onNew={() => setProjectModal('new')}
                onEdit={(p) => setProjectModal(p)}
                onDelete={handleDeleteProject}
              />
            )}

            {active === 'Skills' && (
              <AdminSkillsManager
                skills={skillList}
                onNew={() => setSkillModal('new')}
                onEdit={(s) => setSkillModal(s)}
                onDelete={handleDeleteSkill}
              />
            )}

            {active === 'Experience' && (
              <AdminExperienceManager
                experience={experienceList}
                onNew={() => setExperienceModal('new')}
                onEdit={(e, i) => setExperienceModal({ ...e, _index: i })}
                onDelete={handleDeleteExperience}
              />
            )}

            {active === 'Messages' && (
              <AdminMessagesManager
                messages={messageList}
                onRead={id => {
                  markMessageRead(id);
                  setMessageList(messageList.map(m => m.id === id ? { ...m, is_read: true } : m));
                  showToast('Message marked as read.');
                }}
              />
            )}

            {active === 'Appearance' && (
              <AdminAppearanceManager onToast={showToast} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Project Modal */}
        {projectModal && (
          <ProjectEditorModal
            project={projectModal === 'new' ? {} : projectModal}
            onClose={() => setProjectModal(null)}
            onSave={handleSaveProject}
          />
        )}

        {/* Skill Modal */}
        {skillModal && (
          <SkillEditorModal
            skill={skillModal === 'new' ? {} : skillModal}
            onClose={() => setSkillModal(null)}
            onSave={handleSaveSkill}
          />
        )}

        {/* Experience Modal */}
        {experienceModal && (
          <ExperienceEditorModal
            experience={experienceModal === 'new' ? {} : experienceModal}
            onClose={() => setExperienceModal(null)}
            onSave={handleSaveExperience}
          />
        )}

        {/* Admin Toast */}
        <AnimatePresence>
          {adminToast && (
            <motion.div
              className="toast-notification"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <FiCheckCircle />
              <span>{adminToast}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
}

/* ── 1. Admin Overview ───────────────────────────────────────── */
function AdminOverview({ stats, projects: p, messages, onNewProject, onNewSkill, onEditProject, setActive, onExport }) {
  return (
    <>
      <div className="admin-welcome">
        <div>
          <span className="eyebrow">Production Command Center</span>
          <h2>Portfolio Operations</h2>
          <p>Real-time telemetry, portfolio records, and content pipeline orchestration.</p>
        </div>
        <div className="overview-actions-row">
          <button className="secondary-button" onClick={onExport}><FiDownload /> Backup JSON</button>
          <button className="primary-button" onClick={onNewProject}><FiPlus /> New project</button>
        </div>
      </div>

      <div className="admin-stats-grid">
        {stats.map(({ label, value, icon: Icon, trend }) => (
          <motion.div className="admin-stat-card" whileHover={{ y: -3 }} key={label}>
            <div className="stat-header">
              <span className="stat-title">{label}</span>
              <div className="stat-icon-wrapper"><Icon /></div>
            </div>
            <strong className="stat-value">{value}</strong>
            <small className="stat-sub"><FiCheckCircle /> {trend}</small>
          </motion.div>
        ))}
      </div>

      <div className="admin-grid-panels">
        <section className="admin-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Live Portfolio</p>
              <h2>Active Projects ({p.length})</h2>
            </div>
            <button onClick={() => setActive('Projects')}>Manage all <FiChevronRight /></button>
          </div>

          <div className="admin-overview-table">
            {p.slice(0, 4).map((proj, i) => (
              <div className="admin-table-row" key={proj.title || i}>
                <span className={`tone-chip tone-${proj.tone || 'blue'}`}>{String(i + 1).padStart(2, '0')}</span>
                <div className="table-row-main">
                  <strong>{proj.title}</strong>
                  <small>{proj.category}</small>
                </div>
                {proj.metric && <span className="metric-tag">{proj.metric}</span>}
                <button className="icon-action" onClick={() => onEditProject(proj)} title="Edit project"><FiEdit3 /></button>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-panel activity-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Client Inquiries</p>
              <h2>Recent Contacts</h2>
            </div>
            <button onClick={() => setActive('Messages')}>Open Inbox <FiChevronRight /></button>
          </div>

          <div className="inbox-stream">
            {messages.length === 0 ? (
              <div className="inbox-sample-stream">
                <div className="message-preview">
                  <span className="message-dot" />
                  <div>
                    <strong>Product Engineering Inquiry</strong>
                    <small>sarah.chen@venture.io · Today</small>
                  </div>
                  <FiChevronRight />
                </div>
                <div className="message-preview muted">
                  <FiClock />
                  <div>
                    <strong>Contract for Design System Architecture</strong>
                    <small>alex@fintech.co · Yesterday</small>
                  </div>
                </div>
              </div>
            ) : (
              messages.slice(0, 3).map((m, i) => (
                <div className={`message-preview ${!m.is_read ? '' : 'muted'}`} key={m.id || i}>
                  {!m.is_read ? <span className="message-dot" /> : <FiClock />}
                  <div>
                    <strong>{m.name}</strong>
                    <small>{m.email} · {new Date(m.created_at).toLocaleDateString()}</small>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </>
  );
}

/* ── 2. Admin Projects Manager ──────────────────────────────── */
function AdminProjectsManager({ projects, onNew, onEdit, onDelete }) {
  const [query, setQuery] = useState('');

  const filtered = projects.filter(p =>
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.category.toLowerCase().includes(query.toLowerCase()) ||
    (p.tags && p.tags.some(t => t.toLowerCase().includes(query.toLowerCase())))
  );

  return (
    <section className="admin-panel full-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Portfolio Database</p>
          <h2>Project Engineering Cases ({projects.length})</h2>
        </div>
        <button className="primary-button" onClick={onNew}><FiPlus /> Add Project</button>
      </div>

      <div className="panel-filter-bar">
        <div className="search-input-wrapper">
          <FiSearch />
          <input
            placeholder="Filter projects by title, category, or technology..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="projects-admin-grid">
        {filtered.map((proj, idx) => (
          <div className="admin-project-card" key={proj.title + idx}>
            <div className="card-top">
              <span className={`tone-pill tone-${proj.tone || 'blue'}`}>{proj.tone || 'blue'}</span>
              <div className="card-actions">
                <button className="icon-action" onClick={() => onEdit(proj)} title="Edit project"><FiEdit3 /></button>
                <button className="icon-action danger" onClick={() => onDelete(idx)} title="Delete project"><FiTrash2 /></button>
              </div>
            </div>

            <div className="card-body">
              <span className="card-category">{proj.category}</span>
              <h3>{proj.title}</h3>
              <p>{proj.description}</p>

              {proj.metric && (
                <div className="card-metric-badge">
                  <FiTrendingUp /> <span>{proj.metric}</span>
                </div>
              )}

              <div className="tag-row">
                {(proj.tags || []).slice(0, 4).map(t => <span key={t}>{t}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── 3. Admin Skills Manager ────────────────────────────────── */
function AdminSkillsManager({ skills, onNew, onEdit, onDelete }) {
  const [tab, setTab] = useState('All');
  const categories = ['All', 'Frontend', 'Backend', 'Systems'];

  const filtered = tab === 'All'
    ? skills
    : skills.filter(s => (s.category || 'Frontend') === tab);

  return (
    <section className="admin-panel full-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Engineering Matrix</p>
          <h2>Skills & Architecture Specialties ({skills.length})</h2>
        </div>
        <button className="primary-button" onClick={onNew}><FiPlus /> Add Skill</button>
      </div>

      <div className="skills-admin-tabs">
        {categories.map(c => (
          <button
            key={c}
            className={`admin-tab-btn ${tab === c ? 'active' : ''}`}
            onClick={() => setTab(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="skills-admin-grid">
        {filtered.map((skill, index) => {
          const originalIndex = skills.findIndex(s => s.name === skill.name);
          return (
            <div className="admin-skill-card" key={skill.name || index}>
              <div className="skill-card-header">
                <strong>{skill.name}</strong>
                <span className="skill-category-badge">{skill.category || 'Frontend'}</span>
              </div>
              <span className="skill-level-tag">{skill.level || 'Production'}</span>
              <p className="skill-desc-text">{skill.desc || 'Architectural specialization.'}</p>
              <div className="skill-card-footer">
                <button className="icon-action" onClick={() => onEdit(skill)} title="Edit skill"><FiEdit3 /></button>
                <button className="icon-action danger" onClick={() => onDelete(originalIndex >= 0 ? originalIndex : index)} title="Delete skill"><FiTrash2 /></button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ── 4. Admin Experience Manager ────────────────────────────── */
function AdminExperienceManager({ experience, onNew, onEdit, onDelete }) {
  return (
    <section className="admin-panel full-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Career Milestones</p>
          <h2>Experience & Leadership History</h2>
        </div>
        <button className="primary-button" onClick={onNew}><FiPlus /> Add Experience</button>
      </div>

      <div className="experience-admin-list">
        {experience.map((item, index) => (
          <div className="admin-exp-row" key={index}>
            <div className="exp-bullet" />
            <div className="exp-content">
              <div className="exp-top">
                <strong>{item.role || item}</strong>
                <span className="exp-period">{item.period || item.date_range || 'Current'}</span>
              </div>
              <span className="exp-company">{item.company || 'Independent'}</span>
              <p className="exp-desc">{item.description || 'Specialized frontend development & delivery.'}</p>
            </div>
            <div className="exp-actions">
              <button className="icon-action" onClick={() => onEdit(item, index)} title="Edit entry"><FiEdit3 /></button>
              <button className="icon-action danger" onClick={() => onDelete(index)} title="Delete entry"><FiTrash2 /></button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── 5. Admin Messages Manager ──────────────────────────────── */
function AdminMessagesManager({ messages, onRead }) {
  const [selectedMsg, setSelectedMsg] = useState(null);

  const rows = messages.length ? messages : [
    {
      id: 'msg-1',
      name: 'Sarah Chen',
      email: 'sarah.chen@venture.io',
      message: 'Hi Kalab, we love the architecture and speed of Nova Finance. We are building a high-frequency fintech dashboard and would love to discuss a 3-month contract.',
      created_at: new Date().toISOString(),
      is_read: false
    },
    {
      id: 'msg-2',
      name: 'David Miller',
      email: 'david@platform.studio',
      message: 'Looking for a senior frontend developer who understands spatial view transitions and design systems. Are you open for Q3 engagements?',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      is_read: true
    }
  ];

  return (
    <section className="admin-panel full-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Client Communications</p>
          <h2>Inquiries & Contact Stream ({rows.length})</h2>
        </div>
      </div>

      <div className="inbox-layout">
        <div className="inbox-list">
          {rows.map((msg) => (
            <div
              key={msg.id}
              className={`inbox-card ${!msg.is_read ? 'unread' : ''} ${selectedMsg?.id === msg.id ? 'active' : ''}`}
              onClick={() => { setSelectedMsg(msg); if (!msg.is_read) onRead(msg.id); }}
            >
              <div className="inbox-card-top">
                <strong>{msg.name}</strong>
                <small>{new Date(msg.created_at).toLocaleDateString()}</small>
              </div>
              <span className="inbox-email">{msg.email}</span>
              <p className="inbox-snippet">{msg.message}</p>
            </div>
          ))}
        </div>

        <div className="inbox-viewer">
          {selectedMsg ? (
            <div className="message-detail-view">
              <div className="detail-header">
                <div>
                  <h3>{selectedMsg.name}</h3>
                  <a href={`mailto:${selectedMsg.email}`} className="detail-email">{selectedMsg.email}</a>
                  <span className="detail-date">{new Date(selectedMsg.created_at).toLocaleString()}</span>
                </div>
                <div className="detail-actions">
                  <a href={`mailto:${selectedMsg.email}?subject=Regarding%20Portfolio%20Inquiry`} className="primary-button">
                    <FiMail /> Reply via Email
                  </a>
                </div>
              </div>
              <div className="detail-body">
                <p>{selectedMsg.message}</p>
              </div>
            </div>
          ) : (
            <div className="empty-inbox-prompt">
              <FiMessageSquare />
              <p>Select an inquiry to read the full brief and reply.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ── 6. Admin Appearance Manager ────────────────────────────── */
function AdminAppearanceManager({ onToast }) {
  const [photo, setPhoto] = useState(getStoredPhoto);

  const savePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      localStorage.setItem(PHOTO_KEY, dataUrl);
      setPhoto(dataUrl);
      if (supabase) {
        onToast('Uploading portrait to cloud database…');
        const res = await uploadProfilePhoto(file, dataUrl);
        if (res.error) {
          onToast(`⚠️ Saved locally, cloud sync error: ${res.error.message || res.error}`);
        } else {
          onToast('✓ Portrait synchronized to live cloud database!');
        }
      } else {
        onToast('Portrait updated and saved.');
      }
    };
    reader.readAsDataURL(file);
  };

  const resetPhoto = async () => {
    localStorage.removeItem(PHOTO_KEY);
    setPhoto(defaultPhoto);
    if (supabase) {
      await supabase.from('site_settings').delete().eq('key', 'profile_photo_url');
    }
    onToast('Restored default hero photograph.');
  };

  return (
    <section className="admin-panel appearance-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Visual Brand & Media</p>
          <h2>Hero Portrait & Presentation</h2>
        </div>
        <span className="status-badge"><FiCheckCircle /> {supabase ? 'Supabase Storage' : 'Local Storage Cache'}</span>
      </div>

      <div className="appearance-grid">
        <div className="appearance-preview">
          <div className="appearance-photo-frame">
            <img src={photo} alt="Current portrait" />
          </div>
          <div>
            <strong>3D Holographic Card Portrait</strong>
            <p>This image is framed with the 3D perspective glass card on your homepage hero.</p>
          </div>
        </div>

        <div className="appearance-controls">
          <label className="upload-zone">
            <FiUploadCloud />
            <strong>Upload New Portrait</strong>
            <span>PNG, JPG, or WEBP · High Resolution Recommended</span>
            <input type="file" accept="image/*" onChange={savePhoto} />
          </label>
          <button className="secondary-button" onClick={resetPhoto}>
            <FiRefreshCw /> Restore Default Photo
          </button>
        </div>
      </div>
    </section>
  );
}

/* ── 7. Modals: Project, Skill, Experience ───────────────────── */
function ProjectEditorModal({ project, onClose, onSave }) {
  const [form, setForm] = useState({
    title: project.title || '',
    category: project.category || '',
    url: project.url || '',
    metric: project.metric || '',
    tone: project.tone || 'blue',
    description: project.description || '',
    tags: (project.tags || []).join(', '),
    highlights: (project.highlights || []).join('\n'),
    liveUrl: project.liveUrl || '',
    githubUrl: project.githubUrl || '',
  });

  const tones = ['blue', 'gold', 'violet', 'green', 'rose'];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <motion.div
        className="project-modal project-modal-wide"
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="panel-header">
          <div>
            <p className="eyebrow">Project Configurator</p>
            <h2>{project.title ? `Edit "${project.title}"` : 'New Engineering Project'}</h2>
          </div>
          <button className="icon-action" onClick={onClose}><FiX /></button>
        </div>

        <form onSubmit={e => {
          e.preventDefault();
          onSave({
            ...project,
            ...form,
            tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
            highlights: form.highlights.split('\n').map(h => h.trim()).filter(Boolean)
          });
        }}>
          <div className="form-two-col">
            <label>
              Project Title
              <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Nova Finance" />
            </label>
            <label>
              Category
              <input required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Fintech Analytics & Operations" />
            </label>
          </div>

          <div className="form-three-col">
            <label>
              Browser Mockup URL
              <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="app.novafinance.io" />
            </label>
            <label>
              Key Metric Highlight
              <input value={form.metric} onChange={e => setForm({ ...form, metric: e.target.value })} placeholder="⚡ 420ms Avg Latency" />
            </label>
            <label>
              Visual Accent Tone
              <div className="tone-picker">
                {tones.map(t => (
                  <button
                    type="button"
                    key={t}
                    className={`tone-btn tone-${t} ${form.tone === t ? 'selected' : ''}`}
                    onClick={() => setForm({ ...form, tone: t })}
                    title={`Tone: ${t}`}
                  />
                ))}
              </div>
            </label>
          </div>

          <label>
            Case Description
            <textarea required rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the problem, outcomes, and value delivered..." />
          </label>

          <label>
            Engineering Wins & Architecture <small>(One highlight per line)</small>
            <textarea rows="3" value={form.highlights} onChange={e => setForm({ ...form, highlights: e.target.value })} placeholder="Sub-second real-time balance aggregation with Supabase.&#10;Optimistic state mutations with automatic rollback." />
          </label>

          <div className="form-two-col">
            <label>
              Live Demo Link
              <input type="url" value={form.liveUrl} onChange={e => setForm({ ...form, liveUrl: e.target.value })} placeholder="https://..." />
            </label>
            <label>
              GitHub Repository Link
              <input type="url" value={form.githubUrl} onChange={e => setForm({ ...form, githubUrl: e.target.value })} placeholder="https://github.com/..." />
            </label>
          </div>

          <label>
            Technologies <small>(Comma separated)</small>
            <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="React 19, TypeScript, Supabase, Tailwind" />
          </label>

          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button className="primary-button"><FiCheckCircle /> Save Project</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function SkillEditorModal({ skill, onClose, onSave }) {
  const [form, setForm] = useState({
    name: skill.name || '',
    category: skill.category || 'Frontend',
    level: skill.level || 'Core Specialty',
    desc: skill.desc || ''
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <motion.div
        className="project-modal"
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="panel-header">
          <div>
            <p className="eyebrow">Skills Matrix</p>
            <h2>{skill.name ? `Edit Skill: ${skill.name}` : 'Add Technology'}</h2>
          </div>
          <button className="icon-action" onClick={onClose}><FiX /></button>
        </div>

        <form onSubmit={e => { e.preventDefault(); onSave(form); }}>
          <label>
            Skill Name
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. TypeScript" />
          </label>

          <div className="form-two-col">
            <label>
              Category Discipline
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Systems">Systems</option>
              </select>
            </label>
            <label>
              Specialty Tier / Level
              <input value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} placeholder="e.g. Strict Mode" />
            </label>
          </div>

          <label>
            Technical Note / Architectural Specialty
            <textarea rows="3" value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="Type-level programming, generics, robust interfaces..." />
          </label>

          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button className="primary-button"><FiCheckCircle /> Save Skill</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function ExperienceEditorModal({ experience, onClose, onSave }) {
  const [form, setForm] = useState({
    role: experience.role || '',
    company: experience.company || '',
    period: experience.period || experience.date_range || '',
    description: experience.description || ''
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <motion.div
        className="project-modal"
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="panel-header">
          <div>
            <p className="eyebrow">Career Milestone</p>
            <h2>{experience.role ? `Edit Experience` : 'Add Experience Entry'}</h2>
          </div>
          <button className="icon-action" onClick={onClose}><FiX /></button>
        </div>

        <form onSubmit={e => { e.preventDefault(); onSave(form); }}>
          <div className="form-two-col">
            <label>
              Role Title
              <input required value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Lead Frontend Architect" />
            </label>
            <label>
              Company / Team
              <input required value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Independent Studio" />
            </label>
          </div>

          <label>
            Period / Date Range
            <input value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} placeholder="2024 — Present" />
          </label>

          <label>
            Key Accomplishments & Responsibilities
            <textarea rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Architecting high-frequency financial dashboards and modular design systems..." />
          </label>

          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button className="primary-button"><FiCheckCircle /> Save Experience</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ── Export Root Admin App ───────────────────────────────────── */
export default function AdminApp() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('kalab_admin_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('kalab_admin_session');
    setUser(null);
  };

  return user
    ? <AdminDashboard user={user} onLogout={handleLogout} />
    : <AdminLogin onLogin={setUser} />;
}
