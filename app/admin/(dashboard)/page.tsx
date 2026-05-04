import GradientText from "@/components/typography/GradientText";
import { FiLayout, FiBriefcase, FiEdit3 } from "react-icons/fi";
import Link from "next/link";

const quickLinks = [
  { href: "/admin/projects", label: "Manage Projects", icon: FiLayout, color: "text-cyan-400", bg: "bg-cyan-400/10" },
  { href: "/admin/experience", label: "Update Experience", icon: FiBriefcase, color: "text-violet-400", bg: "bg-violet-400/10" },
  { href: "/admin/blog", label: "Draft a Blog Post", icon: FiEdit3, color: "text-pink-400", bg: "bg-pink-400/10" },
];

export default function AdminDashboardPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          Welcome back, <GradientText>Zaidibeth</GradientText>
        </h1>
        <p className="text-[var(--text-secondary)]">
          Here is an overview of your portfolio content.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] hover:border-[var(--accent-violet)] transition-all group"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${link.bg} ${link.color}`}>
              <link.icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-violet)] transition-colors">
              {link.label}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Add, edit, or remove entries.
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
