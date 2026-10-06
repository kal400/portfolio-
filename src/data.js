export const PHOTO_KEY   = 'kalab-portfolio-photo';
export const CONTENT_KEY = 'kalab-portfolio-content';
export const defaultPhoto = '/photo.jpg';

export const readStored = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch { return fallback; }
};

export const getStoredPhoto = () => localStorage.getItem(PHOTO_KEY) || defaultPhoto;

export const navItems = ['Home', 'About', 'Process', 'Skills', 'Portfolio', 'Services', 'Contact'];

export const projects = [
  {
    id: 'nova-finance',
    title: 'Nova Finance',
    category: 'Fintech Analytics & Operations',
    url: 'app.novafinance.io',
    description: 'A focused financial workspace that turns complex numbers into confident decisions with real-time balance aggregation and predictive liquidity metrics.',
    tags: ['React 19', 'TypeScript', 'Supabase', 'Tailwind', 'Chart.js'],
    tone: 'blue',
    featured: true,
    year: '2025',
    metric: '420ms Avg Latency',
    highlights: [
      'Sub-second real-time balance aggregation with Supabase realtime subscriptions.',
      'Optimistic mutations with rollbacks for high-frequency financial updates.',
      'Complex SVG data visualization with interactive cursor scrutiny.'
    ],
    liveUrl: 'https://github.com/kal400',
    githubUrl: 'https://github.com/kal400'
  },
  {
    id: 'form-studio',
    title: 'Form Studio',
    category: 'Spatial Design Platform',
    url: 'formstudio.design',
    description: 'A flexible digital home for an architecture & industrial design practice with headless CMS orchestration, fluid transitions, and zero layout shift.',
    tags: ['Next.js', 'Design System', 'CMS', 'Framer Motion'],
    tone: 'gold',
    featured: true,
    year: '2025',
    metric: '99/100 Lighthouse',
    highlights: [
      'Zero-layout-shift image delivery with bespoke blurhash placeholders.',
      'Dynamic container queries adapting smoothly from phone to 4K studio displays.',
      'Keyboard-accessible spatial gallery navigation with micro-gestures.'
    ],
    liveUrl: 'https://github.com/kal400',
    githubUrl: 'https://github.com/kal400'
  },
  {
    id: 'field-notes',
    title: 'Field Notes',
    category: 'Editorial Publishing System',
    url: 'fieldnotes.pub',
    description: 'A distraction-free publishing engine designed around calm reading, markdown streaming, local-first drafts, and simple content operations.',
    tags: ['Next.js', 'TypeScript', 'Node.js', 'API'],
    tone: 'violet',
    year: '2024',
    metric: 'Local-First Sync',
    highlights: [
      'IndexedDB offline persistence with seamless background synchronization.',
      'Syntax highlighting pipeline with multi-language AST parsing.',
      'Fluid reading typography engineered with precision Swiss baseline grid.'
    ],
    liveUrl: 'https://github.com/kal400',
    githubUrl: 'https://github.com/kal400'
  },
  {
    id: 'ops-board',
    title: 'Ops Board',
    category: 'Team Orchestration Tool',
    url: 'opsboard.internal',
    description: 'A clearer way for teams to see work, ownership, and the next useful action with fluid drag-and-drop mechanics and distributed state synchronization.',
    tags: ['TypeScript', 'Workflow', 'State Machine', 'UX'],
    tone: 'green',
    year: '2024',
    metric: '60 FPS Gesture Engine',
    highlights: [
      'Collision-detection drag and drop engine built with HTML5 Pointer Events.',
      'Conflict-free replicated data structures for concurrent multi-user editing.',
      'Automated keyboard shortcuts for rapid task triage and status flips.'
    ],
    liveUrl: 'https://github.com/kal400',
    githubUrl: 'https://github.com/kal400'
  },
  {
    id: 'market-home',
    title: 'Market Home',
    category: 'High-Conversion Commerce Engine',
    url: 'markethome.store',
    description: 'A blazing fast storefront foundation that gives products room to be understood, with instant optimistic checkout and global edge routing.',
    tags: ['Frontend', 'Edge Workers', 'Responsive', 'Stripe'],
    tone: 'rose',
    year: '2024',
    metric: 'Global Edge Cache',
    highlights: [
      'Distributed edge caching resulting in TTFB under 80ms globally.',
      'Micro-animations on cart interactions maximizing conversion engagement.',
      'Fully compliant accessible ARIA dialogs and robust form validation.'
    ],
    liveUrl: 'https://github.com/kal400',
    githubUrl: 'https://github.com/kal400'
  },
];

export const skillsData = [
  { name: 'React 19', category: 'Frontend', level: 'Core Specialty', desc: 'Server components, hooks, concurrent rendering' },
  { name: 'TypeScript', category: 'Frontend', level: 'Strict Mode', desc: 'Type-level programming, generics, robust interfaces' },
  { name: 'Next.js', category: 'Frontend', level: 'Production', desc: 'App router, hybrid rendering, edge middleware' },
  { name: 'Framer Motion', category: 'Frontend', level: 'Fluid UI', desc: 'Orchestrated layouts, spring physics, gestures' },
  { name: 'Tailwind / CSS', category: 'Frontend', level: 'Deep Craft', desc: 'Modern tokens, fluid clamp, zero runtime bloat' },

  { name: 'Node.js', category: 'Backend', level: 'Runtime', desc: 'REST APIs, asynchronous microservices, streaming' },
  { name: 'PostgreSQL', category: 'Backend', level: 'Relational DB', desc: 'Complex joins, indexing, query optimization' },
  { name: 'Supabase', category: 'Backend', level: 'Cloud BAAS', desc: 'Row level security, Auth, real-time channels' },
  { name: 'REST APIs', category: 'Backend', level: 'Data Layer', desc: 'API design, caching strategies, webhook ingestion' },

  { name: 'Architecture', category: 'Systems', level: 'Foundational', desc: 'Component abstraction, atomic systems, clean code' },
  { name: 'Git & GitHub CI', category: 'Systems', level: 'DevOps', desc: 'Trunk workflows, automated actions, semantic releases' },
  { name: 'Performance & A11y', category: 'Systems', level: 'Web Vitals', desc: 'WCAG AAA, Core Web Vitals optimization, INP audit' },
];

export const skills = skillsData.map(s => s.name);

export const process = [
  ['01', 'Understand', 'Start with the people, constraints, and outcome behind the brief.'],
  ['02', 'Shape',      'Turn the messy middle into a clear product direction and visual system.'],
  ['03', 'Ship',       'Build, test, and refine until the work feels simple to use and ready for real life.'],
];
