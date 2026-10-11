import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Loader2, Mail, ShieldCheck } from "lucide-react";
import acLogo from "@/assets/ac-logo.png";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/ecommerce/recuperar-senha")({
  component: RecoverPasswordPage,
  head: () => ({
    meta: [
      { title: "Recuperar senha | AC360 E-commerce" },
      {
        name: "description",
        content: "Recupere com segurança o acesso ao AC360 E-commerce Intelligence.",
      },
    ],
  }),
});

function RecoverPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMsg(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setErrorMsg("Informe seu e-mail.");
      return;
    }

    setLoading(true);
    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/ecommerce/redefinir-senha`
          : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo,
      });

      if (error) throw error;

      setSent(true);
    } catch (error: any) {
      console.error("[ecommerce/recover-password]", error);
      setErrorMsg(
        "Não foi possível enviar o e-mail de recuperação agora. Tente novamente em instantes.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">
      <div className="mx-auto max-w-md">
        <button
          type="button"
          onClick={() => navigate({ to: "/ecommerce/login" })}
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para o login
        </button>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="border-b border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-6 py-7 text-white">
            <div className="flex items-center gap-3">
              <img src={acLogo} alt="AC360" className="h-11 w-11" />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200">
                  AC360 E-commerce
                </div>
                <h1 className="font-display text-xl font-bold">Recuperar acesso</h1>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              Informe o e-mail do seu acesso. O AC360 enviará um link seguro para você
              definir uma nova senha.
            </p>
          </div>

          <div className="p-6">
            {sent ? (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h2 className="mt-4 font-display text-lg font-bold text-slate-900">
                  Verifique seu e-mail
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Se existir uma conta para <strong>{email.trim()}</strong>, você receberá
                  as instruções para redefinir a senha.
                </p>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/ecommerce/login" })}
                  className="mt-6 w-full rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
                >
                  Voltar para entrar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="recover-email" className="text-xs font-semibold text-slate-700">
                    E-mail
                  </label>
                  <div className="relative mt-1.5">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-600" />
                    <input
                      id="recover-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="voce@empresa.com"
                      className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {errorMsg ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
                    {errorMsg}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-bold text-white transition hover:bg-blue-800 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  {loading ? "Enviando..." : "Enviar link de recuperação"}
                </button>

                <p className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-500">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
                  Por segurança, a tela não informa se um e-mail está ou não cadastrado.
                </p>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
