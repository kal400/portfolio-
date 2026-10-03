import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import './styles.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const navItems = ['Home', 'About', 'Process', 'Skills', 'Portfolio', 'Services', 'Contact'];
const projects = [
  { title: 'Nova Finance', category: 'Fintech dashboard', description: 'A focused financial workspace that turns complex numbers into confident decisions.', tags: ['React', 'Product UI', 'Supabase'], tone: 'blue', featured: true },
  { title: 'Form Studio', category: 'Creative platform', description: 'A flexible digital home for a design practice with a strong visual point of view.', tags: ['React', 'Design system', 'CMS'], tone: 'gold', featured: true },
  { title: 'Field Notes', category: 'Editorial platform', description: 'A publishing experience designed around calm reading and simple content operations.', tags: ['Next.js', 'Content', 'API'], tone: 'violet' },
  { title: 'Ops Board', category: 'Internal tool concept', description: 'A clearer way for teams to see work, ownership, and the next useful action.', tags: ['TypeScript', 'Workflow', 'UX'], tone: 'green' },
  { title: 'Market Home', category: 'Commerce concept', description: 'A fast storefront foundation that gives products room to be understood.', tags: ['Frontend', 'Commerce', 'Responsive'], tone: 'rose' },
];
const skills = ['React', 'JavaScript', 'TypeScript', 'Node.js', 'Supabase', 'PostgreSQL', 'REST APIs', 'Responsive UI', 'Design systems', 'Accessibility', 'Git', 'Vercel'];
const process = [
  ['01', 'Understand', 'Start with the people, constraints, and outcome behind the brief.'],
  ['02', 'Shape', 'Turn the messy middle into a clear product direction and visual system.'],
  ['03', 'Ship', 'Build, test, and refine until the work feels simple to use and ready for real life.'],
];

function Arrow() { return <span className="arrow-icon" aria-hidden="true">↗</span>; }

function PublicSite() {
  const [theme, setTheme] = useState(() => localStorage.getItem('kalab-theme') || 'dark');
  const [menuOpen, setMenuOpen] = useState(false);
  const [contact, setContact] = useState({ name: '', email: '', message: '' });
  const [contactState, setContactState] = useState('idle');

  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('kalab-theme', theme); }, [theme]);
  const submitContact = async (event) => {
    event.preventDefault(); setContactState('sending');
    if (supabase) { const { error } = await supabase.from('messages').insert(contact); if (error) { setContactState('error'); return; } }
    setContactState('sent'); setContact({ name: '', email: '', message: '' });
  };
  const closeMenu = () => setMenuOpen(false);

  return <div className="reference-site">
    <header className="reference-nav">
      <a className="reference-brand" href="#home"><span>KA</span><strong>Kalab</strong></a>
      <nav className={menuOpen ? 'reference-links open' : 'reference-links'}>{navItems.map((item) => <a key={item} href={`#${item.toLowerCase()}`} onClick={closeMenu}>{item}</a>)}</nav>
      <div className="nav-actions"><button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle color theme">{theme === 'dark' ? '☼' : '◐'}</button><a className="nav-contact" href="#contact">Contact <Arrow /></a><button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? '×' : '☰'}</button></div>
    </header>

    <main>
      <section id="home" className="reference-hero"><div className="hero-glow glow-one" /><div className="hero-glow glow-two" /><div className="grid-overlay" /><div className="hero-content"><div className="status-pill"><span /> Available for opportunities</div><h1>Building digital products with <span>clarity.</span></h1><p className="hero-role">Frontend-first / Full-stack developer</p><p className="hero-copy">I’m Kalab Awoke, a developer based in Addis Ababa building production-minded web experiences across product, commerce, and internal tools.</p><div className="hero-buttons"><a className="primary-button" href="#portfolio">View my work <Arrow /></a><a className="secondary-button" href="#contact">Let’s connect <Arrow /></a></div><div className="social-row"><a href="https://github.com/kal400" target="_blank" rel="noreferrer">GitHub</a><a href="https://www.linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a><a href="mailto:kaleabawoe@gmail.com">Email</a></div></div><div className="hero-photo"><img src="/photo.jpg" alt="Kalab Awoke illustrated portrait" /><span>PROFILE / 01</span></div><div className="hero-orbit orbit-a" /><div className="hero-orbit orbit-b" /><div className="hero-mark">KA<span>01</span></div></section>

      <section className="stats-strip"><div><strong>3+</strong><span>Ways I build</span></div><div><strong>12</strong><span>Core tools</span></div><div><strong>∞</strong><span>Curiosity</span></div><p>From the first sketch<br />to the last detail.</p></section>

      <section id="about" className="content-section about-section"><div className="section-kicker"><span>01</span><b>About me</b></div><div className="about-grid"><div><h2>Full-stack thinking, <em>frontend-first</em> craft.</h2></div><div className="about-copy"><p>I care about making digital products feel obvious in the best way. That means clear decisions, thoughtful interfaces, and code that stays understandable after launch.</p><p>My work sits between product thinking, visual systems, and implementation. I’m comfortable moving from an open question to a responsive interface, a working data flow, and the details that make a product feel trustworthy.</p><a className="inline-link" href="#contact">More about my approach <Arrow /></a></div></div></section>

      <section id="process" className="content-section process-section"><div className="section-kicker"><span>02</span><b>How I work</b></div><h2 className="section-title">A useful process for <em>real work.</em></h2><div className="process-grid">{process.map(([number, title, copy]) => <article key={number}><span className="process-number">{number}</span><h3>{title}</h3><p>{copy}</p><span className="process-line" /></article>)}</div></section>

      <section id="skills" className="content-section skills-section"><div className="section-kicker"><span>03</span><b>Skills & tools</b></div><div className="skills-layout"><h2>Tools for making<br /><em>useful things.</em></h2><div className="skill-pills">{skills.map((skill) => <span key={skill}>{skill}</span>)}</div></div></section>

      <section id="portfolio" className="content-section portfolio-section"><div className="section-kicker"><span>04</span><b>Selected work</b></div><div className="portfolio-heading"><h2>Projects I’ve <em>shaped.</em></h2><p>Concepts and shipped work across interfaces, systems, and the messy middle where products become useful.</p></div><div className="portfolio-grid">{projects.map((project) => <article className={`portfolio-card ${project.featured ? 'featured' : ''}`} key={project.title}><div className={`project-image tone-${project.tone}`}><span className="project-index">0{projects.indexOf(project) + 1}</span><span className="project-symbol">{project.title.slice(0, 1)}</span><span className="project-category">{project.category}</span></div><div className="project-details"><div><h3>{project.title}</h3><p>{project.description}</p><div className="tag-row">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div><Arrow /></div></article>)}</div></section>

      <section id="services" className="content-section services-section"><div className="section-kicker"><span>05</span><b>What I build</b></div><div className="service-list"><article><span>01</span><div><h3>Product interfaces</h3><p>Responsive frontend systems that make complicated workflows feel calm and clear.</p></div><Arrow /></article><article><span>02</span><div><h3>Full-stack foundations</h3><p>Auth, data flows, APIs, dashboards, and the dependable parts behind the interface.</p></div><Arrow /></article><article><span>03</span><div><h3>Design-minded development</h3><p>A strong visual point of view carried through spacing, states, motion, and accessibility.</p></div><Arrow /></article></div></section>

      <section id="contact" className="contact-section"><div className="contact-inner"><div className="section-kicker"><span>06</span><b>Contact</b></div><h2>Have a good idea?<br /><em>Let’s make it real.</em></h2><div className="contact-grid"><div><p>Open to thoughtful collaborations, product teams, and opportunities where good work has room to matter.</p><a className="contact-email" href="mailto:kaleabawoe@gmail.com">kaleabawoe@gmail.com <Arrow /></a></div><form onSubmit={submitContact}><label>Name<input required value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} /></label><label>Email<input required type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} /></label><label>Message<textarea required rows="4" value={contact.message} onChange={(e) => setContact({ ...contact, message: e.target.value })} /></label><button className="primary-button" disabled={contactState === 'sending'}>{contactState === 'sending' ? 'Sending…' : contactState === 'sent' ? 'Message sent ✓' : 'Send message'} <Arrow /></button>{contactState === 'error' && <small>Could not send. Please email me directly.</small>}</form></div></div></section>
    </main><footer className="reference-footer"><span>© 2026 Kalab Awoke</span><span>Built with care in Addis Ababa</span><a href="#home">Back to top ↑</a></footer>
  </div>;
}

function AdminLogin({ onLogin }) { const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const login = async (event) => { event.preventDefault(); setError(''); if (!supabase) { onLogin({ email: email || 'demo@local.dev' }); return; } const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password }); if (authError) setError(authError.message); else onLogin(data.user); }; return <div className="admin-shell auth-shell"><div className="auth-card"><a className="reference-brand" href="#home"><span>KA</span><strong>Kalab</strong></a><p className="eyebrow">Private workspace</p><h1>Welcome back.</h1><p>Manage the work, skills, experience, and messages shown on your portfolio.</p><form onSubmit={login}><label>Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label><label>Password<input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label><button className="primary-button">Sign in <Arrow /></button>{error && <small>{error}</small>}{!supabase && <small>Demo mode: connect Supabase variables for real authentication.</small>}</form></div></div>; }
function AdminDashboard({ user, onLogout }) { const [active, setActive] = useState('Overview'); const nav = ['Overview', 'Projects', 'Skills', 'Experience', 'Messages']; return <div className="admin-shell"><aside className="admin-sidebar"><a className="reference-brand" href="#home"><span>KA</span><strong>Admin</strong></a><nav>{nav.map((item) => <button className={active === item ? 'active' : ''} onClick={() => setActive(item)} key={item}>{item}</button>)}</nav><button className="logout" onClick={onLogout}>Log out ↗</button></aside><main className="admin-main"><div className="admin-topbar"><div><p className="eyebrow">Portfolio workspace</p><h1>{active}</h1></div><span>{user.email}</span></div><div className="overview-grid"><div><span>Published projects</span><strong>03</strong></div><div><span>Skills listed</span><strong>12</strong></div><div><span>Unread messages</span><strong>02</strong></div></div><section className="admin-panel"><p className="eyebrow">Manage content</p><h2>Keep your story current.</h2><p>Connect Supabase to persist projects, skills, experience, and contact messages.</p><button className="primary-button" onClick={() => setActive('Projects')}>Manage projects <Arrow /></button></section></main></div>; }
function App() { const [admin, setAdmin] = useState(window.location.hash.startsWith('#admin')); const [user, setUser] = useState(null); useEffect(() => { const onHash = () => setAdmin(window.location.hash.startsWith('#admin')); window.addEventListener('hashchange', onHash); return () => window.removeEventListener('hashchange', onHash); }, []); if (!admin) return <PublicSite />; return user ? <AdminDashboard user={user} onLogout={() => setUser(null)} /> : <AdminLogin onLogin={setUser} />; }
createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
