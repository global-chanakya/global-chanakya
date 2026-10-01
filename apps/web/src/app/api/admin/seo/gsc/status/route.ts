import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { SearchConsoleService } from "@/modules/seo/services/search-console.service";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const isConfigured = SearchConsoleService.isConfigured();
    
    if (!isConfigured) {
      return NextResponse.json({
        configured: false,
        authenticated: false,
        property: null,
        lastSuccessfulRequest: null,
        error: "GSC environment variables missing."
      });
    }

    // Try to make a dummy request to check auth
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    
    const startStr = lastWeek.toISOString().split('T')[0];
    const endStr = today.toISOString().split('T')[0];
    
    // We fetch a minimal amount of data just to verify auth and property access
    const result = await SearchConsoleService.getSitePerformance(startStr, endStr);
    
    if (result) {
      return NextResponse.json({
        configured: true,
        authenticated: true,
        property: process.env.GSC_SITE_URL,
        lastSuccessfulRequest: new Date().toISOString(),
        error: null
      });
    } else {
      return NextResponse.json({
        configured: true,
        authenticated: false,
        property: process.env.GSC_SITE_URL,
        lastSuccessfulRequest: null,
        error: "Authentication failed or property not accessible by service account."
      });
    }
  } catch (err: any) {
    console.error("[GSC Status API]", err);
    return NextResponse.json({
      configured: true,
      authenticated: false,
      property: process.env.GSC_SITE_URL,
      lastSuccessfulRequest: null,
      error: err.message || "Unknown error occurred"
    }, { status: 500 });
  }
}
