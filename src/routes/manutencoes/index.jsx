import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/manutencoes/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/manutencoes/"!</div>;
}
