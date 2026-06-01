import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

const TAG_MAP: Record<string, string[]> = {
  projects:    ['projects', 'work', 'homepage-work-preview'],
  experience:  ['experience', 'homepage-about'],
  skills:      ['skills'],
  credentials: ['credentials'],
  essays:      ['essays', 'homepage-writing-preview'],
};

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidate-secret');

  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  let body: { tags?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  if (!Array.isArray(body.tags) || !body.tags.every((t) => typeof t === 'string')) {
    return NextResponse.json(
      { message: 'Body must contain a `tags` string array' },
      { status: 400 },
    );
  }

  const revalidated: string[] = [];
  for (const tag of body.tags as string[]) {
    for (const mapped of TAG_MAP[tag] ?? []) {
      revalidateTag(mapped);
      revalidated.push(mapped);
    }
  }

  return NextResponse.json({ revalidated: true, tags: revalidated });
}
