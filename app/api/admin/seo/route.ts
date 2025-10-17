import { NextRequest, NextResponse } from "next/server";
import SEO from "@/lib/db/models/seo";

// GET all SEO configurations or specific page
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page");

    if (page) {
      const seo = await SEO.findOne({ where: { page } });
      if (!seo) {
        return NextResponse.json(
          { error: "SEO configuration not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(seo);
    }

    const seos = await SEO.findAll({
      order: [
        ["page", "ASC"],
      ],
    });

    return NextResponse.json(seos);
  } catch (error) {
    console.error("Error fetching SEO:", error);
    return NextResponse.json(
      { error: "Failed to fetch SEO configurations" },
      { status: 500 }
    );
  }
}

// POST - Create new SEO configuration
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const existingSeo = await SEO.findOne({ where: { page: body.page } });
    if (existingSeo) {
      return NextResponse.json(
        { error: "SEO configuration for this page already exists" },
        { status: 400 }
      );
    }

    const seo = await SEO.create(body);

    return NextResponse.json(seo, { status: 201 });
  } catch (error) {
    console.error("Error creating SEO:", error);
    return NextResponse.json(
      { error: "Failed to create SEO configuration" },
      { status: 500 }
    );
  }
}
