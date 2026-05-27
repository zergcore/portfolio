import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import {
  EssayFrontmatterSchema,
  type EssayFrontmatter,
  type ContentEntry,
} from './schemas';

const DATA_DIR = path.join(process.cwd(), 'app/v2/_data/essays');

function parseFile(filePath: string): ContentEntry<EssayFrontmatter> {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);
  const slug = path.basename(filePath, '.mdx');

  const result = EssayFrontmatterSchema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `Invalid frontmatter in ${path.relative(process.cwd(), filePath)}:\n${result.error.toString()}`
    );
  }

  return { frontmatter: result.data, content: content.trim(), slug };
}

export function getAllEssays(): ContentEntry<EssayFrontmatter>[] {
  if (!fs.existsSync(DATA_DIR)) return [];
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.mdx'));
  return files
    .map((f) => parseFile(path.join(DATA_DIR, f)))
    .sort(
      (a, b) =>
        new Date(b.frontmatter.publishedAt).getTime() -
        new Date(a.frontmatter.publishedAt).getTime()
    );
}

export function getEssay(slug: string): ContentEntry<EssayFrontmatter> | undefined {
  const filePath = path.join(DATA_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return undefined;
  return parseFile(filePath);
}
