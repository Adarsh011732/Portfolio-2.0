/**
 * AI Assistant and Career Copilot Service (Tailored for Student Developers & SDE Interns)
 * Offers offline intelligent heuristic generation + optional live Gemini API key integration.
 */

export class AIService {
  static getApiKey() {
    return localStorage.getItem('studio_gemini_api_key') || '';
  }

  static setApiKey(key) {
    if (key) {
      localStorage.setItem('studio_gemini_api_key', key.trim());
    } else {
      localStorage.removeItem('studio_gemini_api_key');
    }
  }

  /**
   * Comprehensive Student Portfolio Audit & Internship Readiness Analysis
   */
  static async auditPortfolio(portfolioData) {
    const apiKey = this.getApiKey();

    if (apiKey) {
      try {
        const prompt = `You are a Technical University Recruiter evaluating a student's portfolio for Software Engineering & AI internships. Return a JSON object with:
- "score": number between 85 and 99
- "tier": string (e.g. "Top 5% Student Developer", "Strong SDE Intern Candidate", "High-Potential AI Student")
- "strengths": array of 3-4 strings highlighting key selling points (DSA, live projects, GitHub, modern stack)
- "missingAreas": array of 2-3 strings highlighting areas to polish
- "recommendations": array of 3-4 actionable steps to maximize internship interview invitations.

Candidate Profile:
${JSON.stringify({
  personal: portfolioData.personal,
  skills: portfolioData.skills,
  projects: portfolioData.projects,
  education: portfolioData.education
}, null, 2)}`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        if (res.ok) {
          const data = await res.json();
          const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (jsonText) return JSON.parse(jsonText);
        }
      } catch (err) {
        console.warn("Gemini API call failed, using heuristic student audit fallback:", err);
      }
    }

    // Heuristic Student Audit Analysis
    const totalSkills = portfolioData.skills?.reduce((acc, cat) => acc + cat.skills.length, 0) || 0;
    const projectCount = portfolioData.projects?.length || 0;

    let score = 91;
    if (totalSkills >= 8) score += 2;
    if (projectCount >= 2) score += 3;
    score = Math.min(score, 98);

    return {
      score,
      tier: score >= 94 ? "Top 3% High-Potential AI / SDE Intern" : "Strong Software Engineering Intern Candidate",
      strengths: [
        `Solid foundation in CS fundamentals, Data Structures & Algorithms, and Machine Learning.`,
        `${projectCount > 0 ? `${projectCount} verified open-source repositories` : 'Verified GitHub codebase'} with practical AI/ML and deep learning architectures.`,
        `Active DSA problem solving on LeetCode & Codolio with verified Easy, Medium, and Hard problem distributions.`,
        `Clean, modern portfolio presentation that immediately communicates technical ambition and hands-on capability.`
      ],
      missingAreas: [
        "Include live interactive demo links or Colab notebooks for machine learning projects.",
        "Highlight specific benchmarks or model accuracy metrics in project case studies.",
        "Add hackathon rankings or university open-source contributions."
      ],
      recommendations: [
        "Ensure your latest GitHub repositories are synced using the 'Sync GitHub' button.",
        "Mention your availability window (e.g. Summer / Fall 2025/2026) directly in application cover letters.",
        "Include system architecture tradeoffs you learned while building deep learning models.",
        "Use the AI Bio Polisher to generate an elevator pitch tailored for tech recruiters."
      ]
    };
  }

  /**
   * Student Bio Tone Polisher
   */
  static async polishBio(currentBio, tone = "executive") {
    const apiKey = this.getApiKey();

    if (apiKey) {
      try {
        const prompt = `Rewrite the following student developer portfolio bio in a ${tone.toUpperCase()} tone (approx 45-70 words). Highlight technical ambition, machine learning, software engineering, and learning agility:
"${currentBio}"`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text.trim();
        }
      } catch (err) {
        console.warn("Gemini API call failed, using heuristic bio generator:", err);
      }
    }

    const tones = {
      executive: "Computer Science undergraduate with a passion for artificial intelligence, machine learning, and modern software architectures. Proven ability to build real-world models and full-stack solutions, active in data structures and algorithms, and seeking impactful software engineering internships.",
      technical: "CS student specializing in Python, PyTorch, Deep Learning, and C++ Data Structures. Active problem solver on LeetCode and Codolio with hands-on experience training fine-tuned LLMs, transformers, and audio comparison models.",
      creative: "Student developer and creative technologist exploring the boundary between intelligent generative AI, deep neural networks, and fluid web experiences. Driven by curiosity and building projects that solve real problems.",
      pitch: "I am a driven Computer Science and AI student ready to bring high energy, algorithmic rigor, and machine learning skills to your engineering team. Seeking Summer/Fall software engineering internships."
    };

    return tones[tone] || tones.executive;
  }

  /**
   * Student Project Idea Generator
   */
  static async generateProjectIdeas() {
    return [
      {
        title: "MULTIMODAL RAG SEARCH AGENT",
        category: "ai",
        tagline: "Autonomous document and audio retrieval-augmented generation engine",
        techStack: ["Python", "PyTorch", "Transformers", "FastAPI", "React 19"],
        architecture: "Dense vector embeddings for text and audio with hybrid BM25 re-ranking and sub-100ms LLM streaming inference.",
        impactGoal: "Demonstrates practical mastery of advanced vector search, embedding models, and asynchronous Python backends.",
        estimatedTime: "3-4 Days"
      },
      {
        title: "ALGO-PLAYGROUND 3D",
        category: "motion",
        tagline: "Interactive 3D sorting and graph algorithm step-by-step visualizer",
        techStack: ["React 19", "Three.js", "TypeScript", "Tailwind CSS"],
        architecture: "Step-by-step algorithmic state machine in TypeScript with smooth 3D camera transitions and time-complexity explanations.",
        impactGoal: "Demonstrates deep mastery of CS algorithms and interactive 3D web graphics.",
        estimatedTime: "2-3 Days"
      },
      {
        title: "DEV-SYNC REALTIME WORKSPACE",
        category: "fullstack",
        tagline: "Collaborative code and markdown workspace with instant AI diagram generation",
        techStack: ["Next.js 15", "WebSockets", "Python FastAPI", "PostgreSQL"],
        architecture: "Real-time WebSocket synchronization with automated AI architecture diagram generation from plain text notes.",
        impactGoal: "Proves real-time full-stack distributed system capabilities.",
        estimatedTime: "3-4 Days"
      }
    ];
  }

  /**
   * Recruiter Q&A Chatbot for Student
   */
  static async answerRecruiterQuestion(question, portfolioData, chatHistory = []) {
    const apiKey = this.getApiKey();

    if (apiKey) {
      try {
        const prompt = `You are the AI Representative for ${portfolioData.personal.name} (${portfolioData.personal.title}), an ambitious Computer Science student seeking software engineering internships.
Answer the recruiter's question accurately based on the candidate's portfolio. Be humble, articulate, enthusiastic, and highlight specific projects and technical skills.

Candidate Profile:
${JSON.stringify({
  personal: portfolioData.personal,
  skills: portfolioData.skills,
  projects: portfolioData.projects,
  education: portfolioData.education
}, null, 2)}

Question: ${question}

Response (keep to 2-3 crisp sentences):`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text.trim();
        }
      } catch (err) {
        console.warn("Gemini API call failed, using recruiter fallback:", err);
      }
    }

    const q = question.toLowerCase();
    const name = portfolioData.personal.name || "Adarsh Singh";

    if (q.includes("intern") || q.includes("hire") || q.includes("available") || q.includes("role")) {
      return `${name} is a Computer Science undergraduate at KIET Group of Institutions, actively seeking Software Engineering (SDE) and AI/ML internships for Summer and Fall 2025/2026. Feel free to connect directly via email (${portfolioData.personal.email || 'adarshsingh98635@gmail.com'}) or LinkedIn!`;
    }
    if (q.includes("python") || q.includes("ai") || q.includes("ml") || q.includes("pytorch") || q.includes("llm")) {
      return `${name} has hands-on experience building machine learning models in Python and PyTorch—including projects in Fine-Tuned CodeLlama, Transformers, Audio Dynamic Time Warping, and AI Detectors hosted on GitHub.`;
    }
    if (q.includes("dsa") || q.includes("leetcode") || q.includes("algorithm") || q.includes("codolio")) {
      return `${name} has solved over 100+ algorithmic problems across LeetCode (@Adarsh_Singh_001) and Codolio (@01AdarshSingh), maintaining a consistent streak and strong proficiency in Data Structures and Algorithms in C++ and Python.`;
    }
    if (q.includes("web") || q.includes("react") || q.includes("fullstack")) {
      return `${name} builds modern responsive applications with React 19, JavaScript/TypeScript, and Python backends (FastAPI/Flask), focusing on clean design, modular components, and low latency.`;
    }

    return `${name} is a dedicated Computer Science & AI student with a strong blend of data structures & algorithms, machine learning (PyTorch, Transformers), and web development. ${name} is eager to learn rapidly and ship high-impact code as a software engineering intern!`;
  }
}
