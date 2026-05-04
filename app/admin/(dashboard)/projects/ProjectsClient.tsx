"use client";

import { useState } from "react";
import { Project } from "@/lib/mockData";
import { FiPlus, FiEdit2, FiTrash2, FiExternalLink } from "react-icons/fi";
import Button from "@/components/ui/Button";
import { deleteProjectAction } from "@/app/actions/projects";
import ProjectFormModal from "./ProjectFormModal";

export default function ProjectsClient({
  initialProjects,
}: {
  initialProjects: Project[];
}) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    const res = await deleteProjectAction(id);
    if (res.success) {
      setProjects(projects.filter((p) => p.id !== id));
    } else {
      alert(res.error || "Failed to delete project");
    }
  };

  const openEdit = (p: Project) => {
    setEditingProject(p);
    setIsModalOpen(true);
  };

  const openNew = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openNew} className="gap-2">
          <FiPlus /> New Project
        </Button>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
              <th className="p-4 text-sm font-medium text-[var(--text-secondary)]">
                Title
              </th>
              <th className="p-4 text-sm font-medium text-[var(--text-secondary)]">
                Slug
              </th>
              <th className="p-4 text-sm font-medium text-[var(--text-secondary)]">
                Tags
              </th>
              <th className="p-4 text-sm font-medium text-[var(--text-secondary)] text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {projects.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="p-8 text-center text-[var(--text-muted)]"
                >
                  No projects found. Create one!
                </td>
              </tr>
            ) : (
              projects.map((p, idx) => (
                <tr
                  key={`project-${p.id || idx}-${idx}`}
                  className="hover:bg-[var(--bg-elevated)]/50 transition-colors"
                >
                  <td className="p-4 font-medium text-[var(--text-primary)]">
                    {p.title}
                  </td>
                  <td className="p-4 text-sm text-[var(--text-secondary)] font-mono">
                    {p.slug}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {p.tags?.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 text-xs rounded-md bg-[var(--bg-base)] border border-[var(--border-default)] text-[var(--text-secondary)]"
                        >
                          {t}
                        </span>
                      ))}
                      {(p.tags?.length || 0) > 3 && (
                        <span className="text-xs text-[var(--text-muted)]">
                          +{p.tags!.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <a
                        href={`/projects/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-cyan-400 hover:bg-cyan-400/10 transition-colors"
                      >
                        <FiExternalLink />
                      </a>
                      <button
                        onClick={() => openEdit(p)}
                        className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent-violet)] hover:bg-[var(--accent-violet)]/10 transition-colors"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <ProjectFormModal
          project={editingProject}
          onClose={() => setIsModalOpen(false)}
          onSuccess={(savedProject) => {
            setIsModalOpen(false);
            if (editingProject) {
              setProjects(
                projects.map((p) =>
                  p.id === savedProject.id ? savedProject : p,
                ),
              );
            } else {
              setProjects([savedProject, ...projects]);
            }
          }}
        />
      )}
    </div>
  );
}
