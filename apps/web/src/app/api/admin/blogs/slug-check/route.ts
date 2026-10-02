import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import { Blog } from "@/lib/models/Blog";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const slug = req.nextUrl.searchParams.get("slug");
  const excludeId = req.nextUrl.searchParams.get("excludeId");

  if (!slug || slug.length < 3) {
    return NextResponse.json({ available: false, reason: "Slug too short" });
  }

  await dbConnect();
  const query: Record<string, unknown> = { slug };
  if (excludeId) query._id = { $ne: excludeId };

  const existing = await Blog.findOne(query).select("_id status slug").lean();

  if (!existing) {
    return NextResponse.json({ available: true });
  }

  return NextResponse.json({
    available: false,
    reason: `Slug already used by a ${(existing as any).status} article`,
    conflictId: (existing as any)._id?.toString(),
    conflictStatus: (existing as any).status,
  });
}
