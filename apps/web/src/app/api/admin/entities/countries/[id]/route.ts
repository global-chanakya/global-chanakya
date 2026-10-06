import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import { Country } from "@/lib/models/Country";
import { Leader } from "@/lib/models/Leader";
import { Conflict } from "@/lib/models/Conflict";
import { IntelligenceEvent } from "@/lib/models/IntelligenceEvent";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await dbConnect();
    
    const country = await Country.findById(params.id).lean();
    if (!country) return NextResponse.json({ error: "Not found" }, { status: 404 });
    
    const intelligenceEventCount = await IntelligenceEvent.countDocuments({ countries: params.id });
    const leadersCount = await Leader.countDocuments({ countryId: params.id });
    const conflictsCount = await Conflict.countDocuments({ countryIds: params.id });
    
    return NextResponse.json({ ...country, intelligenceEventCount, leadersCount, conflictsCount });
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
    // Allow aliases update, status update, name update, etc.
    const allowed = ["name", "slug", "status", "aliases"];
    const updateData: any = {};
    for (const k of allowed) {
      if (body[k] !== undefined) updateData[k] = body[k];
    }
    
    const updated = await Country.findByIdAndUpdate(params.id, updateData, { new: true });
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
    
    // SAFE DELETE POLICY
    const events = await IntelligenceEvent.countDocuments({ countries: params.id });
    if (events > 0) return NextResponse.json({ error: "Cannot permanently delete this entity because it is referenced by active intelligence data. Archive it instead." }, { status: 400 });
    
    const leaders = await Leader.countDocuments({ countryId: params.id });
    if (leaders > 0) return NextResponse.json({ error: "Cannot permanently delete this entity because it is referenced by active Leaders. Archive it instead." }, { status: 400 });
    
    const conflicts = await Conflict.countDocuments({ countryIds: params.id });
    if (conflicts > 0) return NextResponse.json({ error: "Cannot permanently delete this entity because it is referenced by active Conflicts. Archive it instead." }, { status: 400 });
    
    await Country.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
