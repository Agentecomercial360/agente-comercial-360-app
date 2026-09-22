import { createFileRoute } from "@tanstack/react-router";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { StudioIaChatSection } from "@/components/ecommerce/StudioIaChat";

export const Route = createFileRoute("/ecommerce/chat-consultivo-ia")({
  component: ChatConsultivoIA,
  head: () => ({
    meta: [
      { title: "Chat Consultivo IA | AC360 E-commerce Intelligence" },
      {
        name: "description",
        content:
          "Chat consultivo somente leitura baseado no diagnóstico Studio IA da operação Mercado Livre.",
      },
      { property: "og:title", content: "Chat Consultivo IA | AC360 E-commerce Intelligence" },
      {
        property: "og:description",
        content:
          "Chat consultivo somente leitura baseado no diagnóstico Studio IA da operação Mercado Livre.",
      },
    ],
  }),
});

function ChatConsultivoIA() {
  return (
    <EcommerceLayout>
      <div className="space-y-6">
        <StudioIaChatSection />
      </div>
    </EcommerceLayout>
  );
}
