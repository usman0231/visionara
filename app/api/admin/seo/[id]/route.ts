import { NextRequest, NextResponse } from "next/server";
import SEO from "@/lib/db/models/seo";

// GET single SEO configuration by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const seo = await SEO.findByPk(id);

    if (!seo) {
      return NextResponse.json(
        { error: "SEO configuration not found" },
        { status: 404 }
      );
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

// PUT - Update SEO configuration
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const seo = await SEO.findByPk(id);
    if (!seo) {
      return NextResponse.json(
        { error: "SEO configuration not found" },
        { status: 404 }
      );
    }

    await seo.update(body);

    return NextResponse.json(seo);
  } catch (error) {
    console.error("Error updating SEO:", error);
    return NextResponse.json(
      { error: "Failed to update SEO configuration" },
      { status: 500 }
    );
  }
}

// DELETE - Delete SEO configuration
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const seo = await SEO.findByPk(id);

    if (!seo) {
      return NextResponse.json(
        { error: "SEO configuration not found" },
        { status: 404 }
      );
    }

    await seo.destroy();

    return NextResponse.json({ message: "SEO configuration deleted successfully" });
  } catch (error) {
    console.error("Error deleting SEO:", error);
    return NextResponse.json(
      { error: "Failed to delete SEO configuration" },
      { status: 500 }
    );
  }
}
