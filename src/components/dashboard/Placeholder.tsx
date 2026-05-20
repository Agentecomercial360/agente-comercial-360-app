import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Construction } from "lucide-react";

export function Placeholder({
  title,
  subtitle,
  message,
}: {
  title: string;
  subtitle: string;
  message: string;
}) {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <header>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            {title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            {subtitle}
          </p>
        </header>

        <div
          className="rounded-2xl border bg-card px-6 py-16 flex flex-col items-center justify-center text-center"
          style={{ borderColor: "var(--border-premium)" }}
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl mb-4"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Construction className="h-7 w-7 text-primary-foreground" />
          </div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            {message}
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Esta área será conectada ao Supabase futuramente para exibir
            dados reais.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
