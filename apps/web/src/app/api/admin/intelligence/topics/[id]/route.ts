import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import { Topic } from "@/lib/models/Topic";
import { Blog } from "@/lib/models/Blog";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await dbConnect();
    
    const topic = await Topic.findById(params.id).lean();
    if (!topic) return NextResponse.json({ error: "Not found" }, { status: 404 });
    
    const usageCount = await Blog.countDocuments({ topics: params.id });
    
    return NextResponse.json({ ...topic, usageCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await dbConnect();
    
    const body = await req.json();
    const topic = await Topic.findByIdAndUpdate(params.id, { $set: body }, { new: true });
    
    if (!topic) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(topic);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await dbConnect();
    
    const count = await Blog.countDocuments({ topics: params.id });
    if (count > 0) return NextResponse.json({ error: "Cannot permanently delete this entity because it is referenced by active blogs. Archive it instead." }, { status: 400 });
    
    const topic = await Topic.findByIdAndDelete(params.id);
    if (!topic) return NextResponse.json({ error: "Not found" }, { status: 404 });
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
