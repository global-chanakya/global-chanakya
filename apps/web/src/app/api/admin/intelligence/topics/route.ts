import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import { Topic } from "@/lib/models/Topic";
import { Blog } from "@/lib/models/Blog";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await dbConnect();
    
    // Using aggregation to avoid N+1 and mimic countries/leaders logic (if needed)
    const topics = await Topic.aggregate([
      {
        $lookup: {
          from: "blogs",
          localField: "_id",
          foreignField: "topics",
          as: "blogs"
        }
      },
      {
        $addFields: {
          usageCount: { $size: "$blogs" }
        }
      },
      {
        $project: {
          blogs: 0
        }
      },
      { $sort: { name: 1 } }
    ]);
    return NextResponse.json(topics);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await dbConnect();
    
    const body = await req.json();
    const { name, slug, description, status, featuredImage } = body;
    
    if (!name || !slug) return NextResponse.json({ error: "Name and slug required" }, { status: 400 });
    
    const topic = new Topic({
      name, slug, description, status: status || "active", featuredImage
    });
    await topic.save();
    return NextResponse.json(topic, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
