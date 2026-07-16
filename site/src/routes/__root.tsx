import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  Link,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/clerk-react";
import appCss from "~/styles/app.css?url";

const CLERK_PUBLISHABLE_KEY =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  import.meta.env.CLERK_PUBLISHABLE_KEY ||
  "";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "VirtuStaff — Your AI Workforce" },
      {
        name: "description",
        content:
          "Hire AI employees that handle calls, qualify leads, manage emails, schedule appointments, and more. 24/7. No onboarding. No benefits.",
      },
      { name: "theme-color", content: "#4f46e5" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 28 28'%3E%3Crect width='28' height='28' rx='7' fill='%234f46e5'/%3E%3Cpath d='M8 20V8h3.5l3.5 5.5L18.5 8H22v12h-3.5v-6.5L15.5 19h-1l-3-5.5V20H8z' fill='white'/%3E%3C/svg%3E",
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..700&display=swap",
      },
    ],
  }),
  notFoundComponent: () => (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex items-center gap-2">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="28" height="28" rx="7" className="fill-indigo-600 dark:fill-indigo-500" />
          <path d="M8 20V8h3.5l3.5 5.5L18.5 8H22v12h-3.5v-6.5L15.5 19h-1l-3-5.5V20H8z" fill="white" />
        </svg>
        <span className="text-lg font-bold tracking-tight">VirtuStaff</span>
      </div>
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
  ),
  component: RootComponent,
});

function RootComponent() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <RootDocument>
        <Outlet />
      </RootDocument>
    </ClerkProvider>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-dvh bg-white text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100">
        {children}
        <Scripts />
      </body>
    </html>
  );
}