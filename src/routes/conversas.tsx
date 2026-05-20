import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "@/components/dashboard/Placeholder";

export const Route = createFileRoute("/conversas")({
  component: () => (
    <Placeholder
      title="Conversas"
      subtitle="Consulte o histórico de mensagens e interações com clientes."
      message="Área de conversas em construção."
    />
  ),
  head: () => ({ meta: [{ title: "Conversas | Agente Comercial 360" }] }),
});
