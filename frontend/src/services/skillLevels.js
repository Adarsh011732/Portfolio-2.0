/**
 * Real skill-level resolution from GitHub language analytics.
 *
 * Levels are no longer invented: GitHub's per-repo language byte counts are
 * aggregated by the backend into a profile-wide percentage breakdown (the same
 * data GitHub renders as colored language bars). Every skill that maps to a
 * real language gets that live percentage; everything else falls back to the
 * hand-curated initial-portfolio levels — never a flat invented number.
 */

// Common skill-name spellings -> GitHub language names
const LANGUAGE_ALIASES = {
  js: 'javascript',
  ts: 'typescript',
  nodejs: 'javascript',
  node: 'javascript',
  py: 'python',
  cpp: 'c++',
  csharp: 'c#',
  golang: 'go',
  postgres: 'postgresql',
  nextjs: 'nextjs',
  reactjs: 'reactjs'
};

function normalizeComponent(raw) {
  const base = String(raw || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.:]+$/, '')
    .replace(/\./g, ''); // "next.js" -> "nextjs", "node.js" -> "nodejs"
  return LANGUAGE_ALIASES[base] || base;
}

/** Split combined skill names ("JavaScript & TypeScript") into components. */
function splitSkillComponents(skillName) {
  return String(skillName || '')
    .split(/\s*&\s*|\s*,\s*|\s*\/\s*|\s+and\s+/i)
    .map((s) => s.trim())
    .filter(Boolean);
}

function findLanguagePercentage(component, breakdown) {
  const norm = normalizeComponent(component);
  const exact = breakdown.find((l) => normalizeComponent(l.name) === norm);
  if (exact) return exact.percentage;

  // SQL family: "SQL & Databases" matches SQL / T-SQL / PLSQL etc.
  if (norm.includes('sql')) {
    const sqlLang = breakdown.find((l) => normalizeComponent(l.name).includes('sql'));
    if (sqlLang) return sqlLang.percentage;
  }
  return null;
}

/**
 * Resolve a skill name against the live GitHub language breakdown.
 * For combined names the strongest component wins.
 * Returns { level, verified } or null when GitHub has no data for it.
 */
export function resolveSkillLevel(skillName, languageBreakdown) {
  if (!Array.isArray(languageBreakdown) || languageBreakdown.length === 0) return null;
  const components = splitSkillComponents(skillName);
  let best = null;
  for (const comp of components) {
    const pct = findLanguagePercentage(comp, languageBreakdown);
    if (pct != null && (best == null || pct > best)) best = pct;
  }
  if (best == null) return null;
  return { level: Math.round(best), verified: true };
}

/** Flatten curated skill levels (initialPortfolioData.skills) into a name->level map. */
export function buildStaticLevelMap(skillsCategories) {
  const map = new Map();
  (skillsCategories || []).forEach((cat) => {
    (cat.skills || []).forEach((s) => {
      if (typeof s.name === 'string' && Number.isFinite(s.level)) {
        const key = normalizeComponent(s.name);
        if (!map.has(key)) map.set(key, s.level);
      }
    });
  });
  return map;
}

/**
 * Assign levels to a list of extracted skill names:
 * live GitHub percentage where available, curated level as fallback, null otherwise.
 */
export function assignSkillLevels(skillNames, languageBreakdown, staticLevelMap) {
  return (skillNames || []).map((name) => {
    const resolved = resolveSkillLevel(name, languageBreakdown);
    if (resolved) {
      return { name, level: resolved.level, verified: true, highlight: true };
    }
    const staticLevel = staticLevelMap ? staticLevelMap.get(normalizeComponent(name)) : undefined;
    if (Number.isFinite(staticLevel)) {
      return { name, level: staticLevel, verified: false, highlight: false };
    }
    return { name, level: null, verified: false, highlight: false };
  });
}

/**
 * Apply live GitHub percentages to an existing skills structure,
 * preserving curated levels for skills GitHub cannot measure.
 */
export function applyRealLevelsToSkills(skillsCategories, languageBreakdown) {
  if (!Array.isArray(languageBreakdown) || languageBreakdown.length === 0 || !Array.isArray(skillsCategories)) {
    return skillsCategories;
  }
  return skillsCategories.map((cat) => ({
    ...cat,
    skills: (cat.skills || []).map((skill) => {
      const resolved = resolveSkillLevel(skill.name, languageBreakdown);
      if (resolved) return { ...skill, level: resolved.level, verified: true };
      return { ...skill, verified: false };
    })
  }));
}

// GitHub's classic language colors (with a deterministic fallback palette)
const GH_LANG_COLORS = {
  javascript: '#f1e05a',
  typescript: '#3178c6',
  python: '#3572a5',
  html: '#e34c26',
  css: '#563d7c',
  'c++': '#f34b7d',
  c: '#555555',
  'c#': '#178600',
  java: '#b07219',
  go: '#00add8',
  rust: '#dea584',
  php: '#4f5d95',
  ruby: '#701516',
  swift: '#f05138',
  kotlin: '#a97bff',
  dart: '#00b4ab',
  shell: '#89e051',
  'jupyter notebook': '#da5b0b',
  scss: '#c6538c',
  vue: '#41b883',
  dockerfile: '#384d54',
  r: '#198ce7',
  matlab: '#bb92ac',
  lua: '#000080',
  haskell: '#5e5086',
  'objective-c': '#438eff',
  assembly: '#6e4c13',
  powershell: '#012456'
};

const FALLBACK_PALETTE = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#84cc16'];

export function githubLanguageColor(name) {
  return (
    GH_LANG_COLORS[String(name).toLowerCase().trim()] ||
    FALLBACK_PALETTE[(String(name).length * 7) % FALLBACK_PALETTE.length]
  );
}
