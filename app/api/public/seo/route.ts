import { NextRequest, NextResponse } from "next/server";
import SEO from "@/lib/db/models/seo";

// GET SEO configuration for a specific page (public route)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "global";

    const seo = await SEO.findOne({
      where: {
        page,
        isActive: true,
      },
    });

    if (!seo) {
      // Fallback to global SEO if page-specific not found
      const globalSeo = await SEO.findOne({
        where: {
          page: "global",
          isActive: true,
        },
      });

      if (!globalSeo) {
        return NextResponse.json(
          { error: "SEO configuration not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(globalSeo);
    }

    return NextResponse.json(seo);
  } catch (error) {
    console.error("Error fetching SEO:", error);
    return NextResponse.json(
      { error: "Failed to fetch SEO configuration" },
      { status: 500 }
    );
  }
}
