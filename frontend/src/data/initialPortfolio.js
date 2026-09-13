export const initialPortfolioData = {
  personal: {
    name: "Adarsh Singh",
    title: "Computer Science & AI Student Developer",
    tagline: "PORTFOLIO",
    headline: "TURNING IDEAS INTO REAL-WORLD CODE & INTELLIGENT SYSTEMS",
    quote: "Driven by curiosity, powered by code. Building modern software at the intersection of AI, distributed systems, and clean web design.",
    bio: "Computer Science undergraduate at KIET Group of Institutions with a focus on artificial intelligence, machine learning, and modern full-stack development. Active problem solver on LeetCode and Codolio, building real-world AI projects and seeking impactful software engineering internships.",
    location: "India / Open to Global Remote & Relocation",
    email: "adarshsingh98635@gmail.com",
    phone: "",
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
    github: "https://github.com/AdarshSingh001",
    codolio: "https://codolio.com/profile/01AdarshSingh",
    leetcode: "https://leetcode.com/u/Adarsh_Singh_001/",
    codeforces: "",
    codechef: "",
    gfg: "",
    hackerrank: "",
    linkedin: "https://www.linkedin.com/in/adarsh-singh-6216981b3/",
    twitter: "",
    email: "mailto:adarshsingh98635@gmail.com"
  },
  // Zero fake demo projects - populated from real user input or connected GitHub repos
  projects: [],
  categories: [
    { id: "all", label: "All Projects" },
    { id: "ai", label: "AI & ML" },
    { id: "fullstack", label: "Fullstack Web" },
    { id: "motion", label: "Interactive & 3D" },
    { id: "tools", label: "Developer Tools" }
  ],
  skills: [
    {
      category: "AI, Machine Learning & Data",
      description: "Neural networks, LLM fine-tuning, transformers, and data processing.",
      skills: [
        { name: "Python", level: 92, highlight: true },
        { name: "PyTorch", level: 88, highlight: true },
        { name: "Transformers / NLP", level: 86, highlight: true },
        { name: "Scikit-Learn", level: 88, highlight: true },
        { name: "Pandas & NumPy", level: 90, highlight: false }
      ]
    },
    {
      category: "Programming & Core CS",
      description: "Data structures, algorithms, and systems programming.",
      skills: [
        { name: "C++", level: 90, highlight: true },
        { name: "Data Structures & Algorithms", level: 90, highlight: true },
        { name: "SQL & Databases", level: 84, highlight: false },
        { name: "Object-Oriented Design", level: 88, highlight: false }
      ]
    },
    {
      category: "Web & Developer Tools",
      description: "Web application development and version control.",
      skills: [
        { name: "React & Next.js", level: 88, highlight: true },
        { name: "JavaScript & TypeScript", level: 86, highlight: true },
        { name: "Git & GitHub", level: 92, highlight: true },
        { name: "Jupyter Notebooks", level: 94, highlight: false },
        { name: "Linux / Bash", level: 82, highlight: false }
      ]
    }
  ],
  education: [
    {
      degree: "B.Tech in Computer Science and Engineering",
      institution: "KIET Group of Institutions, Ghaziabad",
      year: "2024 - 2028",
      honors: "CGPA: 8.7 / 10 | Core Coursework: Data Structures & Algorithms, Operating Systems, DBMS, Machine Learning"
    },
    {
      degree: "Senior Secondary, PCM (Class XII)",
      institution: "Lucknow Public College (ISC)",
      year: "2023",
      honors: "Score: 95% | Physics, Chemistry, Mathematics & Computer Science"
    },
    {
      degree: "High School (Class X)",
      institution: "Lucknow Public College (ICSE)",
      year: "2021",
      honors: "Score: 91% | Secondary Education & Computer Applications"
    }
  ],
  certifications: [
    {
      id: "cert-1",
      name: "Data Structures & Algorithms Problem Solving",
      issuer: "LeetCode & Competitive Programming",
      date: "2024",
      skills: ["C++", "Java", "Algorithms", "DSA"],
      credentialUrl: "https://leetcode.com/u/Adarsh_Singh_001/"
    },
    {
      id: "cert-2",
      name: "Deep Learning & Neural Network Architectures",
      issuer: "DeepLearning.AI / Coursera",
      date: "2024",
      skills: ["PyTorch", "Python", "Transformers", "NLP"],
      credentialUrl: "https://github.com/AdarshSingh001"
    },
    {
      id: "cert-3",
      name: "Machine Learning with Python & Scikit-Learn",
      issuer: "Cognitive Class / IBM",
      date: "2023",
      skills: ["Python", "Scikit-Learn", "Data Science", "NumPy"],
      credentialUrl: "https://github.com/AdarshSingh001"
    }
  ],
  testimonials: []
};
