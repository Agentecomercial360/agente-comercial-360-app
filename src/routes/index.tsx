import { createFileRoute } from "@tanstack/react-router";

import { LandingPage } from "./landing";

const SITE_URL = "https://agentecomercial360.com.br";
const TITLE = "AC360 E-commerce Intelligence — Vender melhor no Mercado Livre";
const DESCRIPTION =
  "Inteligência para vendedores do Mercado Livre: gestão multi-conta, margens, curva ABC, concorrência e diagnósticos estratégicos em um só painel.";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "AC360 E-commerce Intelligence" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: `${SITE_URL}/` },
      { property: "og:image", content: `${SITE_URL}/ac360-social-preview.png` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: `${SITE_URL}/ac360-social-preview.png` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "AC360 E-commerce Intelligence",
          url: SITE_URL,
          logo: `${SITE_URL}/favicon.png`,
          sameAs: [] as string[],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "AC360 E-commerce Intelligence",
          url: SITE_URL,
          inLanguage: "pt-BR",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "AC360 E-commerce Intelligence",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          url: SITE_URL,
          description: DESCRIPTION,
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "BRL",
          },
        }),
      },
    ],
  }),
});
