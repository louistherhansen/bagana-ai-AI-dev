import Link from "next/link";

// Mock data for MVP - will be replaced by API/database
const MOCK_DOCUMENTS = [
  {
    id: "1",
    title: "Client Campaign PRD - Q1 2025",
    status: "draft",
    updatedAt: "2025-01-30",
  },
  {
    id: "2",
    title: "Internal Project Requirements",
    status: "complete",
    updatedAt: "2025-01-28",
  },
];

export default function DocumentsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          My Documents
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          View and export your saved PRD and MRD documents.
        </p>
      </div>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800">
        {MOCK_DOCUMENTS.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-zinc-600 dark:text-zinc-400">
              No documents yet. Create your first PRD in the chat.
            </p>
            <Link
              href="/chat"
              className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Start chat
              <svg
                className="ml-1 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {MOCK_DOCUMENTS.map((doc) => (
              <li key={doc.id}>
                <Link
                  href={`/documents/${doc.id}`}
                  className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                >
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">
                      {doc.title}
                    </p>
                    <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                      Updated {doc.updatedAt} ·{" "}
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
                  <svg
                    className="h-5 w-5 text-zinc-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
        MVP: Document persistence will be connected when backend is integrated.
      </p>
    </div>
  );
}
