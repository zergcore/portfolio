export interface CaseStudySection {
  heading: string;
  body: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  images?: { url: string; public_id: string; is_primary: boolean }[];
  tags: string[];
  githubUrl?: string;
  liveUrl?: string;
  caseStudyUrl?: string;
  // Case study fields (populated for featured projects)
  role?: string;
  timeline?: string;
  problem?: string;
  approach?: CaseStudySection[];
  outcomes?: string[];
  gallery?: string[];
  is_featured?: boolean;
  sort_order?: number;
}

export const mockProjects: Project[] = [
  {
    id: "arkano",
    slug: "arkano",
    title: "Arkano Localization Platform",
    description:
      "A comprehensive localization and user onboarding system. Automatically detects user locales via edge network IPs and provides personalized, multi-lingual dashboards.",
    imageUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
    tags: ["Next.js", "TypeScript", "Vercel Edge", "Tailwind CSS"],
    githubUrl: "https://github.com/zergcore/arkano",
    liveUrl: "https://arkano.zergcore.dev",
    caseStudyUrl: "/projects/arkano",
    role: "Lead Full-Stack Engineer",
    timeline: "3 months",
    problem:
      "The platform served users across 12+ countries but was only available in English. New user drop-off at onboarding was 47% because users couldn't understand the interface in their native language. The existing codebase had no i18n infrastructure whatsoever.",
    approach: [
      {
        heading: "Edge-based locale detection",
        body: "Instead of relying on browser Accept-Language headers (easily spoofed), I implemented locale detection at the Vercel Edge Network layer using incoming request geo headers. This gave us sub-millisecond detection with zero client-side JavaScript cost.",
      },
      {
        heading: "next-intl integration",
        body: "Chose next-intl over react-i18next because of its first-class Next.js App Router support and Server Component compatibility. All static strings live in JSON message files, keeping the translation workflow simple for non-technical contributors.",
      },
      {
        heading: "Locale-persisted user profiles",
        body: "Upon registration, the detected locale is written to the user's profile via a Server Action, so returning users always see their preferred language even when logging in from a different country.",
      },
    ],
    outcomes: [
      "Onboarding drop-off reduced from 47% to 19% within the first month of launch.",
      "Platform now supports 6 languages, with infrastructure ready for unlimited expansion.",
      "Zero performance regression — locale detection adds <1ms to TTFB at the edge.",
      "Non-technical team members can add new translation strings via JSON files without developer involvement.",
    ],
    gallery: [
      "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
      "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
    ],
  },
  {
    id: "finapp",
    slug: "finapp",
    title: "FinApp Core",
    description:
      "A financial dashboard for real-time currency math and expense calculations, heavily optimized to mitigate floating-point precision errors in JavaScript.",
    imageUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
    tags: ["React", "Node.js", "Financial Math", "Chart.js"],
    liveUrl: "https://finapp.zergcore.dev",
    caseStudyUrl: "/projects/finapp",
    role: "Full-Stack Engineer",
    timeline: "2 months",
    problem:
      "The client's existing spreadsheet-based expense system was producing calculation errors in multi-currency reports due to floating-point arithmetic. A $0.01 rounding error compounded across thousands of transactions resulted in monthly discrepancies of $200–$800.",
    approach: [
      {
        heading: "Integer arithmetic engine",
        body: "All monetary values are stored and processed as integers in the smallest currency unit (cents, pence, etc.). The custom arithmetic engine converts to decimal only at the final display layer, completely eliminating floating-point accumulation errors.",
      },
      {
        heading: "Real-time currency conversion",
        body: "Integrated with the ECB exchange rate API, caching rates with a 1-hour TTL on the server. This gave real-time accuracy without hitting rate limits or adding latency to every calculation.",
      },
    ],
    outcomes: [
      "Monthly financial discrepancies dropped to exactly $0.00 across all reports.",
      "Replaced 14 spreadsheets with a single unified dashboard.",
      "Finance team time spent on reconciliation reduced by ~6 hours per month.",
    ],
    gallery: [
      "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
    ],
  },
  {
    id: "wowland",
    slug: "wowland",
    title: "WoWLand (World of Women)",
    description:
      "Developed and scaled key interactive features for the WoWLand metaverse platform, handling thousands of concurrent users.",
    imageUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
    tags: ["Web3", "React", "Three.js", "Node.js"],
    caseStudyUrl: "/projects/wowland",
    role: "Frontend & Web3 Engineer",
    timeline: "18 months",
    problem:
      "WoWLand needed to give NFT holders a persistent, interactive virtual world — a significant technical challenge given that most Web3 frontends at the time were simple static sites with wallet connection. The platform needed to handle WebSocket connections for hundreds of concurrent users in the same space.",
    approach: [
      {
        heading: "Three.js scene management",
        body: "Architected a scene graph system that lazily loads 3D assets only when they enter the camera frustum. This kept the initial load under 2MB even as the world expanded.",
      },
      {
        heading: "Smart contract integration",
        body: "Built an abstraction layer over Ethers.js that normalized differences between MetaMask, WalletConnect, and Coinbase Wallet. This let users connect with any wallet without any UI changes.",
      },
    ],
    outcomes: [
      "Platform handled 1,200+ concurrent users during NFT mint events without degradation.",
      "Wallet abstraction layer adopted by 3 other projects in the organization.",
      "Average session duration of 18 minutes — unusually high for a Web3 product.",
    ],
    gallery: [
      "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
    ],
  },
  {
    id: "portfolio",
    slug: "portfolio",
    title: "Zergcore.dev V2",
    description:
      "My personal portfolio architecture designed to convert. Built with Next.js App Router, Framer Motion, and a headless FastAPI + Neon DB backend.",
    imageUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
    tags: ["Next.js 15", "FastAPI", "Neon DB", "Framer Motion"],
    githubUrl: "https://github.com/zergcore/zergcore-dev",
    liveUrl: "https://zergcore.dev",
    caseStudyUrl: "/projects/portfolio",
    role: "Architect & Engineer",
    timeline: "Ongoing",
    problem:
      "My previous portfolio was a single-page hero with a typing animation and social icons — it had zero content for a hiring manager to evaluate. It had no projects, no experience timeline, no resume download, and no contact form. The site existed but converted nobody.",
    approach: [
      {
        heading: "Recruiter-first information architecture",
        body: "Designed the page flow to answer a recruiter's mental checklist in order: Who is this person? → What have they built? → What are they good at? → Where have they worked? → How do I reach them? Every section and CTA was placed to answer the next question before the visitor thinks to ask it.",
      },
      {
        heading: "Performance-first stack",
        body: "Next.js 15 App Router with static generation for all public pages. Framer Motion with scroll-triggered animations that respect prefers-reduced-motion. First Load JS under 170KB shared.",
      },
    ],
    outcomes: [
      "Built from scratch in under 2 weeks of part-time development.",
      "Lighthouse score ≥ 95 across Performance, Accessibility, Best Practices, and SEO (target).",
      "All content managed through a FastAPI + Neon DB admin dashboard — no code deploys needed to update projects or experience.",
    ],
  },
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
  content?: string;
  isPublished?: boolean;
  imageUrl?: string | null;
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
