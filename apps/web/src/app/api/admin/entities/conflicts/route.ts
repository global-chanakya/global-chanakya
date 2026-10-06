import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import { Conflict } from "@/lib/models/Conflict";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await dbConnect();
    
    const conflicts = await Conflict.aggregate([
      {
        $lookup: {
          from: "intelligenceevents",
          localField: "_id",
          foreignField: "conflicts",
          as: "events"
        }
      },
      {
        $addFields: {
          intelligenceEventCount: { $size: "$events" }
        }
      },
      {
        $project: {
          events: 0
        }
      },
      {
        $lookup: {
          from: "countries",
          localField: "countryIds",
          foreignField: "_id",
          as: "countriesList"
        }
      },
      { $sort: { name: 1 } }
    ]);
    return NextResponse.json(conflicts);
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
    const { name, slug, status, countryIds, aliases } = body;
    
    if (!name || !slug) return NextResponse.json({ error: "Name and slug required" }, { status: 400 });
    
    const conflict = new Conflict({
      name, slug, status: status || "active", countryIds: countryIds || [], aliases: aliases || []
    });
    await conflict.save();
    return NextResponse.json(conflict, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
