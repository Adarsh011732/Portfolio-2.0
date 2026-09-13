import { normalizeTechName } from './githubService';

/**
 * Project Management & Ingestion Service
 */

export function createProjectFromInput({
  title,
  subtitle,
  category = 'fullstack',
  description,
  liveUrl,
  githubUrl,
  techStack,
  image,
  year = new Date().getFullYear().toString(),
  client = 'Independent Project'
}) {
  if (!title || !title.trim()) throw new Error("Project title is required");

  // Normalize tech stack array or comma-separated string
  let tags = [];
  if (Array.isArray(techStack)) {
    tags = techStack.map(t => normalizeTechName(t)).filter(Boolean);
  } else if (typeof techStack === 'string') {
    tags = techStack.split(',').map(t => normalizeTechName(t)).filter(Boolean);
  }

  if (tags.length === 0) tags = ['Web Application'];

  const cleanImage = image && image.trim() 
    ? image.trim() 
    : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80';

  return {
    id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: title.trim(),
    subtitle: subtitle?.trim() || description?.slice(0, 80) || 'Full-Stack Application',
    category,
    client,
    year,
    featured: true,
    image: cleanImage,
    thumbnail: cleanImage,
    liveUrl: liveUrl?.trim() || '#',
    githubUrl: githubUrl?.trim() || '#',
    techStack: tags,
    description: description?.trim() || 'Real-world project designed and implemented with modern technologies.',
    concept: `Engineered using ${tags.join(', ')}.`,
    challenge: 'Ensuring clean architecture, reliability, and responsive user experience.',
    architecture: [
      `Built with ${tags.join(', ')}`,
      liveUrl && liveUrl !== '#' ? `Live deployment: ${liveUrl}` : 'Production deployment ready',
      githubUrl && githubUrl !== '#' ? `Source code: ${githubUrl}` : 'Open source codebase'
    ],
    metrics: [
      { label: "Status", value: "Verified & Live" },
      { label: "Architecture", value: "Clean & Modular" }
    ]
  };
}
