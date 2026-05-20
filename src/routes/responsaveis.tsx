import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "@/components/dashboard/Placeholder";

export const Route = createFileRoute("/responsaveis")({
  component: () => (
    <Placeholder
      title="Responsáveis"
      subtitle="Gerencie os responsáveis por setor da empresa."
      message="Área de responsáveis em construção."
    />
  ),
  head: () => ({ meta: [{ title: "Responsáveis | Agente Comercial 360" }] }),
});
