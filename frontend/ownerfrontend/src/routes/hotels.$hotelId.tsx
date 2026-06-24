import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/hotels/$hotelId")({
  component: () => <Outlet />,
});