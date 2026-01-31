import { notFound } from "next/navigation";
import Link from "next/link";
import { DocumentViewer } from "@/components/documents/DocumentViewer";

// Mock data - will be replaced by API
const MOCK_DOCUMENTS: Record<
  string,
  { title: string; status: string; content: string }
> = {
  "1": {
    title: "Client Campaign PRD - Q1 2025",
    status: "draft",
    content: `# Product Requirements Document

## 1. Executive Summary

### Problem Statement
[To be completed via chat]

### Solution Overview
[To be completed via chat]

---

## 2. User Personas
[Guided by BAGANA AI]

---

## 3. Functional Requirements
[Guided by BAGANA AI]

---

## 4. Success Metrics
[Guided by BAGANA AI]

---

*Generated with BAGANA AI. Complete this document through the chat interface.*`,
  },
  "2": {
    title: "Internal Project Requirements",
    status: "complete",
    content: `# Product Requirements Document

## 1. Executive Summary

### Problem Statement
Internal teams need a streamlined way to document project requirements.

### Solution Overview
BAGANA AI provides guided PRD creation through conversational AI.

---

## 2. User Personas
- Agency PM
- Business Analyst
- Account Director

---

## 3. Functional Requirements
- Chat interface for requirements gathering
- PRD export (Markdown/PDF)
- Document versioning

---

## 4. Success Metrics
- Time to first PRD < 1 hour
- 90% document completeness
- 70% time reduction vs manual

---

*Document complete.*`,
  },
};

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doc = MOCK_DOCUMENTS[id];
  if (!doc) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/documents"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            ← Back to documents
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {doc.title}
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            Status:{" "}
            <span
              className={
                doc.status === "complete"
                  ? "text-green-600 dark:text-green-400"
                  : "text-amber-600 dark:text-amber-400"
              }
            >
              {doc.status}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/documents/${id}/export?format=markdown`}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Export Markdown
          </a>
          <span className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
            Export PDF (Phase 2)
          </span>
        </div>
      </div>

      <DocumentViewer content={doc.content} />
    </div>
  );
}
