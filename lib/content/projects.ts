import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import {
  ProjectFrontmatterSchema,
  type ProjectFrontmatter,
  type ContentEntry,
} from './schemas';

const DATA_DIR = path.join(process.cwd(), 'app/v2/_data/projects');

function parseFile(filePath: string): ContentEntry<ProjectFrontmatter> {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);
  const slug = path.basename(filePath, '.mdx');

  const result = ProjectFrontmatterSchema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `Invalid frontmatter in ${path.relative(process.cwd(), filePath)}:\n${result.error.toString()}`
    );
  }

  return { frontmatter: result.data, content: content.trim(), slug };
}

export function getAllProjects(): ContentEntry<ProjectFrontmatter>[] {
  if (!fs.existsSync(DATA_DIR)) return [];
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.mdx'));
  return files
    .map((f) => parseFile(path.join(DATA_DIR, f)))
    .sort((a, b) => a.frontmatter.order - b.frontmatter.order);
}

export function getProject(slug: string): ContentEntry<ProjectFrontmatter> | undefined {
  const filePath = path.join(DATA_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return undefined;
  return parseFile(filePath);
}
