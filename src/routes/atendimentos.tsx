import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "@/components/dashboard/Placeholder";

export const Route = createFileRoute("/atendimentos")({
  component: () => (
    <Placeholder
      title="Atendimentos"
      subtitle="Acompanhe os atendimentos recebidos e organizados pela IA."
      message="Área de atendimentos em construção."
    />
  ),
  head: () => ({ meta: [{ title: "Atendimentos | Agente Comercial 360" }] }),
});
