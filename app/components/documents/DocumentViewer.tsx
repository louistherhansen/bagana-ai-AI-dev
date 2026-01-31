"use client";

export function DocumentViewer({ content }: { content: string }) {
  return (
    <article className="prose prose-zinc max-w-none dark:prose-invert">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-900 dark:text-zinc-50">
          {content}
        </pre>
      </div>
    </article>
  );
}
