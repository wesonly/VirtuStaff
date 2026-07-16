import { createFileRoute, Link } from "@tanstack/react-router";
import { SignUp } from "@clerk/clerk-react";

export const Route = createFileRoute("/sign-up")({
  component: SignUpPage,
});

function SignUpPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white px-6 dark:from-gray-950 dark:to-gray-900">
      <div className="mb-8 flex items-center gap-2">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="28" height="28" rx="7" fill="#4f46e5" />
          <path d="M8 20V8h3.5l3.5 5.5L18.5 8H22v12h-3.5v-6.5L15.5 19h-1l-3-5.5V20H8z" fill="white" />
        </svg>
        <span className="text-xl font-bold tracking-tight">VirtuStaff</span>
      </div>
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto w-full max-w-md",
            card: "rounded-2xl border border-gray-200 shadow-lg dark:border-gray-700",
            headerTitle: "text-2xl font-bold text-gray-900 dark:text-white",
            headerSubtitle: "text-gray-500 dark:text-gray-400",
            formButtonPrimary:
              "rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-indigo-500 hover:to-violet-500",
            formFieldInput:
              "rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900",
            footerActionLink: "text-indigo-600 hover:text-indigo-500 dark:text-indigo-400",
          },
        }}
      />
      <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{" "}
        <Link to="/sign-in" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
          Sign in
        </Link>
      </p>
    </div>
  );
}