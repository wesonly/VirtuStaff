import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "~/components/shared";
import { blogPosts } from "~/data/blog-posts";

export const Route = createFileRoute("/post/$slug")({
  notFoundComponent: () => (
    <PageLayout>
      <div className="flex min-h-[60dvh] flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Post not found
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          The blog post you're looking for doesn't exist.
        </p>
        <Link
          to="/blog"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          ← Back to blog
        </Link>
      </div>
    </PageLayout>
  ),
  component: BlogPostPage,
});

function BlogPostPage() {
  const { slug } = Route.useParams();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return <Route.notFoundComponent />;
  }

  return (
    <PageLayout>
      <article className="mx-auto max-w-3xl px-6 py-24 sm:py-32">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            to="/blog"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            ← Back to blog
          </Link>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="mt-4 flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          <span>{post.date}</span>
          <span className="text-gray-300 dark:text-gray-600">·</span>
          <span>{post.author}</span>
        </div>

        {/* Content */}
        <div className="mt-10">
          {post.content.split("\n").map((line, i) => {
            if (line.startsWith("## ")) {
              const text = line.slice(3);
              return (
                <h2 key={i} className="mb-4 mt-10 text-xl font-semibold text-gray-900 dark:text-white">
                  {text}
                </h2>
              );
            }
            if (line.startsWith("- **")) {
              const parts = line.match(/- \*\*(.+?)\*\*(.*)/);
              if (parts) {
                return (
                  <li key={i} className="ml-6 list-disc text-base leading-relaxed text-gray-600 dark:text-gray-400">
                    <strong className="text-gray-900 dark:text-white">{parts[1]}</strong>
                    {parts[2]}
                  </li>
                );
              }
              return <li key={i} className="ml-6 list-disc text-base leading-relaxed text-gray-600 dark:text-gray-400">{line.slice(2)}</li>;
            }
            if (line.startsWith("- ")) {
              return (
                <li key={i} className="ml-6 list-disc text-base leading-relaxed text-gray-600 dark:text-gray-400">
                  {line.slice(2)}
                </li>
              );
            }
            if (line.includes("[") && line.includes("](")) {
              const processed = line.replace(
                /\[([^\]]+)\]\(([^)]+)\)/g,
                '<a href="$2" class="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 underline">$1</a>',
              );
              if (line.trim() === "") return <br key={i} />;
              return (
                <p key={i} className="mb-4 text-base leading-relaxed text-gray-600 dark:text-gray-400" dangerouslySetInnerHTML={{ __html: processed }} />
              );
            }
            if (line.trim() === "") return <br key={i} />;
            return (
              <p key={i} className="mb-4 text-base leading-relaxed text-gray-600 dark:text-gray-400">
                {line}
              </p>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-16 border-t border-gray-200 pt-8 dark:border-gray-800">
          <Link
            to="/blog"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            ← Back to blog
          </Link>
        </div>
      </article>
    </PageLayout>
  );
}