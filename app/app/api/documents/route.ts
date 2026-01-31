import { NextResponse } from "next/server";

// Stub: returns mock document list. Will connect to Prisma/DB when backend is integrated.
export async function GET() {
  const documents = [
    {
      id: "1",
      title: "Client Campaign PRD - Q1 2025",
      status: "draft",
      createdAt: "2025-01-30T10:00:00Z",
      updatedAt: "2025-01-30T10:00:00Z",
    },
    {
      id: "2",
      title: "Internal Project Requirements",
      status: "complete",
      createdAt: "2025-01-28T09:00:00Z",
      updatedAt: "2025-01-28T14:30:00Z",
    },
  ];

  return NextResponse.json({ documents });
}

// Stub: creates a document. Will connect to Prisma when backend is integrated.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { title = "Untitled Document" } = body;

  return NextResponse.json({
    id: `mock-${Date.now()}`,
    title,
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}
