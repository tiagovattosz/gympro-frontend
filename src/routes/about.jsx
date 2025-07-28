import { createFileRoute } from "@tanstack/react-router";
import Button from "@mui/material/Button";

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  return (
    <>
      <div className="p-2">Hello from About!</div>
      <Button variant="contained">Hello world</Button>
    </>
  );
}
