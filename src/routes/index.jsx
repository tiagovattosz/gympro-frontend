import { createFileRoute } from "@tanstack/react-router";
import AppLayout from "../layout/AppLayout";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AppLayout>
      <h2>teste</h2>
    </AppLayout>
  );
}
