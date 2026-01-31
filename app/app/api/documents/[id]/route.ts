import { NextResponse } from "next/server";

const MOCK_DOCUMENTS: Record<string, { title: string; status: string; content: string }> = {
  "1": {
    title: "Client Campaign PRD - Q1 2025",
    status: "draft",
    content: "# Product Requirements Document\n\n[Content placeholder]",
  },
  "2": {
    title: "Internal Project Requirements",
    status: "complete",
    content: "# Product Requirements Document\n\n[Content placeholder]",
  },
};

// Stub: returns single document. Will connect to Prisma when backend is integrated.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const doc = MOCK_DOCUMENTS[id];

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json({
    id,
    ...doc,
  });
}
