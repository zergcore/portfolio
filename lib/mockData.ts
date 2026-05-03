export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  githubUrl?: string;
  liveUrl?: string;
  caseStudyUrl?: string;
}

export const mockProjects: Project[] = [
  {
    id: "arkano",
    title: "Arkano Localization Platform",
    description: "A comprehensive localization and user onboarding system. Automatically detects user locales via edge network IPs and provides personalized, multi-lingual dashboards.",
    imageUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg", // Replace with real Arkano screenshot
    tags: ["Next.js", "TypeScript", "Vercel Edge", "Tailwind CSS"],
    githubUrl: "https://github.com/zergcore/arkano",
    caseStudyUrl: "/projects/arkano",
  },
  {
    id: "finapp",
    title: "FinApp Core",
    description: "A financial dashboard for real-time currency math and expense calculations, heavily optimized to mitigate floating-point precision errors in JavaScript.",
    imageUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg", // Replace with real FinApp screenshot
    tags: ["React", "Node.js", "Financial Math", "Chart.js"],
    liveUrl: "https://finapp.zergcore.dev",
    caseStudyUrl: "/projects/finapp",
  },
  {
    id: "wowland",
    title: "WoWLand (World of Women)",
    description: "Developed and scaled key interactive features for the WoWLand metaverse platform, handling thousands of concurrent users.",
    imageUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg", // Replace with real WoW screenshot
    tags: ["Web3", "React", "Three.js", "Node.js"],
    caseStudyUrl: "/projects/wowland",
  },
  {
    id: "portfolio",
    title: "Zergcore.dev V2",
    description: "My personal portfolio architecture designed to convert. Built with Next.js App Router, Framer Motion, and a headless FastAPI + Neon DB backend.",
    imageUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg", // Replace with real Portfolio screenshot
    tags: ["Next.js 15", "FastAPI", "Neon DB", "Framer Motion"],
    githubUrl: "https://github.com/zergcore/zergcore-dev",
    liveUrl: "https://zergcore.dev",
  }
];

export interface SkillItem {
  name: string;
  years: number;
  tags?: string[];
}

export interface SkillCategory {
  title: string;
  skills: SkillItem[];
}

export const mockSkills: SkillCategory[] = [
  {
    title: "Frontend & UI",
    skills: [
      { name: "React", years: 6, tags: ["Hooks", "Context", "Performance"] },
      { name: "Next.js", years: 4, tags: ["App Router", "SSR", "SSG"] },
      { name: "TypeScript", years: 5, tags: ["Generics", "Type Inference"] },
      { name: "Tailwind CSS", years: 4, tags: ["Design Systems", "v4"] },
    ]
  },
  {
    title: "Backend & API",
    skills: [
      { name: "Node.js", years: 6, tags: ["Express", "NestJS", "REST"] },
      { name: "Python", years: 3, tags: ["FastAPI", "Flask", "Data"] },
      { name: "PostgreSQL", years: 4, tags: ["Neon DB", "Prisma", "SQL"] },
      { name: "GraphQL", years: 3, tags: ["Apollo", "Schema Design"] },
    ]
  },
  {
    title: "Cloud & DevOps",
    skills: [
      { name: "AWS", years: 3, tags: ["S3", "EC2", "Lambda"] },
      { name: "Vercel", years: 4, tags: ["Edge Functions", "Deployments"] },
      { name: "Docker", years: 3, tags: ["Containers", "Compose"] },
      { name: "CI/CD", years: 4, tags: ["GitHub Actions"] },
    ]
  },
  {
    title: "Tools & Other",
    skills: [
      { name: "Git", years: 6, tags: ["GitKraken", "Workflows"] },
      { name: "Framer Motion", years: 2, tags: ["Animations"] },
      { name: "Testing", years: 3, tags: ["Jest", "Vitest", "Cypress"] },
      { name: "Web3", years: 2, tags: ["Ethers.js", "Smart Contracts"] },
    ]
  }
];

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  dateRange: string;
  description: string[];
  techStack: string[];
}

export const mockExperience: ExperienceItem[] = [
  {
    id: "exp-1",
    role: "Senior Full-Stack Engineer",
    company: "Freelance / Independent Consultant",
    dateRange: "2021 - Present",
    description: [
      "Providing senior-level full-stack engineering services across Twine, Torre.ai, and independent contracts.",
      "Architecting scalable web applications and secure backend services using modern JavaScript and Python ecosystems.",
      "Leading technical decisions for robust authentication flows (Auth0/JWT) and cloud deployments."
    ],
    techStack: ["TypeScript", "React", "Node.js", "Python", "FastAPI"]
  },
  {
    id: "exp-2",
    role: "Full-Stack Software Engineer",
    company: "World of Women",
    dateRange: "2021 - 2023",
    description: [
      "Contributed to engineering initiatives for digital economy and Web3 projects.",
      "Designed and implemented backend systems supporting high-traffic interactions.",
      "Collaborated on frontend architecture utilizing React and advanced state management."
    ],
    techStack: ["JavaScript", "React", "Node.js", "Web3"]
  },
  {
    id: "exp-3",
    role: "Software Developer",
    company: "Tech Industry (Venezuela)",
    dateRange: "2018 - 2021",
    description: [
      "Built and maintained full-stack web applications to solve complex business logic.",
      "Optimized legacy codebases to improve rendering speed and API response times.",
      "Graduated with a degree in Computer Engineering (Ingeniero en Informática)."
    ],
    techStack: ["JavaScript", "React", "SQL", "Git"]
  }
];

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  dateRange: string;
  description: string;
  imageUrl?: string;
  relatedProjectIds?: string[];
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
  imageUrl?: string;
  relatedProjectIds?: string[];
}

export const mockEducation: EducationItem[] = [
  {
    id: "edu-1",
    degree: "Computer Engineering (Ingeniero en Informática)",
    institution: "University in Venezuela",
    dateRange: "Graduated",
    description: "Core focus on software architecture, algorithms, database systems, and full-stack web development.",
    relatedProjectIds: ["portfolio"]
  }
];

export const mockCertifications: CertificationItem[] = [
  {
    id: "cert-1",
    name: "Advanced Full-Stack Web Development",
    issuer: "Platzi",
    date: "2023",
    url: "https://platzi.com",
    relatedProjectIds: ["arkano", "portfolio"]
  },
  {
    id: "cert-2",
    name: "Authentication & Authorization (Auth0/JWT)",
    issuer: "Platzi",
    date: "2022",
    url: "https://platzi.com",
    relatedProjectIds: ["arkano"]
  },
  {
    id: "cert-3",
    name: "React & Next.js Professional",
    issuer: "Platzi",
    date: "2022",
    url: "https://platzi.com",
    relatedProjectIds: ["arkano", "finapp", "portfolio"]
  }
];

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  tags: string[];
  readingTime: string;
  date: string;
  slug: string;
}

export const mockBlogPosts: BlogPost[] = [
  {
    id: "post-1",
    title: "Building a Portfolio That Converts: An Engineer's Guide",
    excerpt: "How I architected zergcore.dev for recruiter-first UX — from scroll-triggered animations to conversion-focused CTAs.",
    tags: ["Next.js", "Career", "UX"],
    readingTime: "6 min read",
    date: "2025-10-15",
    slug: "portfolio-that-converts"
  },
  {
    id: "post-2",
    title: "Avoiding Floating-Point Pitfalls in Financial Applications",
    excerpt: "A deep dive into the currency math engine behind FinApp — why 0.1 + 0.2 !== 0.3 and how to fix it for production.",
    tags: ["JavaScript", "Math", "Finance"],
    readingTime: "8 min read",
    date: "2025-09-02",
    slug: "floating-point-pitfalls"
  },
  {
    id: "post-3",
    title: "From Django to FastAPI: A Migration Story",
    excerpt: "Lessons learned migrating a Django/DRF backend to FastAPI — performance gains, pitfalls, and deployment on free tiers.",
    tags: ["Python", "FastAPI", "Backend"],
    readingTime: "7 min read",
    date: "2025-08-18",
    slug: "django-to-fastapi"
  }
];
