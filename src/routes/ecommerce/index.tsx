import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/ecommerce/")({
  beforeLoad: () => {
    throw redirect({
      to: "/ecommerce/dashboard",
    });
  },
});
