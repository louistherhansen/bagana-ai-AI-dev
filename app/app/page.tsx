import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          BAGANA AI
        </h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
          AI-powered PRD and MRD creation for agencies. Create clear requirements
          documents through guided conversations.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <Link
          href="/chat"
          className="group rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
        >
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            New PRD
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Start a guided conversation to create a Product Requirements Document.
            Answer questions and get a complete PRD in minutes.
          </p>
          <span className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
            Start chat
            <svg
              className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
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
          </span>
        </Link>

        <Link
          href="/documents"
          className="group rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
        >
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            My Documents
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            View, manage, and export your saved PRD and MRD documents. Download
            as Markdown or PDF.
          </p>
          <span className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
            View documents
            <svg
              className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
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
          </span>
        </Link>
      </div>

      <div className="mt-12 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>MVP:</strong> PRD-only workflow. MRD creation, full multi-agent
          crew, and executive dashboard are planned for Phase 2.
        </p>
      </div>
    </div>
  );
}
