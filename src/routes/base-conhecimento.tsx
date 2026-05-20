import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "@/components/dashboard/Placeholder";

export const Route = createFileRoute("/base-conhecimento")({
  component: () => (
    <Placeholder
      title="Base de Conhecimento"
      subtitle="Organize regras, informações e conteúdos usados pela IA."
      message="Área de base de conhecimento em construção."
    />
  ),
  head: () => ({ meta: [{ title: "Base de Conhecimento | Agente Comercial 360" }] }),
});
