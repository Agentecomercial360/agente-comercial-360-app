import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "@/components/dashboard/Placeholder";

export const Route = createFileRoute("/leads")({
  component: () => (
    <Placeholder
      title="Leads"
      subtitle="Visualize oportunidades comerciais, temperatura dos leads e próximas ações."
      message="Área de leads em construção."
    />
  ),
  head: () => ({ meta: [{ title: "Leads | Agente Comercial 360" }] }),
});
