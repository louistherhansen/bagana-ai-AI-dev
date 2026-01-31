import { NextResponse } from "next/server";

const MOCK_DOCUMENTS: Record<string, string> = {
  "1": "# Client Campaign PRD - Q1 2025\n\n[Export placeholder - connect to DB]",
  "2": "# Internal Project Requirements\n\n[Export placeholder - connect to DB]",
};

// Stub: exports document as Markdown. Will connect to Prisma when backend is integrated.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "markdown";

  const content = MOCK_DOCUMENTS[id];
  if (!content) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  if (format === "markdown") {
    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/markdown",
        "Content-Disposition": `attachment; filename="document-${id}.md"`,
      },
    });
  }

  if (format === "pdf") {
    return NextResponse.json(
      { error: "PDF export not yet implemented (Phase 2)" },
      { status: 501 }
    );
  }

  return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
}
