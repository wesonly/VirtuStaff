import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import { AppLayout } from "~/components/app-layout";

export const Route = createFileRoute("/app")({
  component: AppRoute,
});

function AppRoute() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate({ to: "/sign-in" });
    }
  }, [isLoaded, isSignedIn, navigate]);

  // Loading state while Clerk initializes
  if (!isLoaded) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 dark:border-indigo-800 dark:border-t-indigo-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Not signed in — redirecting (don't render the layout)
  if (!isSignedIn) {
    return null;
  }

  // Signed in — render the app layout
  return <AppLayout />;
}
