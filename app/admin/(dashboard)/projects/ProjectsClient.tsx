"use client";

import { useState } from "react";
import { Project } from "@/lib/mockData";
import { ApiSkill } from "@/lib/api";
import { FiPlus, FiEdit2, FiTrash2, FiExternalLink } from "react-icons/fi";
import Button from "@/components/ui/Button";
import { deleteProjectAction } from "@/app/actions/projects";
import ProjectFormModal from "./ProjectFormModal";

import { useTranslations } from "next-intl";

export default function ProjectsClient({
  initialProjects,
  allSkills,
}: {
  initialProjects: Project[];
  allSkills: ApiSkill[];
}) {
  const t = useTranslations("adminProjects");
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm(t("deleteConfirm"))) return;
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
          <FiPlus /> {t("newProject")}
        </Button>
      </div>

      <div className="bg-(--bg-surface) border border-(--border-subtle) rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-(--border-subtle) bg-(--bg-elevated)">
              <th className="p-4 text-sm font-medium text-(--text-secondary)">
                {t("table.title")}
              </th>
              <th className="p-4 text-sm font-medium text-(--text-secondary)">
                {t("table.slug")}
              </th>
              <th className="p-4 text-sm font-medium text-(--text-secondary)">
                {t("table.tags")}
              </th>
              <th className="p-4 text-sm font-medium text-(--text-secondary) text-right">
                {t("table.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--border-subtle)">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-(--text-muted)">
                  {t("table.empty")}
                </td>
              </tr>
            ) : (
              projects.map((p, idx) => (
                <tr
                  key={`project-${p.id || idx}-${idx}`}
                  className="hover:bg-(--bg-elevated)/50 transition-colors"
                >
                  <td className="p-4 font-medium text-(--text-primary)">
                    {p.title}
                  </td>
                  <td className="p-4 text-sm text-(--text-secondary) font-mono">
                    {p.slug}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {p.tags?.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 text-xs rounded-md bg-(--bg-base) border border-(--border-default) text-(--text-secondary)"
                        >
                          {t}
                        </span>
                      ))}
                      {(p.tags?.length || 0) > 3 && (
                        <span className="text-xs text-(--text-muted)">
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
                        className="p-2 rounded-lg text-(--text-secondary) hover:text-cyan-400 hover:bg-cyan-400/10 transition-colors"
                      >
                        <FiExternalLink />
                      </a>
                      <button
                        onClick={() => openEdit(p)}
                        className="p-2 rounded-lg text-(--text-secondary) hover:text-(--accent-violet) hover:bg-(--accent-violet)/10 transition-colors"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 rounded-lg text-(--text-secondary) hover:text-(--color-error) hover:bg-(--color-error)/10 transition-colors"
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
          allSkills={allSkills}
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
