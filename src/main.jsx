import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiActivity, FiArrowUpRight, FiBriefcase, FiCheck, FiCheckCircle, FiChevronRight,
  FiClock, FiCode, FiCopy, FiDownload, FiEdit3, FiExternalLink, FiEye, FiGithub, FiImage, FiLayout, FiLinkedin,
  FiLogOut, FiMail, FiMenu, FiMessageSquare, FiMoon, FiPlus, FiRefreshCw,
  FiSearch, FiSettings, FiSun, FiTrash2, FiTrendingUp, FiUploadCloud, FiX
} from 'react-icons/fi';
import { fetchPublicContent, supabase } from './backend';
import {
  CONTENT_KEY, PHOTO_KEY, defaultPhoto, getStoredPhoto, navItems,
  process, projects, readStored, skills, skillsData
} from './data';
import './styles.css';

/* ── Motion variants ────────────────────────────────────────── */
const reveal  = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

/* ── Shared components ──────────────────────────────────────── */
function Arrow() { return <FiArrowUpRight className="arrow-icon" aria-hidden="true" />; }

function Section({ id, number, title, className = '', children }) {
  return (
    <motion.section
      id={id}
      className={`content-section ${className}`}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      variants={stagger}
    >
      <div className="section-kicker">
        <span />
        {number} — {title}
      </div>
      {children}
    </motion.section>
  );
}

/* ── Live Addis Ababa Clock ─────────────────────────────────── */
function LiveClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () => {
      try {
        const str = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Africa/Addis_Ababa',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }).format(new Date());
        setTime(str);
      } catch {
        setTime('10:15 AM');
      }
    };
    update();
    const id = setInterval(update, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="nav-clock" title="Local time in Addis Ababa, Ethiopia (UTC+3)">
      <span className="nav-clock-dot" />
      <span>Addis Ababa · {time || 'EAT'}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   EXECUTIVE PORTRAIT SHOWCASE — High-craft 3D tactile card
══════════════════════════════════════════════════════════════ */
function ExecutivePortrait({ src }) {
  const cardRef = useRef(null);
  const glareRef = useRef(null);
  const [coords, setCoords] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = (x / rect.width) * 2 - 1;
    const normY = (y / rect.height) * 2 - 1;

    const tiltX = -normY * 7;
    const tiltY = normX * 7;

    cardRef.current.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

    const pctX = Math.round((x / rect.width) * 100);
    const pctY = Math.round((y / rect.height) * 100);
    setCoords({ x: pctX, y: pctY });

    if (glareRef.current) {
      glareRef.current.style.opacity = '1';
      glareRef.current.style.background = `radial-gradient(circle 320px at ${pctX}% ${pctY}%, rgba(255,255,255,0.16), transparent 70%)`;
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }
    if (glareRef.current) {
      glareRef.current.style.opacity = '0';
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <div
      className="exec-portrait-root"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="exec-aura"
        style={{
          transform: isHovered
            ? `translate(${(coords.x - 50) * 0.35}px, ${(coords.y - 50) * 0.35}px)`
            : 'translate(0px, 0px)'
        }}
      />

      <div
        className="exec-card"
        ref={cardRef}
        style={{
          '--spotlight-x': `${coords.x}%`,
          '--spotlight-y': `${coords.y}%`,
        }}
      >
        <div className="exec-border-glare" />

        <div className="exec-inner-frame">
          <img
            src={src}
            alt="Kalab Awoke — Developer Portrait"
            className="exec-image"
          />
          <div className="exec-image-overlay" />
          <div className="exec-glare" ref={glareRef} />
        </div>

        <div className="exec-floating-badge badge-top">
          <span className="exec-badge-dot" />
          <div className="exec-badge-text">
            <strong>Available</strong>
            <small>Q2 / Q3 Projects</small>
          </div>
        </div>

        <div className="exec-floating-badge badge-bottom">
          <div className="exec-badge-icon">
            <FiCode />
          </div>
          <div className="exec-badge-text">
            <strong>Full-Stack Craft</strong>
            <small>Addis Ababa · UTC+3</small>
          </div>
        </div>

        <div className="exec-footer-strip">
          <span>KALAB AWOKE</span>
          <span>PRODUCT // 2026</span>
        </div>
      </div>
    </div>
  );
}

/* ── Interactive Browser Mockup for Projects ─────────────────── */
function ProjectBrowserMockup({ project }) {
  const { title, tone, url } = project;

  return (
    <div className={`mockup-window tone-${tone || 'blue'}`}>
      <div className="mockup-header">
        <div className="mockup-dots">
          <span className="dot-red" />
          <span className="dot-yellow" />
          <span className="dot-green" />
        </div>
        <div className="mockup-url-bar">
          <span className="url-lock">🔒</span>
          <span className="url-text">{url || `${title.toLowerCase().replace(/\s+/g, '')}.app`}</span>
        </div>
        <div className="mockup-header-action">
          <FiArrowUpRight />
        </div>
      </div>

      <div className="mockup-viewport">
        {title === 'Nova Finance' && (
          <div className="ui-nova">
            <div className="nova-top">
              <div>
                <span className="ui-label">Total Portfolio</span>
                <strong className="ui-num">$128,450.00</strong>
              </div>
              <span className="ui-chip positive">+18.4%</span>
            </div>
            <div className="nova-chart">
              <svg viewBox="0 0 240 55" className="chart-svg">
                <defs>
                  <linearGradient id="grad-blue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d="M0,42 Q40,48 70,28 T140,22 T200,8 T240,12 L240,55 L0,55 Z" fill="url(#grad-blue)" />
                <path d="M0,42 Q40,48 70,28 T140,22 T200,8 T240,12" fill="none" stroke="#00d4ff" strokeWidth="2.2" />
              </svg>
            </div>
            <div className="nova-grid">
              <div className="nova-card"><span>Yield</span><strong>8.2% APY</strong></div>
              <div className="nova-card"><span>Volume</span><strong>$42.8k</strong></div>
            </div>
          </div>
        )}

        {title === 'Form Studio' && (
          <div className="ui-form">
            <div className="form-header">
              <span className="form-brand">FORM // 01</span>
              <span className="form-tag">INDEX 2025</span>
            </div>
            <div className="form-canvas">
              <div className="canvas-block block-lg">
                <span className="block-title">SPATIAL IDENTITY</span>
                <span className="block-sub">Architecture & Systems</span>
              </div>
              <div className="canvas-row">
                <div className="canvas-block block-sm" />
                <div className="canvas-block block-sm" />
              </div>
            </div>
          </div>
        )}

        {title === 'Field Notes' && (
          <div className="ui-notes">
            <div className="notes-meta">
              <span className="notes-tag">ESSAY #42</span>
              <span>4 MIN READ</span>
            </div>
            <h4 className="notes-title">Architecture of Calm Systems</h4>
            <div className="notes-lines">
              <div className="notes-line w-full" />
              <div className="notes-line w-90" />
              <div className="notes-line w-75" />
            </div>
            <div className="notes-stats">
              <span>TypeScript</span> · <span>Local-First</span>
            </div>
          </div>
        )}

        {title === 'Ops Board' && (
          <div className="ui-ops">
            <div className="ops-header">
              <span className="ops-sprint">Sprint 34</span>
              <span className="ops-badge">84% velocity</span>
            </div>
            <div className="ops-cols">
              <div className="ops-col">
                <div className="ops-col-title">In Review (3)</div>
                <div className="ops-item active">Auth token refresh logic</div>
                <div className="ops-item">Edge latency bench</div>
              </div>
              <div className="ops-col">
                <div className="ops-col-title">Done (12)</div>
                <div className="ops-item done">PostgreSQL migration</div>
              </div>
            </div>
          </div>
        )}

        {title === 'Market Home' && (
          <div className="ui-market">
            <div className="market-preview">
              <div className="market-img-skeleton" />
              <div className="market-details">
                <div className="market-title">Nordic Minimalist Lamp</div>
                <div className="market-price-row">
                  <span className="market-price">$340.00</span>
                  <span className="market-stock">In Stock</span>
                </div>
                <div className="market-btn">Instant Checkout ⚡</div>
              </div>
            </div>
          </div>
        )}

        <div className="mockup-sheen" />
      </div>
    </div>
  );
}

/* ── Interactive Skills Matrix ──────────────────────────────── */
function SkillsMatrix() {
  const [activeTab, setActiveTab] = useState('All');
  const categories = ['All', 'Frontend', 'Backend', 'Systems'];

  const filtered = activeTab === 'All'
    ? skillsData
    : skillsData.filter(s => s.category === activeTab);

  return (
    <div className="skills-matrix">
      <div className="skills-tabs">
        {categories.map(tab => (
          <button
            key={tab}
            className={`skills-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            <span className="skills-tab-count">
              {tab === 'All' ? skillsData.length : skillsData.filter(s => s.category === tab).length}
            </span>
          </button>
        ))}
      </div>

      <motion.div layout className="skills-grid">
        <AnimatePresence mode="popLayout">
          {filtered.map(skill => (
            <motion.div
              layout
              key={skill.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="skill-card"
            >
              <div className="skill-card-top">
                <strong>{skill.name}</strong>
                <span className="skill-level">{skill.level}</span>
              </div>
              <p className="skill-desc">{skill.desc}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/* ── Project Case Study Slide-Over Modal ────────────────────── */
function ProjectCaseStudyModal({ project, onClose }) {
  if (!project) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <motion.div
        className="case-study-modal"
        initial={{ opacity: 0, scale: 0.95, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 24 }}
        transition={{ duration: 0.22 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="case-study-header">
          <div>
            <div className="case-study-eyebrow">
              <span>{project.category}</span>
              <span className="bullet">·</span>
              <span>{project.year || '2025'}</span>
              {project.metric && <span className="metric-badge">{project.metric}</span>}
            </div>
            <h2>{project.title}</h2>
          </div>
          <button className="icon-action close-btn" onClick={onClose} aria-label="Close modal">
            <FiX />
          </button>
        </div>

        <div className="case-study-body">
          <div className="case-study-preview-wrapper">
            <ProjectBrowserMockup project={project} />
          </div>

          <div className="case-study-content">
            <div className="case-section">
              <h3>Overview</h3>
              <p>{project.description}</p>
            </div>

            {project.highlights && project.highlights.length > 0 && (
              <div className="case-section">
                <h3>Engineering Architecture & Wins</h3>
                <ul className="case-highlights-list">
                  {project.highlights.map((h, i) => (
                    <li key={i}>
                      <FiCheck className="highlight-check" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="case-section">
              <h3>Technologies</h3>
              <div className="tag-row">
                {project.tags.map(t => <span key={t}>{t}</span>)}
              </div>
            </div>

            <div className="case-study-actions">
              <a
                href={project.liveUrl || 'https://github.com/kal400'}
                target="_blank"
                rel="noreferrer"
                className="primary-button"
              >
                Visit Live Experience <Arrow />
              </a>
              <a
                href={project.githubUrl || 'https://github.com/kal400'}
                target="_blank"
                rel="noreferrer"
                className="secondary-button"
              >
                <FiGithub /> Source Code
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Cmd + K Command Palette ─────────────────────────────────── */
function CommandPalette({ open, onClose, onAction, onSelectProject }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 60);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  const allCommands = [
    { id: 'home', label: 'Go to Home', group: 'Navigation', icon: FiArrowUpRight, action: () => { window.location.hash = '#home'; onClose(); } },
    { id: 'about', label: 'Go to About Me', group: 'Navigation', icon: FiArrowUpRight, action: () => { window.location.hash = '#about'; onClose(); } },
    { id: 'portfolio', label: 'Go to Selected Work', group: 'Navigation', icon: FiBriefcase, action: () => { window.location.hash = '#portfolio'; onClose(); } },
    { id: 'skills', label: 'Go to Tech Stack & Matrix', group: 'Navigation', icon: FiCode, action: () => { window.location.hash = '#skills'; onClose(); } },
    { id: 'contact', label: 'Go to Contact', group: 'Navigation', icon: FiMail, action: () => { window.location.hash = '#contact'; onClose(); } },

    { id: 'copy-email', label: 'Copy Email Address (kaleabawoe@gmail.com)', group: 'Quick Actions', icon: FiCopy, action: () => onAction('copy-email') },
    { id: 'toggle-theme', label: 'Toggle Light / Dark Theme', group: 'Quick Actions', icon: FiSun, action: () => onAction('toggle-theme') },
    { id: 'github', label: 'Open GitHub Profile (@kal400)', group: 'Quick Actions', icon: FiGithub, action: () => window.open('https://github.com/kal400', '_blank') },
    { id: 'linkedin', label: 'Open LinkedIn Profile', group: 'Quick Actions', icon: FiLinkedin, action: () => window.open('https://linkedin.com', '_blank') },

    { id: 'proj-nova', label: 'Inspect Project: Nova Finance', group: 'Case Studies', icon: FiTrendingUp, action: () => onSelectProject('Nova Finance') },
    { id: 'proj-form', label: 'Inspect Project: Form Studio', group: 'Case Studies', icon: FiLayout, action: () => onSelectProject('Form Studio') },
    { id: 'proj-notes', label: 'Inspect Project: Field Notes', group: 'Case Studies', icon: FiEdit3, action: () => onSelectProject('Field Notes') },
    { id: 'proj-ops', label: 'Inspect Project: Ops Board', group: 'Case Studies', icon: FiActivity, action: () => onSelectProject('Ops Board') },
    { id: 'proj-market', label: 'Inspect Project: Market Home', group: 'Case Studies', icon: FiBriefcase, action: () => onSelectProject('Market Home') },
  ];

  const filtered = allCommands.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.group.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const onKey = (e) => {
      if (!open) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => (i + 1) % (filtered.length || 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => (i - 1 + (filtered.length || 1)) % (filtered.length || 1));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, filtered, selectedIndex, onClose]);

  if (!open) return null;

  return (
    <div className="cmd-backdrop" onClick={onClose}>
      <motion.div
        className="cmd-dialog"
        initial={{ opacity: 0, scale: 0.96, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -20 }}
        transition={{ duration: 0.18 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="cmd-search-bar">
          <FiSearch className="cmd-search-icon" />
          <input
            ref={inputRef}
            placeholder="Search commands, projects, actions..."
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
          />
          <span className="cmd-esc-badge" onClick={onClose}>ESC</span>
        </div>

        <div className="cmd-results">
          {filtered.length === 0 ? (
            <div className="cmd-empty">No results found for "{query}"</div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`cmd-item ${idx === selectedIndex ? 'selected' : ''}`}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="cmd-item-left">
                    <span className="cmd-item-icon"><Icon /></span>
                    <span className="cmd-item-label">{item.label}</span>
                  </div>
                  <span className="cmd-item-group">{item.group}</span>
                </div>
              );
            })
          )}
        </div>

        <div className="cmd-footer">
          <span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span>
          <span><kbd>↵</kbd> Select</span>
          <span><kbd>esc</kbd> Close</span>
        </div>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PUBLIC SITE
══════════════════════════════════════════════════════════════ */
function PublicSite() {
  const [theme,           setTheme]           = useState(() => localStorage.getItem('kalab-theme') || 'dark');
  const [menuOpen,        setMenuOpen]        = useState(false);
  const [contact,         setContact]         = useState({ name: '', email: '', message: '' });
  const [contactState,    setContactState]    = useState('idle');
  const [photo,           setPhoto]           = useState(getStoredPhoto);
  const [content,         setContent]         = useState(() => readStored(CONTENT_KEY, {}));
  const [cmdOpen,         setCmdOpen]         = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [toast,           setToast]           = useState('');

  const visibleProjects = content.projects?.length ? content.projects : projects;

  useEffect(() => {
    if (!supabase) return;
    fetchPublicContent().then(remote => {
      if (!remote) return;
      setContent({ projects: remote.projects, skills: remote.skills });
      if (remote.photo) setPhoto(remote.photo);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('kalab-theme', theme);
  }, [theme]);

  /* Scrub any legacy #admin hash or /admin path so it cannot work on this port */
  useEffect(() => {
    if (window.location.pathname.toLowerCase().startsWith('/admin')) {
      window.history.replaceState(null, '', '/');
    }
    const sanitizeHash = () => {
      if (window.location.hash.toLowerCase().startsWith('#admin')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    };
    sanitizeHash();
    window.addEventListener('hashchange', sanitizeHash);
    return () => window.removeEventListener('hashchange', sanitizeHash);
  }, []);

  /* Keyboard shortcut for Cmd + K or Ctrl + K */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen(prev => !prev);
      }
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setCmdOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleCommandAction = (actionId) => {
    if (actionId === 'copy-email') {
      navigator.clipboard.writeText('kaleabawoe@gmail.com');
      showToast('Email copied to clipboard (kaleabawoe@gmail.com)');
      setCmdOpen(false);
    }
    if (actionId === 'toggle-theme') {
      setTheme(t => t === 'dark' ? 'light' : 'dark');
      setCmdOpen(false);
    }
  };

  const handleSelectProjectByName = (name) => {
    const found = visibleProjects.find(p => p.title.toLowerCase() === name.toLowerCase());
    if (found) {
      setSelectedProject(found);
    }
    setCmdOpen(false);
  };

  const submitContact = async (e) => {
    e.preventDefault();
    setContactState('sending');
    if (supabase) {
      const { error } = await supabase.from('messages').insert(contact);
      if (error) { setContactState('error'); return; }
    }
    setContactState('sent');
    setContact({ name: '', email: '', message: '' });
  };

  return (
    <div className="reference-site">
      {/* ── NAV ─────────────────────────────────────────────── */}
      <header className="reference-nav">
        <a className="reference-brand" href="#home">
          <span>KA</span>
          <strong>Kalab</strong>
        </a>

        <nav className={menuOpen ? 'reference-links open' : 'reference-links'}>
          {navItems.map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMenuOpen(false)}>
              {item}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <LiveClock />

          <button
            className="cmd-trigger-btn"
            onClick={() => setCmdOpen(true)}
            title="Open Command Palette (⌘K)"
          >
            <FiSearch />
            <kbd>⌘K</kbd>
          </button>

          <button
            className="theme-toggle"
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle colour theme"
          >
            {theme === 'dark' ? <FiSun /> : <FiMoon />}
          </button>

          <a className="nav-contact" href="#contact">
            Hire me <Arrow />
          </a>

          <button className="mobile-toggle" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </header>

      <main>
        {/* ── HERO ──────────────────────────────────────────── */}
        <motion.section
          id="home"
          className="reference-hero"
          initial="hidden"
          animate="show"
          variants={stagger}
        >
          <div className="hero-glow glow-one" />
          <div className="hero-glow glow-two" />
          <div className="grid-overlay" />

          <div className="hero-container">
            <motion.div className="hero-content" variants={reveal}>
              <div className="status-pill">
                <span /> Available for opportunities
              </div>

              <h1>
                Building digital<br />
                products with{' '}
                <span>clarity.</span>
              </h1>

              <p className="hero-role">Frontend-first · Full-stack developer</p>

              <p className="hero-copy">
                I'm Kalab Awoke, a developer based in Addis Ababa building
                production-minded web experiences across product, commerce,
                and internal tools.
              </p>

              <div className="hero-buttons">
                <a className="primary-button" href="#portfolio">View my work <Arrow /></a>
                <a className="secondary-button" href="#contact">Let's connect <Arrow /></a>
              </div>

              <div className="social-row">
                <a href="https://github.com/kal400" target="_blank" rel="noreferrer">
                  <FiGithub /> GitHub
                </a>
                <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">
                  <FiLinkedin /> LinkedIn
                </a>
                <a href="mailto:kaleabawoe@gmail.com">
                  <FiMail /> Email
                </a>
              </div>
            </motion.div>

            <motion.div className="hero-visual" variants={reveal}>
              <ExecutivePortrait src={photo} />
            </motion.div>
          </div>

          <div className="hero-mark">KA <span>01</span></div>
        </motion.section>

        {/* ── STATS STRIP ───────────────────────────────────── */}
        <motion.section
          className="stats-strip"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={stagger}
        >
          {[['3+', 'Years building'], ['12', 'Core tools'], ['∞', 'Curiosity']].map(([value, label]) => (
            <motion.div variants={reveal} key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </motion.div>
          ))}
          <p>From the first sketch<br />to the last detail.</p>
        </motion.section>

        {/* ── ABOUT ─────────────────────────────────────────── */}
        <Section id="about" number="01" title="About me">
          <div className="about-grid">
            <motion.div variants={reveal}>
              <h2>Full-stack thinking,<br /><em>frontend-first</em> craft.</h2>
            </motion.div>
            <motion.div className="about-copy" variants={reveal}>
              <p>
                I care about making digital products feel obvious in the best way.
                That means clear decisions, thoughtful interfaces, and code that
                stays understandable after launch.
              </p>
              <p>
                My work sits between product thinking, visual systems, and
                implementation. I'm comfortable moving from an open question to
                a responsive interface, a working data flow, and the details that
                make a product feel trustworthy.
              </p>
              <a className="inline-link" href="#contact">
                More about my approach <Arrow />
              </a>
            </motion.div>
          </div>
        </Section>

        {/* ── PROCESS ───────────────────────────────────────── */}
        <Section id="process" number="02" title="How I work" className="process-section">
          <h2 className="section-title">A useful process for <em>real work.</em></h2>
          <motion.div className="process-grid" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }}>
            {process.map(([number, title, copy]) => (
              <motion.article variants={reveal} key={number}>
                <span className="process-number">{number}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
                <span className="process-line" />
              </motion.article>
            ))}
          </motion.div>
        </Section>

        {/* ── SKILLS ────────────────────────────────────────── */}
        <Section id="skills" number="03" title="Skills & Architecture">
          <div className="skills-layout-wide">
            <div className="skills-heading-row">
              <div>
                <h2>Tools for making<br /><em>reliable systems.</em></h2>
                <p>Categorized disciplines across frontend architecture, cloud data layers, and production engineering.</p>
              </div>
            </div>
            <SkillsMatrix />
          </div>
        </Section>

        {/* ── PORTFOLIO ─────────────────────────────────────── */}
        <Section id="portfolio" number="04" title="Selected work" className="portfolio-section">
          <div className="portfolio-heading">
            <div>
              <h2>Projects I've <em>engineered.</em></h2>
              <p>Interactive case studies across finance, design systems, editorial platforms, and distributed tools.</p>
            </div>
            <span className="portfolio-hint">Click any project to inspect case study</span>
          </div>

          <motion.div className="portfolio-grid" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}>
            {visibleProjects.map((project, index) => (
              <motion.article
                variants={reveal}
                whileHover={{ y: -6 }}
                className="portfolio-card clickable-card"
                key={project.title}
                onClick={() => setSelectedProject(project)}
              >
                <div className="project-mockup-frame">
                  <ProjectBrowserMockup project={project} />
                </div>

                <div className="project-details">
                  <div>
                    <div className="project-meta-row">
                      <span className="project-category">{project.category}</span>
                      {project.metric && <span className="project-metric-pill">{project.metric}</span>}
                    </div>
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <div className="tag-row">
                      {project.tags.map(tag => <span key={tag}>{tag}</span>)}
                    </div>
                  </div>
                  <div className="inspect-cta">
                    <span>Inspect</span>
                    <Arrow />
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </Section>

        {/* ── SERVICES ──────────────────────────────────────── */}
        <Section id="services" number="05" title="What I build">
          <div className="service-list">
            {[
              ['01', 'Product interfaces',       'Responsive frontend systems that make complicated workflows feel calm and clear.'],
              ['02', 'Full-stack foundations',    'Auth, data flows, APIs, dashboards, and the dependable parts behind the interface.'],
              ['03', 'Design-minded development', 'A strong visual point of view carried through spacing, states, motion, and accessibility.'],
            ].map(([num, title, copy]) => (
              <motion.article whileHover={{ y: -8 }} key={num}>
                <span>{num}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
                <Arrow />
              </motion.article>
            ))}
          </div>
        </Section>

        {/* ── CONTACT ───────────────────────────────────────── */}
        <section id="contact" className="contact-section">
          <div className="section-kicker"><span />06 — Contact</div>
          <h2>Have a good idea?<br /><em>Let's make it real.</em></h2>
          <div className="contact-grid">
            <div>
              <p>
                Open to thoughtful collaborations, product teams, and
                opportunities where good work has room to matter.
              </p>
              <a className="contact-email" href="mailto:kaleabawoe@gmail.com">
                kaleabawoe@gmail.com <Arrow />
              </a>
              <div className="contact-tz-note">
                <FiClock /> Addis Ababa (UTC+3) · Available for worldwide remote work
              </div>
            </div>
            <form onSubmit={submitContact}>
              <label>
                Name
                <input required value={contact.name} onChange={e => setContact({ ...contact, name: e.target.value })} />
              </label>
              <label>
                Email
                <input required type="email" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} />
              </label>
              <label>
                Message
                <textarea required rows="4" value={contact.message} onChange={e => setContact({ ...contact, message: e.target.value })} />
              </label>
              <button className="primary-button" disabled={contactState === 'sending'}>
                {contactState === 'sending' ? 'Sending…' : contactState === 'sent' ? 'Message sent ✓' : 'Send message'} <Arrow />
              </button>
              {contactState === 'error' && <small>Could not send — please email me directly.</small>}
            </form>
          </div>
        </section>
      </main>

      <footer className="reference-footer">
        <span>© 2026 Kalab Awoke</span>
        <LiveClock />
        <a href="#home">Back to top ↑</a>
      </footer>

      {/* ── Command Palette Modal ───────────────────────────── */}
      <AnimatePresence>
        {cmdOpen && (
          <CommandPalette
            open={cmdOpen}
            onClose={() => setCmdOpen(false)}
            onAction={handleCommandAction}
            onSelectProject={handleSelectProjectByName}
          />
        )}
      </AnimatePresence>

      {/* ── Project Case Study Modal ────────────────────────── */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectCaseStudyModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Instant Toast ───────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast-notification"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
          >
            <FiCheckCircle />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PublicSite />
  </React.StrictMode>
);
