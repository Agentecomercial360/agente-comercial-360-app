import { createFileRoute } from "@tanstack/react-router";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { StudioIaChatSection } from "@/components/ecommerce/StudioIaChat";

export const Route = createFileRoute("/ecommerce/chat-consultivo-ia")({
  component: ChatConsultivoIA,
  head: () => ({
    meta: [
      { title: "Studio de Imagens IA | AC360 E-commerce Intelligence" },
      {
        name: "description",
        content:
          "Studio visual para organizar e preparar edições de imagens de produtos do Mercado Livre dentro do AC360.",
      },
      { property: "og:title", content: "Studio de Imagens IA | AC360 E-commerce Intelligence" },
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
