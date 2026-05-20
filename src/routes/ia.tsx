import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "@/components/dashboard/Placeholder";

export const Route = createFileRoute("/ia")({
  component: () => (
    <Placeholder
      title="Configuração da IA"
      subtitle="Configure o comportamento da assistente virtual da empresa."
      message="Área de configuração da IA em construção."
    />
  ),
  head: () => ({ meta: [{ title: "Configuração da IA | Agente Comercial 360" }] }),
});
