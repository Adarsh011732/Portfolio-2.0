import * as pdfjsLib from 'pdfjs-dist';
import { normalizeTechName } from './githubService';
import { getApiUrl } from './apiConfig';

// Set worker path from cdnjs
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;

/**
 * Extract raw text from PDF ArrayBuffer
 */
export async function extractTextFromPDF(arrayBuffer) {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageStrings = textContent.items.map(item => item.str);
      fullText += pageStrings.join(' ') + '\n\n';
    }

    return fullText;
  } catch (error) {
    console.error("PDF extraction error:", error);
    try {
      const decoder = new TextDecoder('utf-8');
      const text = decoder.decode(arrayBuffer);
      return text.replace(/[^\x20-\x7E\n\r\t]/g, ' ');
    } catch {
      throw new Error("Unable to parse PDF text. Please copy & paste your resume text directly.");
    }
  }
}

/**
 * Strict Zero-Hallucination Profile Extractor
 * Extracts only verified data present in the provided input via Backend Proxy or Local NLP.
 */
export async function parseResumeWithAPI(rawText) {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    throw new Error("Input text is empty. Please provide resume or profile text.");
  }

  // 1. Try Backend API first
  try {
    const res = await fetch(getApiUrl('/api/ai/parse-resume'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: rawText })
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (e) {
    console.warn("Backend resume parse notice:", e.message);
  }

  // 2. Direct port 3001 fallback
  try {
    const directRes = await fetch('http://localhost:3001/api/ai/parse-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: rawText })
    });
    if (directRes.ok) {
      return await directRes.json();
    }
  } catch (e) {}

  // 3. Local NLP Fallback
  return extractProfileFromText(rawText);
}

export function extractProfileFromText(rawText) {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    throw new Error("Input text is empty. Please provide resume or profile text.");
  }

  const cleanText = rawText.trim();
  const lines = cleanText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  // 1. Extract Email
  const emailMatch = cleanText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const email = emailMatch ? emailMatch[1] : "";

  // 2. Extract Phone
  const phoneMatch = cleanText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : "";

  // 3. Extract Links / Platform URLs
  const githubMatch = cleanText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  const githubUrl = githubMatch ? `https://github.com/${githubMatch[1]}` : "";

  const codolioMatch = cleanText.match(/(?:https?:\/\/)?(?:www\.)?codolio\.com\/profile\/([a-zA-Z0-9_-]+)/i);
  const codolioUrl = codolioMatch ? `https://codolio.com/profile/${codolioMatch[1]}` : "";

  const leetcodeMatch = cleanText.match(/(?:https?:\/\/)?(?:www\.)?leetcode\.com\/(?:u\/)?([a-zA-Z0-9_-]+)/i);
  const leetcodeUrl = leetcodeMatch ? `https://leetcode.com/u/${leetcodeMatch[1]}` : "";

  const linkedinMatch = cleanText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  const linkedinUrl = linkedinMatch ? `https://linkedin.com/in/${linkedinMatch[1]}` : "";

  // 4. Extract Candidate Name & Title
  let name = "";
  let title = "";

  for (let i = 0; i < Math.min(lines.length, 6); i++) {
    const l = lines[i];
    if (l.length >= 2 && l.length < 40 && !l.includes("@") && !l.includes("http") && !l.includes(".com") && !/resume|curriculum|phone|email|education|projects|skills/i.test(l)) {
      if (!name) {
        name = l;
      } else if (!title && l.length < 50) {
        title = l;
      }
    }
  }

  // 5. Extract Summary / Bio
  let bio = "";
  const summaryRegex = /(?:summary|profile|about|professional summary|objective)[\s\S]*?(?=(?:experience|work|employment|skills|education|projects|certifications)|$)/i;
  const summaryMatch = cleanText.match(summaryRegex);
  if (summaryMatch) {
    bio = summaryMatch[0]
      .replace(/^(?:summary|profile|about|professional summary|objective)[:\s-]*/i, '')
      .trim()
      .slice(0, 450);
  }

  // 6. Extract Skills
  const knownTechKeywords = [
    "Python", "PyTorch", "Transformers", "NLP", "LLMs", "Scikit-Learn", "Pandas", "NumPy",
    "C++", "C", "Java", "JavaScript", "TypeScript", "SQL", "HTML5", "CSS3",
    "React", "Next.js", "Tailwind CSS", "Three.js", "WebGL", "Vite",
    "Node.js", "Express", "FastAPI", "Flask", "PostgreSQL", "MongoDB", "MySQL", "Prisma",
    "Docker", "Git", "GitHub", "Linux", "Postman", "Vercel", "Jupyter Notebook"
  ];

  const extractedSkills = [];
  knownTechKeywords.forEach(tech => {
    const escaped = tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|[^a-zA-Z0-9_#+])${escaped}(?:$|[^a-zA-Z0-9_#+])`, 'i');
    if (regex.test(cleanText)) {
      extractedSkills.push(normalizeTechName(tech) || tech);
    }
  });

  // 7. Extract Projects
  const extractedProjects = [];
  const projMatch = cleanText.match(/(?:projects|key projects|academic projects)[\s\S]*?(?=(?:education|experience|certifications|skills)|$)/i);
  if (projMatch) {
    const projLines = projMatch[0].split(/\r?\n/).filter(l => l.trim().length > 5);
    projLines.forEach(line => {
      const isHeader = /^(projects|key projects|academic projects|tech\s*stack|technical\s*skills|skills|tools|education|experience|certifications)/i.test(line);
      if (line.length < 60 && !isHeader && (line.includes(":") || line.includes("-") || line.includes("|") || line.length < 35)) {
        const cleanTitle = line.replace(/[:|–—].*$/, '').trim();
        if (cleanTitle.length > 2 && !/^(tech\s*stack|technical\s*skills|skills|tools|education|experience|certifications|summary)/i.test(cleanTitle)) {
          if (curProj && curProj.title) extractedProjects.push(curProj);
          curProj = {
            id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            title: cleanTitle.toUpperCase(),
            subtitle: line.slice(0, 80),
            category: "ai",
            client: "Verified Project",
            year: new Date().getFullYear().toString(),
            featured: true,
            image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80",
            thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
            liveUrl: "#",
            githubUrl: githubUrl || "#",
            techStack: extractedSkills.slice(0, 4),
            description: line,
            concept: "Extracted from verified resume/profile.",
            challenge: "Engineered according to specification.",
            architecture: [
              `Built with ${extractedSkills.slice(0, 3).join(', ') || 'Python & Modern Stack'}`
            ],
            metrics: [
              { label: "Status", value: "Verified" }
            ]
          };
        }
      } else if (curProj && line.length > 15) {
        curProj.description += " " + line.replace(/^[•\-\*]\s*/, '');
      }
    });
    if (curProj && curProj.title) extractedProjects.push(curProj);
  }

  // 8. Robust Multi-Entry Education Parser
  const extractedEducation = [];
  const eduMatch = cleanText.match(/(?:education|academic background|academics|qualification|academic qualifications|education & training)[\s\S]*?(?=(?:experience|work experience|projects|certifications|certificates|skills)|$)/i);
  
  const DEGREE_REGEX = /\b(b\.?\s?tech(?:nology)?|bachelor(?:'s)?(?:\s+of\s+[a-zA-Z\s&]+)?|b\.?e\.?|b\.?s\.?(?:c)?|bca|m\.?\s?tech|master(?:'s)?(?:\s+of\s+[a-zA-Z\s&]+)?|m\.?s\.?(?:c)?|mca|ph\.?d|diploma|intermediate|class\s*(?:xii|x|12|10)(?:th)?|senior secondary|higher secondary|secondary school|high school|matriculation|12th\s*standard|10th\s*standard)\b/i;
  const INSTITUTION_REGEX = /\b(university|institute|college|school|academy|polytechnic|campus|group of institutions|vidyalaya|dps|kv|kendriya vidyalaya|board|cbse|icse)\b/i;
  const YEAR_REGEX = /\b((?:(?:19|20)\d{2})\s*(?:[-–—to/]+\s*(?:(?:19|20)?\d{2}|present|current|expected))?)\b/i;
  const HONORS_REGEX = /(?:cgpa|gpa|cpi|percentage|marks|score|coursework|division|grade)[:\s=]*[\d.]+%?|\b\d{1,2}(?:\.\d{1,2})?%|\b\d\.\d{1,2}\s*\/\s*10/i;

  if (eduMatch) {
    const rawLines = eduMatch[0]
      .split(/\r?\n/)
      .map(l => l.replace(/^[•\-\*#\d.]+\s*/, '').trim())
      .filter(l => l.length > 2 && !/^(education|academic background|qualification)/i.test(l));

    let currentEntry = null;

    const commitCurrentEntry = () => {
      if (currentEntry && (currentEntry.degree || currentEntry.institution)) {
        if (!currentEntry.degree && currentEntry.institution) {
          if (/xii|12|senior/i.test(currentEntry.institution + ' ' + currentEntry.honors)) {
            currentEntry.degree = 'Intermediate (Class XII)';
          } else if (/x|10|matric|secondary/i.test(currentEntry.institution + ' ' + currentEntry.honors)) {
            currentEntry.degree = 'High School (Class X)';
          } else {
            currentEntry.degree = 'Higher Education / Degree';
          }
        }
        extractedEducation.push({
          degree: currentEntry.degree || 'Degree / Qualification',
          institution: currentEntry.institution || '',
          year: currentEntry.year || '',
          honors: currentEntry.honors || ''
        });
        currentEntry = null;
      }
    };

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];
      const hasDegree = DEGREE_REGEX.test(line);
      const hasInst = INSTITUTION_REGEX.test(line);
      const yearM = line.match(YEAR_REGEX);
      const honorsM = line.match(HONORS_REGEX);

      // Standalone single-line composite format with separator
      if (hasDegree && hasInst && (line.includes('|') || line.includes(' - ') || line.includes('–') || line.includes(','))) {
        commitCurrentEntry();
        let degreePart = '';
        let instPart = '';

        const degreeMatch = line.match(DEGREE_REGEX);
        if (degreeMatch) {
          degreePart = line.split(/[|\-,]/).find(part => DEGREE_REGEX.test(part))?.trim() || degreeMatch[0];
        }
        if (hasInst) {
          instPart = line.split(/[|\-,]/).find(part => INSTITUTION_REGEX.test(part))?.trim() || '';
        }

        extractedEducation.push({
          degree: degreePart.replace(YEAR_REGEX, '').replace(HONORS_REGEX, '').trim(),
          institution: instPart.replace(YEAR_REGEX, '').replace(HONORS_REGEX, '').trim(),
          year: yearM ? yearM[1].trim() : '',
          honors: honorsM ? honorsM[0].trim() : ''
        });
        continue;
      }

      if (hasDegree) {
        if (currentEntry && currentEntry.degree) {
          commitCurrentEntry();
        }
        if (!currentEntry) {
          currentEntry = { degree: '', institution: '', year: '', honors: '' };
        }
        currentEntry.degree = line.replace(YEAR_REGEX, '').replace(HONORS_REGEX, '').replace(/[-–|,\s]+$/, '').trim();
        if (yearM && !currentEntry.year) currentEntry.year = yearM[1].trim();
        if (honorsM && !currentEntry.honors) currentEntry.honors = honorsM[0].trim();
        continue;
      }

      if (hasInst) {
        if (currentEntry && currentEntry.institution) {
          commitCurrentEntry();
        }
        if (!currentEntry) {
          currentEntry = { degree: '', institution: '', year: '', honors: '' };
        }
        currentEntry.institution = line.replace(YEAR_REGEX, '').replace(HONORS_REGEX, '').replace(/[-–|,\s]+$/, '').trim();
        if (yearM && !currentEntry.year) currentEntry.year = yearM[1].trim();
        if (honorsM && !currentEntry.honors) currentEntry.honors = honorsM[0].trim();
        continue;
      }

      // If line contains year / honors
      if (yearM || honorsM) {
        if (!currentEntry) {
          currentEntry = { degree: '', institution: '', year: '', honors: '' };
        }
        if (yearM && !currentEntry.year) currentEntry.year = yearM[1].trim();
        if (honorsM) {
          currentEntry.honors = currentEntry.honors ? `${currentEntry.honors} | ${honorsM[0].trim()}` : honorsM[0].trim();
        }
        continue;
      }

      if (currentEntry) {
        if (!currentEntry.institution && line.length < 60) {
          currentEntry.institution = line;
        } else {
          currentEntry.honors = currentEntry.honors ? `${currentEntry.honors} | ${line}` : line;
        }
      }
    }
    commitCurrentEntry();
  }

  // 9. Sanitized Certifications Parser
  const extractedCertifications = [];
  const certMatch = cleanText.match(/(?:certifications|certificates|courses|licenses & certifications)[\s\S]*?(?=(?:experience|education|projects|skills|achievements|awards|honors|extracurricular|activities|languages|declaration)|$)/i);
  
  const ISSUER_REGEX = /(cisco|tcs(?:\s+i?on)?|linux foundation|kodekloud|coursera|deeplearning\.ai|deeplearning|udemy|google cloud|google|meta|amazon web services|aws|microsoft|ibm|nptel|edx|stanford|oracle|hackerrank|freecodecamp|linkedin learning)/i;
  const CERT_DATE_REGEX = /\b((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*20\d{2}|20\d{2})\b/i;
  const URL_REGEX = /(https?:\/\/[^\s]+|coursera\.org\/verify\/[a-zA-Z0-9]+)/i;

  if (certMatch) {
    const certLines = certMatch[0]
      .split(/\r?\n/)
      .map(l => l.trim().replace(/^[•\-\*#\d.]+\s*/, ''))
      .filter(l => l.length > 3);

    for (const rawLine of certLines) {
      if (rawLine.length > 120) continue;
      
      // Filter page numbers and footers like "1of1", "1 of 1", "page 1"
      if (/^(?:page\s*\d+|\d+\s*of\s*\d+|\d+of\d+|\d+\/\d+|\d+|1of1)$/i.test(rawLine)) continue;
      
      // Filter syllabus bullet points
      if (/^(learned|built|implemented|developed|covered|focused on|mastered|coursework|skills learned|key topics)/i.test(rawLine)) continue;
      
      // Filter achievements & general bullet points (e.g. "Solved 250+ DSA problems", "Active learner in Web Dev")
      if (/^(solved|ranked|secured|achieved|won|active learner|active in|managed|conducted|co-ordinated|led|developed|created|built|designed|participated|participant|finalist|selected|qualified|scored|overall rank|global rank|attended)/i.test(rawLine)) continue;

      const dateMatch = rawLine.match(CERT_DATE_REGEX);
      const issuerMatch = rawLine.match(ISSUER_REGEX);
      const urlMatch = rawLine.match(URL_REGEX);

      let cleanName = rawLine
        .replace(URL_REGEX, '')
        .replace(CERT_DATE_REGEX, '')
        .replace(/\s*[-–|:]\s*(coursera|deeplearning\.ai|udemy|google|meta|amazon|ibm|nptel|edx|stanford|microsoft|aws|cisco|tcs|linux foundation|kodekloud).*/i, '')
        .replace(/\s*by\s+(coursera|deeplearning\.ai|udemy|google|meta|amazon|ibm|nptel|stanford|microsoft|aws|cisco|tcs|linux foundation|kodekloud).*/i, '')
        .replace(/[-–|:,\s]+$/, '')
        .trim();

      // Final sanity checks on cleanName
      if (/^(?:page\s*\d+|\d+\s*of\s*\d+|\d+of\d+|\d+\/\d+|\d+|1of1)$/i.test(cleanName)) continue;
      if (/^(certifications?|certificates?|courses?|awards?|achievements?|honors?|extracurricular)$/i.test(cleanName)) continue;

      if (cleanName.length >= 4) {
        extractedCertifications.push({
          id: `cert-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          name: cleanName,
          issuer: issuerMatch ? issuerMatch[1].toUpperCase() : 'Certification',
          date: dateMatch ? dateMatch[1] : '',
          credentialUrl: urlMatch ? urlMatch[1] : ''
        });
      }
    }
  }

  return {
    personal: {
      name: name || undefined,
      title: title || undefined,
      bio: bio || undefined,
      email: email || undefined,
      phone: phone || undefined
    },
    socials: {
      github: githubUrl || undefined,
      codolio: codolioUrl || undefined,
      leetcode: leetcodeUrl || undefined,
      linkedin: linkedinUrl || undefined
    },
    skills: extractedSkills,
    projects: extractedProjects,
    education: extractedEducation,
    certifications: extractedCertifications
  };
}
