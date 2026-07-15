import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppLayout } from "~/components/app-layout";

export const Route = createFileRoute("/app")({
  component: AppLayoutRoute,
});

function AppLayoutRoute() {
  return (
    <AppLayout />
  );
}