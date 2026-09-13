import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { initialPortfolioData } from '../data/initialPortfolio';
import { fetchGitHubData, fetchLeetCodeData, fetchCodolioData, fetchCodeforcesData } from '../services/platformDataService';
import { aggregateCodingStats } from '../services/codingStatsService';
import { getApiUrl } from '../services/apiConfig';
import confetti from 'canvas-confetti';

const PortfolioContext = createContext(null);

const STORAGE_KEY = 'portfolio_prod_v8';
const THEME_KEY = 'portfolio_theme_v10';
const CODING_PLATFORMS_KEY = 'portfolio_coding_platforms_v8';
const CODOLIO_KEY = 'portfolio_codolio_data_v8';
const GITHUB_KEY = 'portfolio_github_data_v8';

export function PortfolioProvider({ children }) {
  const [portfolio, setPortfolio] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.projects)) {
          // Filter out empty or dummy entries while preserving all valid projects and GitHub repos
          parsed.projects = parsed.projects.filter(p =>
            p && p.title && !(
              /^(tech\s*stack|technical\s*skills)$/i.test(p.title.trim()) && !p.githubUrl
            )
          );
        }
        if (Array.isArray(parsed.certifications) && parsed.certifications.length > 0) {
          parsed.certifications = parsed.certifications
            .filter(c => c && c.name &&
              !/^(?:1of1|\d+of\d+|page\s*\d+|\d+\/\d+|\d+|solved\s+\d+|active\s+learner|participant|ranked)/i.test(c.name.trim()) &&
              c.name.trim().length >= 4
            )
            .map(c => ({
              ...c,
              issuer: (!c.issuer || c.issuer.toLowerCase().includes('verified')) ? 'Certification' : c.issuer
            }));
        }
        if (!Array.isArray(parsed.certifications) || parsed.certifications.length === 0) {
          parsed.certifications = initialPortfolioData.certifications;
        }
        if (!Array.isArray(parsed.education) || parsed.education.length < 3) {
          parsed.education = initialPortfolioData.education;
        }
        if (parsed.socials) {
          if (!parsed.socials.linkedin || parsed.socials.linkedin === 'https://linkedin.com' || parsed.socials.linkedin === '#') {
            parsed.socials.linkedin = 'https://www.linkedin.com/in/adarsh-singh-6216981b3/';
          }
        }
        return parsed;
      }
    } catch (e) { }
    return initialPortfolioData;
  });

  // Dark theme is permanently the default
  const theme = 'dark';
  const isDarkMode = true;
  const toggleTheme = () => {};

  // Connected coding platforms list
  const [codingPlatforms, setCodingPlatforms] = useState(() => {
    try {
      const saved = localStorage.getItem(CODING_PLATFORMS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return [
      {
        platform: 'leetcode',
        username: 'Adarsh_Singh_001',
        profileUrl: 'https://leetcode.com/u/Adarsh_Singh_001/',
        stats: {
          problemsSolved: 109,
          easy: 80,
          medium: 27,
          hard: 2,
          ranking: 1524999,
          rating: null,
          contests: 0,
          streak: null
        },
        lastUpdated: new Date().toISOString(),
        status: 'synced'
      }
    ];
  });

  // Codolio profile integration
  const [codolioProfile, setCodolioProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(CODOLIO_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return {
      platform: 'codolio',
      username: '01AdarshSingh',
      name: 'Adarsh Singh',
      profileUrl: 'https://codolio.com/profile/01AdarshSingh',
      stats: {
        problemsSolved: 109,
        easy: 80,
        medium: 27,
        hard: 2,
        streak: 5,
        activeDays: 53,
        ranking: 36307
      },
      platforms: [
        {
          platform: 'LeetCode',
          username: 'Adarsh_Singh_001',
          solved: 109,
          easy: 80,
          medium: 27,
          hard: 2
        }
      ],
      lastUpdated: new Date().toISOString(),
      status: 'synced'
    };
  });

  // GitHub user profile & repositories
  const [gitHubStats, setGitHubStats] = useState(() => {
    try {
      const saved = localStorage.getItem(GITHUB_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return {
      platform: 'github',
      username: 'AdarshSingh001',
      profileUrl: 'https://github.com/AdarshSingh001',
      stats: {
        repositories: 12,
        stars: 3,
        forks: 0,
        followers: 4
      },
      user: {
        username: 'AdarshSingh001',
        name: 'Adarsh Singh',
        publicRepos: 12,
        totalStars: 3
      },
      detectedTechnologies: ['Python', 'PyTorch', 'Transformers', 'NLP / LLMs', 'Scikit-Learn', 'Pandas', 'Jupyter Notebook', 'DSP / Audio Processing'],
      lastUpdated: new Date().toISOString()
    };
  });

  const [selectedProject, setSelectedProject] = useState(null);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLiveStatsModalOpen, setIsLiveStatsModalOpen] = useState(false);

  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isLeetCodeModalOpen, setIsLeetCodeModalOpen] = useState(false);
  const [isCodolioModalOpen, setIsCodolioModalOpen] = useState(false);
  const [isCodingPlatformsModalOpen, setIsCodingPlatformsModalOpen] = useState(false);
  const [isCertificateModalOpenState, setIsCertificateModalOpenState] = useState(false);
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [isOwnerAuthModalOpen, setIsOwnerAuthModalOpen] = useState(false);

  // Owner Mode Switch (Hides all admin/sync/add buttons from public visitors)
  const [isOwnerMode, setIsOwnerModeState] = useState(() => {
    try {
      return localStorage.getItem('portfolio_owner_mode') === 'true';
    } catch (e) {
      return false;
    }
  });

  const setIsCertificateModalOpen = (val) => {
    if (val && !isOwnerMode) {
      showToast('🔒 Owner Mode required to add or manage certificates', 'error');
      setIsOwnerAuthModalOpen(true);
      return;
    }
    setIsCertificateModalOpenState(val);
  };

  const isCertificateModalOpen = isCertificateModalOpenState && isOwnerMode;

  const toggleOwnerMode = () => {
    if (!isOwnerMode) {
      // Prompt 2-Step OTP / Passkey Verification to log in
      setIsOwnerAuthModalOpen(true);
    } else {
      // Log out of Owner Mode
      setIsOwnerModeState(false);
      setIsCertificateModalOpenState(false);
      setIsAdminOpen(false);
      setIsAddProjectModalOpen(false);
      setIsGitHubModalOpen(false);
      setIsResumeModalOpen(false);
      setIsLeetCodeModalOpen(false);
      try {
        localStorage.setItem('portfolio_owner_mode', 'false');
      } catch (e) { }
      showToast('🔒 Logged out of Owner Mode — Switched to Visitor View');
    }
  };

  const setIsOwnerMode = (val) => {
    setIsOwnerModeState(val);
    if (!val) {
      setIsCertificateModalOpenState(false);
      setIsAdminOpen(false);
      setIsAddProjectModalOpen(false);
      setIsGitHubModalOpen(false);
      setIsResumeModalOpen(false);
      setIsLeetCodeModalOpen(false);
    }
    try {
      localStorage.setItem('portfolio_owner_mode', String(val));
    } catch (e) { }
  };

  const [activeCategory, setActiveCategory] = useState('all');
  const [toastMessage, setToastMessage] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadedFromBackend, setIsLoadedFromBackend] = useState(false);

  // Dynamic Portfolio Initial Load from Database (Vercel Serverless / Local Backend)
  useEffect(() => {
    const loadDynamicPortfolio = async () => {
      try {
        let res = null;
        try {
          res = await fetch(getApiUrl('/api/portfolio'));
        } catch {
          if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
            res = await fetch('http://localhost:3001/api/portfolio');
          }
        }
        if (res && res.ok) {
          const remoteData = await res.json();
          if (remoteData && typeof remoteData === 'object' && remoteData.personal) {
            setPortfolio(remoteData);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteData));
          }
        }
      } catch (err) {
        console.warn('Backend dynamic portfolio load note:', err);
      } finally {
        setIsLoadedFromBackend(true);
      }
    };
    loadDynamicPortfolio();
  }, []);

  // Sync state to local storage and persistent backend database
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
      if (isLoadedFromBackend) {
        fetch(getApiUrl('/api/portfolio'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(portfolio)
        }).catch(() => {
          if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
            fetch('http://localhost:3001/api/portfolio', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(portfolio)
            }).catch(() => {});
          }
        });
      }
    } catch (e) { }
  }, [portfolio, isLoadedFromBackend]);

  useEffect(() => {
    try {
      localStorage.setItem(CODING_PLATFORMS_KEY, JSON.stringify(codingPlatforms));
    } catch (e) { }
  }, [codingPlatforms]);

  useEffect(() => {
    if (codolioProfile) {
      localStorage.setItem(CODOLIO_KEY, JSON.stringify(codolioProfile));
    }
  }, [codolioProfile]);

  useEffect(() => {
    if (gitHubStats) {
      localStorage.setItem(GITHUB_KEY, JSON.stringify(gitHubStats));
    }
  }, [gitHubStats]);

  // Always ensure dark theme is enforced
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.classList.add('dark');
    localStorage.setItem(THEME_KEY, 'dark');
  }, []);

  // Initial load auto-fetch from backend preserving user's connected links
  useEffect(() => {
    const initFetch = async () => {
      // 1. Codolio — fetch using stored handle
      const activeCodolio = portfolio.socials?.codolio || codolioProfile?.username || '01AdarshSingh';
      if (activeCodolio) {
        try {
          const codolioData = await fetchCodolioData(activeCodolio);
          if (codolioData?.stats?.problemsSolved != null) {
            setCodolioProfile(codolioData);
          }
        } catch (e) { }
      }

      // 2. LeetCode — fetch using stored handle
      const activeLeetCode = portfolio.socials?.leetcode || 'Adarsh_Singh_001';
      if (activeLeetCode) {
        try {
          const lcData = await fetchLeetCodeData(activeLeetCode);
          if (lcData?.stats?.problemsSolved != null) {
            setCodingPlatforms(prev => {
              const filtered = prev.filter(p => p.platform !== 'leetcode');
              return [...filtered, lcData];
            });
          }
        } catch (e) { }
      }

      // 3. GitHub — fetch using stored handle
      const activeGitHub = portfolio.socials?.github || gitHubStats?.username || 'AdarshSingh001';
      if (activeGitHub) {
        try {
          const ghData = await fetchGitHubData(activeGitHub);
          if (ghData) {
            setGitHubStats(ghData);
          }
        } catch (e) { }
      }
    };

    initFetch();
  }, []);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    showToast(`Switched theme to ${newTheme.toUpperCase()}`);
  };

  // Aggregated coding metrics using exact numbers
  const aggregatedCoding = useMemo(() => {
    return aggregateCodingStats(codingPlatforms, codolioProfile);
  }, [codingPlatforms, codolioProfile]);

  // Distinct technologies strictly inferred from GitHub and projects
  const computedTechnologies = useMemo(() => {
    const techSet = new Set();

    if (gitHubStats?.detectedTechnologies) {
      gitHubStats.detectedTechnologies.forEach(t => techSet.add(t));
    }

    portfolio.projects?.forEach(p => {
      if (Array.isArray(p.techStack)) {
        p.techStack.forEach(t => techSet.add(t));
      }
    });

    portfolio.skills?.forEach(cat => {
      cat.skills?.forEach(s => techSet.add(s.name));
    });

    return Array.from(techSet);
  }, [gitHubStats, portfolio.projects, portfolio.skills]);

  // Dynamic quantitative metrics with REAL DATA ONLY and null safety
  const dynamicStats = useMemo(() => {
    return [
      {
        id: 'projects',
        label: "Live Projects",
        value: portfolio.projects.length > 0 ? `${portfolio.projects.length}` : "0",
        change: portfolio.projects.length > 0 ? "Live Repos" : "Add project +",
        hasData: portfolio.projects.length > 0
      },
      {
        id: 'coding',
        label: "DSA Problems Solved",
        value: aggregatedCoding.totalSolved != null ? `${aggregatedCoding.totalSolved}` : "Data unavailable",
        change: aggregatedCoding.totalSolved != null
          ? `E:${aggregatedCoding.easy ?? aggregatedCoding.easySolved ?? 0} | M:${aggregatedCoding.medium ?? aggregatedCoding.mediumSolved ?? 0} | H:${aggregatedCoding.hard ?? aggregatedCoding.hardSolved ?? 0}`
          : "Connect Profile",
        hasData: aggregatedCoding.totalSolved != null
      },
      {
        id: 'github',
        label: "GitHub Repositories",
        value: gitHubStats?.stats?.repositories != null ? `${gitHubStats.stats.repositories}` : "Data unavailable",
        change: gitHubStats?.stats?.stars ? `${gitHubStats.stats.stars} Stars ⭐` : (gitHubStats ? "Open Source" : "Sync repos"),
        hasData: gitHubStats?.stats?.repositories != null
      },
      {
        id: 'technologies',
        label: "Core Technologies",
        value: computedTechnologies.length > 0 ? `${computedTechnologies.length}` : "Data unavailable",
        change: "Inferred from Stack",
        hasData: computedTechnologies.length > 0
      }
    ];
  }, [portfolio.projects, aggregatedCoding, gitHubStats, computedTechnologies]);

  // Sync Codolio profile with forceRefresh
  const syncCodolio = async (urlOrUsername) => {
    try {
      const data = await fetchCodolioData(urlOrUsername, true);
      setCodolioProfile(data);
      setPortfolio(prev => ({
        ...prev,
        socials: {
          ...prev.socials,
          codolio: data.profileUrl
        }
      }));
      confetti({ particleCount: 80, spread: 60 });
      showToast(`Connected Codolio profile: @${data.username} (${data.stats?.problemsSolved ?? 0} solved)!`);
      return data;
    } catch (err) {
      showToast(err.message || "Failed to sync Codolio profile", "error");
      throw err;
    }
  };

  // Add / Sync a coding platform with forceRefresh
  const addCodingPlatform = async (platformId, usernameOrUrl) => {
    try {
      let data = null;
      if (platformId === 'leetcode') data = await fetchLeetCodeData(usernameOrUrl, true);
      else if (platformId === 'codeforces') data = await fetchCodeforcesData(usernameOrUrl, true);
      else if (platformId === 'codolio') data = await fetchCodolioData(usernameOrUrl, true);
      else {
        data = {
          platform: platformId,
          username: usernameOrUrl,
          profileUrl: usernameOrUrl.startsWith('http') ? usernameOrUrl : '#',
          stats: { problemsSolved: null },
          lastUpdated: new Date().toISOString(),
          status: 'connected'
        };
      }

      setCodingPlatforms(prev => {
        const filtered = prev.filter(p => p.platform !== platformId);
        return [...filtered, data];
      });

      if (portfolio.socials[platformId] !== undefined) {
        setPortfolio(prev => ({
          ...prev,
          socials: { ...prev.socials, [platformId]: data.profileUrl }
        }));
      }

      confetti({ particleCount: 70, spread: 50 });
      showToast(`Connected ${platformId.toUpperCase()} (${data.stats?.problemsSolved ?? 0} solved)!`);
      return data;
    } catch (err) {
      showToast(err.message || `Failed to add ${platformId}`, "error");
      throw err;
    }
  };

  const removeCodingPlatform = (platformId) => {
    setCodingPlatforms(prev => prev.filter(p => p.platform !== platformId));
    showToast(`Removed ${platformId} platform`);
  };

  // Sync GitHub repositories with forceRefresh — stats & tech only, projects NOT auto-injected
  const syncGitHub = async (usernameOrUrl) => {
    try {
      const data = await fetchGitHubData(usernameOrUrl, true);
      setGitHubStats(data);

      setPortfolio(prev => ({
        ...prev,
        personal: {
          ...prev.personal,
          name: data.user?.name || prev.personal.name,
          avatar: data.user?.avatar || prev.personal.avatar
        },
        socials: {
          ...prev.socials,
          github: data.profileUrl
        }
      }));

      confetti({ particleCount: 70, spread: 60 });
      showToast(`GitHub synced: ${data.stats.repositories} repos, ${data.detectedTechnologies.length} technologies detected. Select repos to add below.`);
      return data;
    } catch (err) {
      showToast(err.message || 'Failed to sync GitHub profile', 'error');
      throw err;
    }
  };

  // Add only user-selected GitHub repos to portfolio projects
  const addSelectedGitHubProjects = (selectedProjects) => {
    if (!selectedProjects || selectedProjects.length === 0) return;
    setPortfolio(prev => {
      const incomingIds = new Set(selectedProjects.map(p => p.id));
      const remainingPrev = (prev.projects || []).filter(p => !incomingIds.has(p.id));
      return {
        ...prev,
        projects: [...selectedProjects, ...remainingPrev]
      };
    });
    // Automatically switch to 'all' category so every newly added project is immediately visible
    setActiveCategory('all');
    confetti({ particleCount: 90, spread: 70 });
    showToast(`Added ${selectedProjects.length} project${selectedProjects.length > 1 ? 's' : ''} to your portfolio!`);
  };

  // Real data refresh mechanism querying backend with forceRefresh = true
  const refreshAllCodingStats = async () => {
    setIsRefreshing(true);
    try {
      if (codolioProfile?.username) {
        try {
          const freshCodolio = await fetchCodolioData(codolioProfile.username, true);
          setCodolioProfile(freshCodolio);
        } catch (e) { }
      }

      const updated = await Promise.all(
        codingPlatforms.map(async (p) => {
          try {
            if (p.platform === 'leetcode') return await fetchLeetCodeData(p.username, true);
            if (p.platform === 'codeforces') return await fetchCodeforcesData(p.username, true);
            return p;
          } catch (e) {
            return p;
          }
        })
      );
      setCodingPlatforms(updated);

      if (gitHubStats?.username) {
        try {
          const ghData = await fetchGitHubData(gitHubStats.username, true);
          setGitHubStats(ghData);
        } catch (e) { }
      }

      showToast("Live data refreshed from official APIs!");
    } finally {
      setIsRefreshing(false);
    }
  };

  const addProject = (project) => {
    setPortfolio(prev => ({
      ...prev,
      projects: [project, ...(prev.projects || [])]
    }));
    setActiveCategory('all');
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
    showToast(`Project added! Total live projects: ${(portfolio.projects?.length || 0) + 1}`);
  };

  const updateProject = (id, updatedFields) => {
    setPortfolio(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, ...updatedFields } : p)
    }));
    showToast("Project updated successfully");
  };

  const deleteProject = (id) => {
    setPortfolio(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id)
    }));
    showToast('Project removed');
  };

  const addCertification = (cert) => {
    if (!isOwnerMode) {
      showToast('🔒 Owner Mode required to add certificates', 'error');
      setIsOwnerAuthModalOpen(true);
      return;
    }
    setPortfolio(prev => ({
      ...prev,
      certifications: [cert, ...(prev.certifications || [])]
    }));
    confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
    showToast(`Certificate added: ${cert.name}`);
  };

  const updateCertification = (id, updatedCert) => {
    if (!isOwnerMode) {
      showToast('🔒 Owner Mode required to update certificates', 'error');
      setIsOwnerAuthModalOpen(true);
      return;
    }
    setPortfolio(prev => ({
      ...prev,
      certifications: (prev.certifications || []).map(c => c.id === id ? { ...c, ...updatedCert } : c)
    }));
    showToast('Certificate updated');
  };

  const deleteCertification = (id) => {
    if (!isOwnerMode) {
      showToast('🔒 Owner Mode required to remove certificates', 'error');
      setIsOwnerAuthModalOpen(true);
      return;
    }
    setPortfolio(prev => ({
      ...prev,
      certifications: (prev.certifications || []).filter(c => c.id !== id)
    }));
    showToast('Certificate removed');
  };

  const updatePersonal = (fields) => {
    setPortfolio(prev => ({
      ...prev,
      personal: { ...prev.personal, ...fields }
    }));
    showToast("Personal details updated");
  };

  const updateSocials = (fields) => {
    setPortfolio(prev => ({
      ...prev,
      socials: { ...prev.socials, ...fields }
    }));
    showToast("Social links updated");
  };

  const addEducation = (edu) => {
    setPortfolio(prev => ({
      ...prev,
      education: [edu, ...(prev.education || [])]
    }));
    confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
    showToast(`Education added: ${edu.degree}`);
  };

  const updateEducation = (index, updatedEdu) => {
    setPortfolio(prev => ({
      ...prev,
      education: (prev.education || []).map((edu, i) => i === index ? { ...edu, ...updatedEdu } : edu)
    }));
    showToast('Education updated');
  };

  const deleteEducation = (index) => {
    setPortfolio(prev => ({
      ...prev,
      education: (prev.education || []).filter((_, i) => i !== index)
    }));
    showToast('Education entry removed');
  };

  const applyResumeData = (extracted) => {
    setPortfolio(prev => {
      const merged = { ...prev };
      if (extracted.personal) {
        merged.personal = { ...merged.personal, ...extracted.personal };
      }
      if (extracted.socials) {
        merged.socials = { ...merged.socials, ...extracted.socials };
      }
      if (extracted.skills && extracted.skills.length > 0) {
        merged.skills = [
          {
            category: "Verified Technologies",
            description: "Extracted from verified profile & documents.",
            skills: extracted.skills.map(name => ({ name, level: 90, highlight: true }))
          }
        ];
      }
      if (extracted.projects && extracted.projects.length > 0) {
        merged.projects = [...extracted.projects, ...merged.projects.filter(p => !extracted.projects.some(ep => ep.title === p.title))];
      }
      if (extracted.education && extracted.education.length > 0) {
        merged.education = extracted.education;
      }
      if (extracted.certifications && extracted.certifications.length > 0) {
        // Smart merge: preserve existing credentialUrl if names match
        merged.certifications = extracted.certifications.map(newCert => {
          const existing = (prev.certifications || []).find(c =>
            c.name?.toLowerCase().trim() === newCert.name?.toLowerCase().trim() ||
            c.issuer?.toLowerCase().trim() === newCert.issuer?.toLowerCase().trim()
          );
          return {
            ...newCert,
            credentialUrl: newCert.credentialUrl || existing?.credentialUrl || ''
          };
        });
      }
      return merged;
    });

    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    showToast("Portfolio successfully updated with verified data!");
  };

  const resetToDefault = () => {
    setPortfolio(initialPortfolioData);
    setCodingPlatforms([]);
    setCodolioProfile(null);
    setGitHubStats(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CODING_PLATFORMS_KEY);
    localStorage.removeItem(CODOLIO_KEY);
    localStorage.removeItem(GITHUB_KEY);
    fetch(getApiUrl('/api/portfolio'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(initialPortfolioData)
    }).catch(() => {
      if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        fetch('http://localhost:3001/api/portfolio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(initialPortfolioData)
        }).catch(() => {});
      }
    });
    showToast("Reset to clean initial state");
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      portfolio,
      codingPlatforms,
      codolioProfile,
      gitHubStats
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `portfolio-config-${portfolio.personal.name.toLowerCase().replace(/\s+/g, '-')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Portfolio configuration exported!");
  };

  const importJSON = (jsonData) => {
    try {
      const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      if (parsed.portfolio) setPortfolio(parsed.portfolio);
      if (parsed.codingPlatforms) setCodingPlatforms(parsed.codingPlatforms);
      if (parsed.codolioProfile) setCodolioProfile(parsed.codolioProfile);
      if (parsed.gitHubStats) setGitHubStats(parsed.gitHubStats);
      confetti({ particleCount: 90, spread: 70 });
      showToast("Portfolio configuration imported successfully!");
    } catch (e) {
      showToast("Error importing configuration: " + e.message, "error");
    }
  };

  return (
    <PortfolioContext.Provider value={{
      portfolio,
      theme,
      setTheme,
      isDarkMode,
      toggleTheme,
      codingPlatforms,
      codolioProfile,
      gitHubStats,
      aggregatedCoding,
      dynamicStats,
      computedTechnologies,
      isRefreshing,
      syncCodolio,
      syncGitHub,
      addSelectedGitHubProjects,
      addCodingPlatform,
      removeCodingPlatform,
      refreshAllCodingStats,
      selectedProject,
      setSelectedProject,
      isResumeModalOpen,
      setIsResumeModalOpen,
      isAdminOpen,
      setIsAdminOpen,
      isLiveStatsModalOpen,
      setIsLiveStatsModalOpen,
      isOwnerMode,
      setIsOwnerMode,
      toggleOwnerMode,
      isAddProjectModalOpen,
      setIsAddProjectModalOpen,
      isGitHubModalOpen,
      setIsGitHubModalOpen,
      isLeetCodeModalOpen,
      setIsLeetCodeModalOpen,
      isCodolioModalOpen,
      setIsCodolioModalOpen,
      isCodingPlatformsModalOpen,
      setIsCodingPlatformsModalOpen,
      isCertificateModalOpen,
      setIsCertificateModalOpen,
      isEducationModalOpen,
      setIsEducationModalOpen,
      isOwnerAuthModalOpen,
      setIsOwnerAuthModalOpen,
      activeCategory,
      setActiveCategory,
      toastMessage,
      showToast,
      updatePersonal,
      updateSocials,
      addProject,
      updateProject,
      deleteProject,
      addEducation,
      updateEducation,
      deleteEducation,
      addCertification,
      updateCertification,
      deleteCertification,
      applyResumeData,
      resetToDefault,
      exportJSON,
      importJSON
    }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) throw new Error("usePortfolio must be used within PortfolioProvider");
  return context;
}
