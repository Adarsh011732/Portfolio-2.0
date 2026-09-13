import { handleCors, json } from '../_lib/cors.js';
import { getCachedData, setCachedData } from '../_lib/db.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'GET') { json(res, 405, { error: 'Method not allowed' }); return; }

  try {
    const { username } = req.query;
    const forceRefresh = req.query.refresh === 'true';
    const data = await fetchGitHubProfileAndRepos(username, forceRefresh);
    json(res, 200, data);
  } catch (e) {
    json(res, 500, { error: e.message });
  }
}

async function fetchGitHubProfileAndRepos(username, forceRefresh = false) {
  const cacheKey = `gh_${username.toLowerCase()}`;
  const cached = getCachedData(cacheKey, forceRefresh);
  if (cached) return cached;

  const cleanUser = username.trim().replace(/^@/, '').replace(/https?:\/\/github\.com\//i, '').replace(/\/$/, '');

  // 1. Fetch Profile
  const userRes = await fetch(`https://api.github.com/users/${cleanUser}`, {
    headers: { 'User-Agent': 'Developer-Portfolio-App' }
  });
  if (!userRes.ok) {
    if (userRes.status === 404) throw new Error(`GitHub user "${cleanUser}" not found.`);
    throw new Error(`GitHub API error: ${userRes.statusText}`);
  }
  const userData = await userRes.json();

  // 2. Fetch Public Repositories (Up to 100)
  const reposRes = await fetch(`https://api.github.com/users/${cleanUser}/repos?sort=updated&per_page=100`, {
    headers: { 'User-Agent': 'Developer-Portfolio-App' }
  });
  const rawRepos = reposRes.ok ? await reposRes.json() : [];
  const ownRepos = rawRepos.filter(r => !r.fork && r.name.toLowerCase() !== cleanUser.toLowerCase());

  // 2.5 Fetch 365-Day GitHub Contribution Calendar
  let activity = [];
  let totalCommits = 0;
  let totalContributions = 0;

  try {
    const contribRes = await fetch(`https://github-contributions-api.jogruber.de/v4/${cleanUser}?y=last`, {
      headers: { 'User-Agent': 'Developer-Portfolio-App' }
    });
    if (contribRes.ok) {
      const contribJson = await contribRes.json();
      if (Array.isArray(contribJson.contributions)) {
        activity = contribJson.contributions.map(c => ({
          date: c.date,
          count: c.count || 0,
          level: c.level || 0
        }));
        totalContributions = contribJson.total?.lastYear ?? activity.reduce((sum, c) => sum + c.count, 0);
        totalCommits = totalContributions;
      }
    }
  } catch (e) {
    console.warn('GitHub contributions external API failed, falling back to events:', e.message);
  }

  // Fallback to recent events
  if (activity.length === 0) {
    const eventsRes = await fetch(`https://api.github.com/users/${cleanUser}/events?per_page=100`, {
      headers: { 'User-Agent': 'Developer-Portfolio-App' }
    });
    const activityMap = new Map();
    if (eventsRes.ok) {
      const events = await eventsRes.json();
      events.forEach(ev => {
        if (ev.type === 'PushEvent') {
          const dateStr = ev.created_at.split('T')[0];
          const count = ev.payload.commits ? ev.payload.commits.length : 0;
          totalCommits += count;
          activityMap.set(dateStr, (activityMap.get(dateStr) || 0) + count);
        }
      });
    }
    activity = Array.from(activityMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
    totalContributions = totalCommits;
  }

  // 3. Deep Technology Extraction
  const detectedTechSet = new Set();
  let totalStars = 0;
  let totalForks = 0;
  let totalOpenIssues = 0;

  for (const repo of rawRepos) {
    totalStars += (repo.stargazers_count ?? 0);
    totalForks += (repo.forks_count ?? 0);
    totalOpenIssues += (repo.open_issues_count ?? 0);
    if (repo.language) detectedTechSet.add(repo.language);
    if (Array.isArray(repo.topics)) {
      repo.topics.forEach(t => detectedTechSet.add(t.charAt(0).toUpperCase() + t.slice(1)));
    }
    const combinedDesc = `${repo.name} ${repo.description || ''}`.toLowerCase();
    if (combinedDesc.includes('pytorch') || combinedDesc.includes('torch')) detectedTechSet.add('PyTorch');
    if (combinedDesc.includes('transformer') || combinedDesc.includes('attention')) detectedTechSet.add('Transformers');
    if (combinedDesc.includes('nlp') || combinedDesc.includes('llm') || combinedDesc.includes('llama')) detectedTechSet.add('NLP / LLMs');
    if (combinedDesc.includes('scikit') || combinedDesc.includes('sklearn')) detectedTechSet.add('Scikit-Learn');
    if (combinedDesc.includes('pandas') || combinedDesc.includes('dataframe')) detectedTechSet.add('Pandas');
    if (combinedDesc.includes('numpy')) detectedTechSet.add('NumPy');
    if (combinedDesc.includes('fastapi')) detectedTechSet.add('FastAPI');
    if (combinedDesc.includes('flask')) detectedTechSet.add('Flask');
    if (combinedDesc.includes('django')) detectedTechSet.add('Django');
    if (combinedDesc.includes('react')) detectedTechSet.add('React');
    if (combinedDesc.includes('next.js') || combinedDesc.includes('nextjs')) detectedTechSet.add('Next.js');
    if (combinedDesc.includes('tailwind')) detectedTechSet.add('Tailwind CSS');
    if (combinedDesc.includes('docker')) detectedTechSet.add('Docker');
    if (combinedDesc.includes('audio') || combinedDesc.includes('dtw') || combinedDesc.includes('dsp')) detectedTechSet.add('DSP / Audio Processing');
  }

  // 4. Normalized GitHub Project Cards
  const formattedProjects = ownRepos.map(repo => {
    let category = "ai";
    const desc = repo.description || null;
    const text = (repo.name + " " + (desc || "")).toLowerCase();
    if (text.includes("web") || text.includes("react") || text.includes("next") || text.includes("fullstack")) category = "fullstack";
    else if (text.includes("3d") || text.includes("canvas") || text.includes("visual") || text.includes("shader")) category = "motion";
    else if (text.includes("tool") || text.includes("cli") || text.includes("script") || text.includes("readme") || text.includes("generator")) category = "tools";

    const techStack = [];
    if (repo.language) techStack.push(repo.language);
    if (Array.isArray(repo.topics)) {
      repo.topics.slice(0, 3).forEach(t => {
        const norm = t.charAt(0).toUpperCase() + t.slice(1);
        if (!techStack.includes(norm)) techStack.push(norm);
      });
    }
    if (techStack.length === 0) techStack.push("Python", "AI / ML");

    return {
      id: `gh-${repo.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      title: repo.name.replace(/[-_]/g, ' ').toUpperCase(),
      subtitle: desc ? (desc.slice(0, 80) + (desc.length > 80 ? '...' : '')) : "Open Source Repository",
      category,
      client: "GitHub Open Source",
      year: repo.updated_at ? new Date(repo.updated_at).getFullYear().toString() : new Date().getFullYear().toString(),
      featured: (repo.stargazers_count ?? 0) > 0,
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80",
      thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      liveUrl: repo.homepage || repo.html_url,
      githubUrl: repo.html_url,
      techStack,
      description: desc || "Verified open source repository maintained on GitHub.",
      concept: `Built with ${techStack.join(', ')}.`,
      challenge: "Optimized computational algorithms, code cleanliness, and reproducibility.",
      architecture: [`Maintained with ${techStack.join(', ')}`, `Repository: ${repo.html_url}`],
      metrics: [
        { label: "Stars", value: `${repo.stargazers_count ?? 0} ⭐` },
        { label: "Forks", value: `${repo.forks_count ?? 0}` },
        { label: "Open Issues", value: `${repo.open_issues_count ?? 0}` }
      ]
    };
  });

  const result = {
    platform: 'github',
    username: cleanUser,
    profileUrl: userData.html_url || `https://github.com/${cleanUser}`,
    user: {
      username: cleanUser,
      name: userData.name ?? cleanUser,
      bio: userData.bio ?? null,
      avatar: userData.avatar_url ?? null,
      location: userData.location ?? null,
      publicRepos: userData.public_repos ?? rawRepos.length,
      followers: userData.followers ?? 0,
      following: userData.following ?? 0,
      totalStars, totalForks, totalOpenIssues,
      createdAt: userData.created_at ?? null,
      updatedAt: userData.updated_at ?? null
    },
    stats: {
      repositories: userData.public_repos ?? rawRepos.length,
      stars: totalStars,
      forks: totalForks,
      followers: userData.followers ?? 0,
      commits: totalCommits
    },
    activity,
    detectedTechnologies: Array.from(detectedTechSet),
    projects: formattedProjects,
    lastUpdated: new Date().toISOString()
  };

  setCachedData(cacheKey, result);
  return result;
}
