"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { SkillItem } from "@/lib/mockData";

interface SkillCategoryCardProps {
  title: string;
  skills: SkillItem[];
  yearsLabel?: string;
  defaultVisible?: number;
}

export default function SkillCategoryCard({
  title,
  skills,
  yearsLabel = "yrs",
  defaultVisible = 4,
}: SkillCategoryCardProps) {
  const [expanded, setExpanded] = useState(false);

  const hidden = skills.length - defaultVisible;
  const visible = expanded ? skills : skills.slice(0, defaultVisible);

  return (
    <div className="flex flex-col h-full bg-[var(--bg-surface)] rounded-xl p-6 border border-[var(--border-subtle)] shadow-sm hover:border-[var(--accent-cyan)]/30 transition-colors duration-300">
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6 pb-4 border-b border-[var(--border-subtle)]">
        {title}
      </h3>

      <div className="flex flex-col gap-4 flex-1">
        {visible.map((skill) => (
          <div key={skill.name} className="flex flex-col gap-1">
            <div className="flex justify-between items-baseline">
              <span className="font-medium text-[var(--text-primary)]">
                {skill.name}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                {skill.years} {yearsLabel}
              </span>
            </div>

            {skill.tags && skill.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {skill.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-secondary)] bg-[var(--bg-base)] px-2 py-0.5 rounded-sm border border-[var(--border-default)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {hidden > 0 && (
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors self-start"
        >
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
          {expanded ? "Show less" : `${hidden} more skill${hidden > 1 ? "s" : ""}`}
        </button>
      )}
    </div>
  );
}
