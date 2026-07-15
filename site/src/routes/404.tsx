import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "~/components/shared";

export const Route = createFileRoute("/404")({
  component: NotFoundPage,
});

function NotFoundPage() {
  return (
    <PageLayout>
      <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-6xl font-bold tracking-tight text-gray-900 dark:text-white">404</h1>
        <p className="max-w-md text-lg text-gray-600 dark:text-gray-400">
          Page not found. The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-indigo-500 hover:to-violet-500 active:scale-[0.97]"
        >
          Go Home
        </Link>
      </div>
    </PageLayout>
  );
}