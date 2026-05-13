"use client";

import { useState, useRef, useEffect } from "react";
import { ApiSkill } from "@/lib/api";
import { FiX } from "react-icons/fi";

interface Props {
  allSkills: ApiSkill[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function SkillMultiSelect({ allSkills, selectedIds, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedSkills = allSkills.filter(s => selectedIds.includes(s.id));
  const candidates = allSkills.filter(
    s => !selectedIds.includes(s.id) && s.name.toLowerCase().includes(query.toLowerCase())
  );

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(x => x !== id));
    } else {
      onChange([...selectedIds, id]);
      setQuery("");
    }
  }

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="space-y-2" ref={containerRef}>
      <label className="text-sm font-medium text-[var(--text-secondary)]">Skills</label>

      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedSkills.map(s => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-[var(--accent-violet)]/15 text-[var(--accent-violet)] border border-[var(--accent-violet)]/30"
            >
              {s.name}
              <button
                type="button"
                onClick={() => toggle(s.id)}
                className="hover:text-[var(--color-error)] transition-colors"
                aria-label={`Remove ${s.name}`}
              >
                <FiX size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          type="text"
          placeholder="Type to search skills…"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none text-sm"
        />

        {open && candidates.length > 0 && (
          <ul className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xl">
            {candidates.map(s => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => toggle(s.id)}
                  className="w-full text-left px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                >
                  {s.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
