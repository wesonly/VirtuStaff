import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "~/components/shared";
import { blogPosts } from "~/data/blog-posts";

export const Route = createFileRoute("/blog")({
  component: BlogPage,
});

function BlogPage() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-4xl px-6 py-24 sm:py-32">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            Blog
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Stories, insights, and updates from the VirtuStaff team.
          </p>
        </div>

        <div className="mt-16 space-y-10">
          {blogPosts.map((post) => (
            <article
              key={post.slug}
              className="group rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:border-indigo-200 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-800"
            >
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

              <Link to={"/post/$slug"} params={{ slug: post.slug }} className="mt-4 block">
                <h2 className="text-xl font-semibold text-gray-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                  {post.title}
                </h2>
              </Link>

              <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {post.excerpt}
              </p>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span>{post.date}</span>
                  <span className="text-gray-300 dark:text-gray-600">·</span>
                  <span>{post.author}</span>
                </div>
                <Link
                  to={"/post/$slug"}
                  params={{ slug: post.slug }}
                  className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Read more →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}