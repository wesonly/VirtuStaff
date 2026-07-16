import { createFileRoute, Link } from "@tanstack/react-router";
import { SignIn } from "@clerk/clerk-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-800 dark:bg-gray-900">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white">
            V
          </div>
          <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
            VirtuStaff
          </span>
        </Link>
      </header>

      {/* Sign-in centered */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Welcome back
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Sign in to your VirtuStaff dashboard
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <SignIn
              routing="path"
              path="/login"
              signUpUrl="/signup"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-0 p-0 bg-transparent",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  formButtonPrimary:
                    "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-sm font-semibold shadow-md border-0",
                  footerActionLink:
                    "text-indigo-600 hover:text-indigo-500 font-medium",
                  dividerRow: "hidden",
                  socialButtonsBlockButton:
                    "border-gray-300 dark:border-gray-700 rounded-lg",
                  formFieldInput:
                    "rounded-lg border-gray-300 dark:border-gray-700 focus:ring-indigo-500",
                  formFieldLabel: "text-sm font-medium text-gray-700 dark:text-gray-300",
                },
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
