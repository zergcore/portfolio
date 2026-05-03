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
