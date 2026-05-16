import { createFileRoute, Link } from "@tanstack/react-router";
import acLogo from "@/assets/ac-logo.png";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [{ title: "Dashboard | Agente Comercial 360" }],
  }),
});

function DashboardPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <img src={acLogo} alt="Agente Comercial 360" width={56} height={56} className="mx-auto h-14 w-14" />
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
          Dashboard do Agente Comercial 360 em construção.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Em breve, sua central de atendimentos, leads e vendas estará disponível aqui.
        </p>
        <Link
          to="/login"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
        >
          Voltar para o login
        </Link>
      </div>
    </main>
  );
}
