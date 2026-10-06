import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import { Leader } from "@/lib/models/Leader";
import { IntelligenceEvent } from "@/lib/models/IntelligenceEvent";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await dbConnect();
    
    const leader = await Leader.findById(params.id).populate("countryId").lean();
    if (!leader) return NextResponse.json({ error: "Not found" }, { status: 404 });
    
    const intelligenceEventCount = await IntelligenceEvent.countDocuments({ leaders: params.id });
    
    return NextResponse.json({ ...leader, intelligenceEventCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await dbConnect();
    
    const body = await req.json();
    const allowed = ["name", "slug", "status", "countryId", "aliases"];
    const updateData: any = {};
    for (const k of allowed) {
      if (body[k] !== undefined) updateData[k] = body[k];
    }
    
    const updated = await Leader.findByIdAndUpdate(params.id, updateData, { new: true });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await dbConnect();
    
    const events = await IntelligenceEvent.countDocuments({ leaders: params.id });
    if (events > 0) return NextResponse.json({ error: "Cannot permanently delete this entity because it is referenced by active intelligence data. Archive it instead." }, { status: 400 });
    
    await Leader.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
