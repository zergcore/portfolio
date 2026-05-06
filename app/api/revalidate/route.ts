import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-revalidation-secret");

  if (
    !process.env.REVALIDATION_SECRET ||
    secret !== process.env.REVALIDATION_SECRET
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body: { path?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const { path } = body;

  if (!path || typeof path !== "string" || !path.startsWith("/")) {
    return NextResponse.json(
      { message: "Body must contain a valid `path` string starting with '/'" },
      { status: 400 }
    );
  }

  revalidatePath(path);
  return NextResponse.json({ revalidated: true, path });
}
