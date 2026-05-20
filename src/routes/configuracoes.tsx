import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "@/components/dashboard/Placeholder";

export const Route = createFileRoute("/configuracoes")({
  component: () => (
    <Placeholder
      title="Configurações"
      subtitle="Gerencie dados da empresa, preferências e parâmetros do sistema."
      message="Área de configurações em construção."
    />
  ),
  head: () => ({ meta: [{ title: "Configurações | Agente Comercial 360" }] }),
});
