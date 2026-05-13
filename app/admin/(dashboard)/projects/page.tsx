import { getProjects } from "@/lib/api";
import ProjectsClient from "./ProjectsClient";

export const revalidate = 0; // Don't cache admin page

export default async function AdminProjectsPage() {
  const projects = await getProjects({});

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          Manage Projects
        </h1>
        <p className="text-[var(--text-secondary)] mt-2">
          Create, update, and reorder your portfolio projects.
        </p>
      </div>

      <ProjectsClient initialProjects={projects} />
    </div>
  );
}
