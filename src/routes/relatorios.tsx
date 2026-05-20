import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "@/components/dashboard/Placeholder";

export const Route = createFileRoute("/relatorios")({
  component: () => (
    <Placeholder
      title="Relatórios"
      subtitle="Acompanhe indicadores, resumo executivo e recomendações da IA."
      message="Área de relatórios em construção."
    />
  ),
  head: () => ({ meta: [{ title: "Relatórios | Agente Comercial 360" }] }),
});
