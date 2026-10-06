import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import { Leader } from "@/lib/models/Leader";
import { Country } from "@/lib/models/Country"; // for population

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await dbConnect();
    
    // N+1 avoidance via lookup for count
    const leaders = await Leader.aggregate([
      {
        $lookup: {
          from: "intelligenceevents",
          localField: "_id",
          foreignField: "leaders",
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
          localField: "countryId",
          foreignField: "_id",
          as: "countryObj"
        }
      },
      {
        $addFields: {
          country: { $arrayElemAt: ["$countryObj", 0] }
        }
      },
      {
        $project: {
          countryObj: 0
        }
      },
      { $sort: { name: 1 } }
    ]);
    return NextResponse.json(leaders);
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
    const { name, slug, status, countryId, aliases } = body;
    
    if (!name || !slug) return NextResponse.json({ error: "Name and slug required" }, { status: 400 });
    
    const leader = new Leader({
      name, slug, status: status || "active", countryId, aliases: aliases || []
    });
    await leader.save();
    return NextResponse.json(leader, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
