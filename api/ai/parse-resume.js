import { handleCors, readBody, json } from '../_lib/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const body = await readBody(req, 10 * 1024 * 1024); // up to 10MB for base64 PDF
    const payload = JSON.parse(body || '{}');
    let rawText = '';

    if (payload.pdf) {
      rawText = await parsePDFBase64(payload.pdf);
    } else {
      rawText = payload.text || '';
    }

    if (!rawText.trim()) {
      json(res, 400, { error: 'No text or PDF content provided' });
      return;
    }

    const result = extractResumeFields(rawText);
    json(res, 200, result);
  } catch (e) {
    json(res, 400, { error: e.message || 'Failed to parse resume' });
  }
}

async function parsePDFBase64(base64String) {
  const buffer = Buffer.from(base64String, 'base64');
  const { PDFParse } = await import('pdf-parse');
  const parser = new PDFParse({ data: buffer });
  const textResult = await parser.getText();
  await parser.destroy();
  return textResult.text || '';
}

function extractResumeFields(rawText) {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    throw new Error('Resume text is empty');
  }

  const text = rawText
    .replace(/[\uFFFD\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
    .replace(/[ï§Ð🕿]/g, ' ')
    .trim();

  const firstMatch = (regex) => { const m = text.match(regex); return m ? m[1]?.trim() ?? m[0]?.trim() : null; };

  // 1. Email
  const email = firstMatch(/([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/);

  // 2. Phone
  const phone = firstMatch(/(?:\+?(\d{1,3})[\s\-.]?)?[\(]?(\d{3,5})[\)\s\-.]?(\d{3,4})[\s\-.]?(\d{3,4})/);

  // 3. Links
  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_\-]+)/i);
  const githubUrl = githubMatch ? `https://github.com/${githubMatch[1]}` : null;

  const codolioMatch = text.match(/(?:https?:\/\/)?(?:www\.)?codolio\.com\/profile\/([a-zA-Z0-9_\-]+)/i);
  const codolioUrl = codolioMatch ? `https://codolio.com/profile/${codolioMatch[1]}` : null;

  const leetcodeMatch = text.match(/(?:https?:\/\/)?(?:www\.)?leetcode\.com\/(?:u\/)?([a-zA-Z0-9_\-]+)/i);
  const leetcodeUrl = leetcodeMatch ? `https://leetcode.com/u/${leetcodeMatch[1]}` : null;

  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_\-]+)/i);
  const linkedinUrl = linkedinMatch ? `https://linkedin.com/in/${linkedinMatch[1]}` : null;

  // 4. Name & Title
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  let name = null;
  let title = null;

  for (const l of lines.slice(0, 8)) {
    if (!name && l.length >= 2 && l.length <= 50 &&
        !l.includes('@') && !l.includes('http') && !l.match(/^\d/) &&
        !/resume|curriculum|objective|summary|skills|education|experience|projects|phone|email/i.test(l)) {
      name = l;
    } else if (name && !title && l.length >= 4 && l.length <= 80 &&
        !l.includes('@') && !l.includes('http') && !l.match(/^\d/) &&
        !/resume|curriculum|objective|summary|skills|education|experience|projects|phone|email/i.test(l)) {
      title = l;
      break;
    }
  }

  // 5. Section extraction helper
  const ALL_SECTIONS = [
    'summary', 'profile', 'about me', 'about', 'objective', 'professional summary',
    'skills', 'technical skills', 'skills & tools', 'technical proficiencies',
    'education', 'academic background', 'academics', 'qualification', 'academic qualifications', 'education & training',
    'experience', 'work experience', 'internships', 'employment history', 'professional experience',
    'projects', 'key projects', 'academic projects', 'personal projects', 'featured projects',
    'certifications', 'certificates', 'courses', 'licenses & certifications',
    'achievements', 'awards', 'honors', 'extracurricular', 'extra-curricular', 'co-curricular', 'activities', 'interests', 'hobbies', 'languages', 'declaration', 'references', 'publications',
    'contact', 'contact information'
  ];

  const extractSection = (sectionKeywords) => {
    const escapedKeywords = sectionKeywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const startPattern = new RegExp(
      `^[\\s•\\-\\d.*#]*\\b(?:${escapedKeywords.join('|')})\\b[\\s:–—\\-]*$`,
      'im'
    );
    const startMatch = text.match(startPattern);
    if (!startMatch) return null;

    const startIdx = startMatch.index + startMatch[0].length;
    const remainder = text.slice(startIdx);

    const otherSections = ALL_SECTIONS.filter(s => !sectionKeywords.some(k => s.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(s.toLowerCase())));
    const escapedOthers = otherSections.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const stopPattern = new RegExp(
      `^[\\s•\\-\\d.*#]*\\b(?:${escapedOthers.join('|')})\\b[\\s:–—\\-]*$`,
      'im'
    );
    const stopMatch = remainder.match(stopPattern);
    return stopMatch ? remainder.slice(0, stopMatch.index).trim() : remainder.trim();
  };

  // 6. Summary / Bio
  let bio = null;
  const summarySection = extractSection(['summary', 'profile', 'about me', 'about', 'objective', 'professional summary']);
  if (summarySection) {
    const cleanBioLines = summarySection.split(/\r?\n/)
      .map(l => l.replace(/^[:\-–—\s]+/, '').trim())
      .filter(l => l.length > 15 && !l.includes('@') && !l.includes('http') && !l.match(/\+?\d{10}/));
    if (cleanBioLines.length > 0) {
      bio = cleanBioLines.join(' ').slice(0, 500);
    }
  }

  // 7. Skills
  const knownTech = [
    'Python', 'PyTorch', 'TensorFlow', 'Transformers', 'NLP', 'LLMs', 'LangChain',
    'Scikit-Learn', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib', 'OpenCV',
    'C++', 'C', 'Java', 'JavaScript', 'TypeScript', 'SQL', 'HTML5', 'CSS3',
    'React', 'Next.js', 'Vue', 'Angular', 'Node.js', 'Express', 'FastAPI', 'Flask', 'Django',
    'PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'SQLite',
    'Docker', 'Kubernetes', 'Git', 'GitHub', 'Linux', 'Bash', 'AWS', 'GCP', 'Azure',
    'Postman', 'Vercel', 'Netlify', 'Jupyter', 'Jupyter Notebook', 'CUDA',
    'REST APIs', 'GraphQL', 'WebSockets', 'Prisma', 'Tailwind CSS',
    'Data Structures', 'Algorithms', 'Machine Learning', 'Deep Learning',
    'Computer Vision', 'Natural Language Processing', 'Reinforcement Learning',
    'RAG', 'Vector Databases', 'Pinecone', 'FAISS', 'Weaviate'
  ];

  const extractedSkills = knownTech.filter(k => {
    const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(?:^|[^a-zA-Z0-9_#+\\-])${escaped}(?:$|[^a-zA-Z0-9_#+\\-])`, 'i').test(text);
  });

  // 8. Projects
  const extractedProjects = [];
  const projectsText = extractSection(['projects', 'key projects', 'academic projects', 'personal projects', 'featured projects']);

  if (projectsText) {
    const projLines = projectsText.split(/\r?\n/).map(l => l.trim()).filter(l => l);
    let curProj = null;

    for (const line of projLines) {
      const isTitleLine = (
        line.length < 70 &&
        !line.match(/^[•\-\*\d]/) &&
        !line.match(/^(projects?|built|used|created|implemented|developed|tech\s*stack|technical\s*skills|skills|tools|technologies|education|experience|certifications|awards|summary|profile|links|contact|coursework)/i) &&
        (line.match(/^[A-Z]/) || line.includes(':') || line.includes('|'))
      ) || line.match(/\|\s*(Python|React|Java|C\+\+|Node)/i);

      if (isTitleLine && line.length > 3) {
        const cleanTitle = line.replace(/\s*[:|–——|].*$/, '').trim();
        if (cleanTitle.length > 2 && !/^(tech\s*stack|technical\s*skills|skills|tools|education|experience|certifications|summary)/i.test(cleanTitle)) {
          if (curProj?.title) extractedProjects.push(curProj);
          curProj = {
            id: `proj-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            title: cleanTitle.toUpperCase(),
            subtitle: line.slice(0, 80),
            category: 'ai',
            client: 'Personal / Academic Project',
            year: new Date().getFullYear().toString(),
            featured: true,
            image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
            thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
            liveUrl: '#',
            githubUrl: githubUrl ?? '#',
            techStack: extractedSkills.slice(0, 4),
            description: line,
            concept: 'Extracted from verified resume.',
            challenge: 'Engineered to specification.',
            architecture: [`Built with ${extractedSkills.slice(0, 3).join(', ') || 'Python'}`],
            metrics: [{ label: 'Status', value: 'Verified' }]
          };
        }
      } else if (curProj && line.length > 10) {
        curProj.description += ' ' + line.replace(/^[•\-\*]\s*/, '');
      }
    }
    if (curProj?.title) extractedProjects.push(curProj);
  }

  // 9. Education
  const extractedEducation = [];
  const educationText = extractSection(['education', 'academic background', 'academics', 'qualification', 'academic qualifications', 'education & training']);

  const DEGREE_REGEX = /\b(b\.?\s?tech(?:nology)?|bachelor(?:'s)?(?:\s+of\s+[a-zA-Z\s&]+)?|b\.?e\.?|b\.?s\.?(?:c)?|bca|m\.?\s?tech|master(?:'s)?(?:\s+of\s+[a-zA-Z\s&]+)?|m\.?s\.?(?:c)?|mca|ph\.?d|diploma|intermediate|class\s*(?:xii|x|12|10)(?:th)?|senior secondary|higher secondary|secondary school|high school|matriculation|12th\s*standard|10th\s*standard)\b/i;
  const INSTITUTION_REGEX = /\b(university|institute|college|school|academy|polytechnic|campus|group of institutions|vidyalaya|dps|kv|kendriya vidyalaya|board|cbse|icse)\b/i;
  const YEAR_REGEX = /\b((?:(?:19|20)\d{2})\s*(?:[-–—to/]+\s*(?:(?:19|20)?\d{2}|present|current|expected))?)\b/i;
  const HONORS_REGEX = /(?:cgpa|gpa|cpi|percentage|marks|score|coursework|division|grade)[:\s=]*[\d.]+%?|\b\d{1,2}(?:\.\d{1,2})?%|\b\d\.\d{1,2}\s*\/\s*10/i;

  if (educationText) {
    const rawLines = educationText.split(/\r?\n/).map(l => l.replace(/^[•\-\*#\d.]+\s*/, '').trim()).filter(l => l.length > 2);
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
        if (currentEntry && currentEntry.degree) commitCurrentEntry();
        if (!currentEntry) currentEntry = { degree: '', institution: '', year: '', honors: '' };
        currentEntry.degree = line.replace(YEAR_REGEX, '').replace(HONORS_REGEX, '').replace(/[-–|,\s]+$/, '').trim();
        if (yearM && !currentEntry.year) currentEntry.year = yearM[1].trim();
        if (honorsM && !currentEntry.honors) currentEntry.honors = honorsM[0].trim();
        continue;
      }

      if (hasInst) {
        if (currentEntry && currentEntry.institution) commitCurrentEntry();
        if (!currentEntry) currentEntry = { degree: '', institution: '', year: '', honors: '' };
        currentEntry.institution = line.replace(YEAR_REGEX, '').replace(HONORS_REGEX, '').replace(/[-–|,\s]+$/, '').trim();
        if (yearM && !currentEntry.year) currentEntry.year = yearM[1].trim();
        if (honorsM && !currentEntry.honors) currentEntry.honors = honorsM[0].trim();
        continue;
      }

      if (yearM || honorsM) {
        if (!currentEntry) currentEntry = { degree: '', institution: '', year: '', honors: '' };
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

  // 10. Certifications
  const extractedCertifications = [];
  const certText = extractSection(['certifications', 'certificates', 'courses', 'licenses & certifications']);

  const ISSUER_REGEX = /(cisco|tcs(?:\s+i?on)?|linux foundation|kodekloud|coursera|deeplearning\.ai|deeplearning|udemy|google cloud|google|meta|amazon web services|aws|microsoft|ibm|nptel|edx|stanford|oracle|hackerrank|freecodecamp|linkedin learning)/i;
  const CERT_DATE_REGEX = /\b((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*20\d{2}|20\d{2})\b/i;
  const URL_REGEX = /(https?:\/\/[^\s]+|coursera\.org\/verify\/[a-zA-Z0-9]+)/i;

  if (certText) {
    const certLines = certText.split(/\r?\n/)
      .map(l => l.trim().replace(/^[•\-\*#\d.]+\s*/, ''))
      .filter(l => l.length > 3);

    for (const rawLine of certLines) {
      if (rawLine.length > 120) continue;
      if (/^(?:page\s*\d+|\d+\s*of\s*\d+|\d+of\d+|\d+\/\d+|\d+|1of1)$/i.test(rawLine)) continue;
      if (/^(learned|built|implemented|developed|covered|focused on|mastered|coursework|skills learned|key topics)/i.test(rawLine)) continue;
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
      name: name ?? undefined,
      title: title ?? undefined,
      bio: bio ?? undefined,
      email: email ?? undefined,
      phone: phone ?? undefined
    },
    socials: {
      github: githubUrl ?? undefined,
      codolio: codolioUrl ?? undefined,
      leetcode: leetcodeUrl ?? undefined,
      linkedin: linkedinUrl ?? undefined
    },
    skills: extractedSkills,
    projects: extractedProjects,
    education: extractedEducation,
    certifications: extractedCertifications
  };
}
