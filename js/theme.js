// ===== Theme Engine =====
const THEMES = {
  default: {
    bg: '#0a0a0f',
    card: '#12121a',
    border: '#1e1e2a',
    text: '#e8e8f0',
    muted: '#8b8ba0',
    accent: '#c9a227',
    founder: '#c9a227',
    leader: '#e74c3c',
    member: '#6b7280',
    gradient: 'radial-gradient(ellipse at center, #151520 0%, #0a0a0f 70%)'
  },
  neon: {
    bg: '#050d0a',
    card: '#0a1a14',
    border: '#0f2a20',
    text: '#e0fff0',
    muted: '#6bb89a',
    accent: '#00ff9d',
    founder: '#00ff9d',
    leader: '#00d4ff',
    member: '#6bb89a',
    gradient: 'radial-gradient(ellipse at center, #0a1f18 0%, #050d0a 70%)'
  },
  crimson: {
    bg: '#0f0508',
    card: '#1a0a10',
    border: '#2a1018',
    text: '#ffe8ec',
    muted: '#b86b7a',
    accent: '#e74c3c',
    founder: '#ff6b6b',
    leader: '#e74c3c',
    member: '#b86b7a',
    gradient: 'radial-gradient(ellipse at center, #1a0a10 0%, #0f0508 70%)'
  },
  aurora: {
    bg: '#07070f',
    card: '#0f0f1c',
    border: '#1a1a30',
    text: '#e8e8ff',
    muted: '#8b8bb8',
    accent: '#818cf8',
    founder: '#a78bfa',
    leader: '#818cf8',
    member: '#8b8bb8',
    gradient: 'radial-gradient(ellipse at center, #12122a 0%, #07070f 70%)'
  },
  gold: {
    bg: '#0f0c05',
    card: '#1a150a',
    border: '#2a2010',
    text: '#fff8e8',
    muted: '#b8a06b',
    accent: '#c9a227',
    founder: '#f0c14b',
    leader: '#c9a227',
    member: '#b8a06b',
    gradient: 'radial-gradient(ellipse at center, #1a150a 0%, #0f0c05 70%)'
  },
  ocean: {
    bg: '#050a0f',
    card: '#0a1520',
    border: '#102030',
    text: '#e8f4ff',
    muted: '#6b9ab8',
    accent: '#0ea5e9',
    founder: '#38bdf8',
    leader: '#0ea5e9',
    member: '#6b9ab8',
    gradient: 'radial-gradient(ellipse at center, #0a1825 0%, #050a0f 70%)'
  }
};

function applyTheme(themeName, customAccent) {
  const theme = THEMES[themeName] || THEMES.default;
  const root = document.documentElement;

  // Use custom accent if provided, otherwise theme accent
  const accent = customAccent || theme.accent;

  root.style.setProperty('--bg', theme.bg);
  root.style.setProperty('--card', theme.card);
  root.style.setProperty('--border', theme.border);
  root.style.setProperty('--text', theme.text);
  root.style.setProperty('--text-muted', theme.muted);
  root.style.setProperty('--accent', accent);
  root.style.setProperty('--accent-glow', accent + '59');
  root.style.setProperty('--founder', theme.founder);
  root.style.setProperty('--leader', theme.leader);
  root.style.setProperty('--member', theme.member);

  // Apply background gradient to body
  if (document.body.classList.contains('gate-page') || document.body.classList.contains('members-page')) {
    document.body.style.background = theme.gradient;
  }

  // Store current theme for reference
  document.body.dataset.theme = themeName;
}

function applyAllSettings(s) {
  // Theme + accent
  applyTheme(s.theme || 'default', s.accent);

  // Title / subtitle if elements exist
  const titleEl = document.getElementById('siteTitle');
  const subEl = document.getElementById('siteSubtitle');
  if (titleEl) titleEl.textContent = s.title || 'GODMYEGXO';
  if (subEl) subEl.textContent = s.subtitle || 'EST. 2026';

  // Enter button text
  const enterBtn = document.getElementById('enterBtn');
  if (enterBtn) {
    const span = enterBtn.querySelector('span');
    if (span) span.textContent = s.enterText || 'ENTER';
  }

  // Favicon
  if (s.favicon) {
    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = s.favicon;
  }
}
