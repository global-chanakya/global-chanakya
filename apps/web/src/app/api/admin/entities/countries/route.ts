import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import { Country } from "@/lib/models/Country";
import { IntelligenceEvent } from "@/lib/models/IntelligenceEvent";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await dbConnect();
    
    // N+1 avoidance using aggregation
    const countries = await Country.aggregate([
      {
        $lookup: {
          from: "intelligenceevents",
          localField: "_id",
          foreignField: "countries",
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
      { $sort: { name: 1 } }
    ]);
    return NextResponse.json(countries);
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
    const { name, slug, status, aliases } = body;
    
    if (!name || !slug) return NextResponse.json({ error: "Name and slug required" }, { status: 400 });
    
    const country = new Country({
      name, slug, status: status || "active", aliases: aliases || []
    });
    await country.save();
    return NextResponse.json(country, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
