---
name: tanstack-start-dollar-routes
description: How to create TanStack Start dynamic routes with $slug parameters without shell escaping issues.
---

# TanStack Start `$slug` Routes

When creating dynamic routes in TanStack Start (e.g., `post.$slug.tsx` → `/post/:slug`), the `$` character in the filename causes shell escaping issues if you create files via `bash`.

## The Problem

Using `WriteFile` with a filename containing `$slug` works correctly, but if you use bash commands like `mv` or `touch` without proper quoting, the shell interprets `$slug` as an empty variable, creating a file named `post..tsx` (double dot) instead of `post.$slug.tsx`.

Similarly, TanStack Start's route auto-generator treats `blog.tsx` + `blog.$slug.tsx` as parent-child routes, causing `BlogRoute` naming conflicts in the generated `routeTree.gen.ts`. Use a different base path (e.g., `/post/$slug` instead of `/blog/$slug`) to avoid this.

## Correct Approach

1. **Use `WriteFile` tool** (not bash) to create the file — it handles the `$` correctly.

2. **If you need to rename in bash**, use single quotes:
   ```bash
   mv 'post..tsx' 'post.$slug.tsx'
   ```

3. **Avoid parent-child route naming conflicts**: If you have a static route at `/blog` and a dynamic route at `/blog/$slug`, the auto-generator creates duplicate `BlogRoute` variables. Fix by using different base paths:
   - `/blog` (listing)
   - `/post/$slug` (detail page)

4. **Delete `routeTree.gen.ts` before each build** to force regeneration with the correct route tree.

5. **Use `Link` component** with `to` and `params`:
   ```tsx
   <Link to={"/post/$slug"} params={{ slug: post.slug }}>
     Read more
   </Link>
   ```