import * as pdfjsLib from 'pdfjs-dist';
import { extractTextFromPDF, parseResumeWithAPI, extractProfileFromText } from './aiExtractionService';

export { extractTextFromPDF, parseResumeWithAPI, extractProfileFromText };

/**
 * Legacy adapter for backward compatibility
 */
export function parseResumeText(rawText) {
  const extracted = extractProfileFromText(rawText);
  return {
    personal: {
      name: extracted.personal.name || "Adarsh Singh",
      title: extracted.personal.title || "Computer Science & AI Student Developer",
      tagline: "PORTFOLIO",
      headline: "TURNING IDEAS INTO REAL-WORLD CODE & INTELLIGENT SYSTEMS",
      quote: "Driven by curiosity, powered by code. Building modern software at the intersection of AI, distributed systems, and clean web design.",
      bio: extracted.personal.bio || "Computer Science undergraduate with a passion for software engineering, generative AI, and modern web architectures.",
      location: "India / Open to Global Remote",
      email: extracted.personal.email || "adarshsingh98635@gmail.com",
      phone: extracted.personal.phone || "",
      status: "Actively Seeking Software Engineering Internships (2025/2026)",
      statusAvailable: true,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
      resumeUrl: "",
      openToRoles: [
        "Software Engineering Intern (SDE)",
        "AI / ML Research Intern",
        "Full-Stack Developer Intern",
        "Junior Web Developer"
      ]
    },
    socials: {
      github: extracted.socials.github || "https://github.com/AdarshSingh001",
      codolio: extracted.socials.codolio || "https://codolio.com/profile/01AdarshSingh",
      leetcode: extracted.socials.leetcode || "https://leetcode.com/u/Adarsh_Singh_001/",
      linkedin: extracted.socials.linkedin || "https://linkedin.com",
      email: extracted.personal.email ? `mailto:${extracted.personal.email}` : "mailto:adarshsingh98635@gmail.com"
    },
    skills: extracted.skills && extracted.skills.length > 0 ? [
      {
        category: "Verified Technologies",
        description: "Inferred from resume and profile.",
        skills: extracted.skills.map(name => ({ name, level: 90, highlight: true }))
      }
    ] : [],
    projects: extracted.projects || [],
    education: extracted.education || []
  };
}

/**
 * Sample Preset Resumes for instant student preview
 */
export const presetResumes = [
  {
    id: "cs-student-ai",
    title: "Computer Science & AI Student Developer",
    text: `ADARSH SINGH
Computer Science & AI Student Developer | KIET Group of Institutions
Email: adarshsingh98635@gmail.com | Location: India
GitHub: https://github.com/AdarshSingh001 | Codolio: https://codolio.com/profile/01AdarshSingh | LeetCode: https://leetcode.com/u/Adarsh_Singh_001/

ABOUT ME
Computer Science undergraduate with a passion for artificial intelligence, machine learning, and modern software architectures. Solved 100+ DSA problems across LeetCode and Codolio. Built open-source deep learning and NLP architectures in PyTorch. Seeking Summer/Fall 2025/2026 Software Engineering & AI Internships.

TECHNICAL SKILLS
- Programming: Python, C++, JavaScript, TypeScript, SQL
- Machine Learning & AI: PyTorch, Transformers, NLP, LLMs, Scikit-Learn, Pandas, NumPy
- Web & Tools: React 19, Next.js 15, FastAPI, Git, GitHub, Jupyter Notebook, Linux

PROJECTS
Dynamic Time Warping Audio Comparison
- Built an audio DSP comparison system in Python implementing Dynamic Time Warping algorithm for speech and waveform pattern similarity.
- Maintained as an open-source GitHub repository.

Code Generation using Fine-Tuned CodeLlama
- Fine-tuned CodeLlama on specialized Python datasets to generate automated code snippets and documentation.

Transformers Is All You Need
- Implemented multi-head attention mechanisms and transformer encoder-decoder layers from scratch in PyTorch.

EDUCATION
Bachelor of Technology in Computer Science & Engineering (2023 - 2027)
KIET Group of Institutions
Core Coursework: Data Structures & Algorithms, Machine Learning, Operating Systems, DBMS`
  }
];
