import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import acLogo from "@/assets/ac-logo.png";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/ecommerce/redefinir-senha")({
  component: ResetPasswordPage,
  head: () => ({
    meta: [
      { title: "Redefinir senha | AC360 E-commerce" },
      {
        name: "description",
        content: "Defina uma nova senha segura para sua conta AC360.",
      },
    ],
  }),
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function detectRecoverySession() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setValidSession(Boolean(data.session));
      setReady(true);
    }

    void detectRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "PASSWORD_RECOVERY" || session) {
        setValidSession(Boolean(session));
        setReady(true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMsg(null);

    if (password.length < 8) {
      setErrorMsg("Use uma senha com pelo menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("As senhas não conferem.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      setDone(true);
      await supabase.auth.signOut();
    } catch (error: any) {
      console.error("[ecommerce/reset-password]", error);
      setErrorMsg(
        error?.message ||
          "Não foi possível redefinir sua senha. Solicite um novo link de recuperação.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin text-blue-700" />
          Validando seu link seguro…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">
      <div className="mx-auto max-w-md">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="border-b border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-6 py-7 text-white">
            <div className="flex items-center gap-3">
              <img src={acLogo} alt="AC360" className="h-11 w-11" />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200">
                  AC360 E-commerce
                </div>
                <h1 className="font-display text-xl font-bold">Definir nova senha</h1>
              </div>
            </div>
          </div>

          <div className="p-6">
            {done ? (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h2 className="mt-4 font-display text-lg font-bold text-slate-900">
                  Senha atualizada
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Sua nova senha já está ativa. Entre novamente para acessar sua operação.
                </p>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/ecommerce/login" })}
                  className="mt-6 w-full rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
                >
                  Entrar no AC360
                </button>
              </div>
            ) : !validSession ? (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                  <KeyRound className="h-7 w-7" />
                </div>
                <h2 className="mt-4 font-display text-lg font-bold text-slate-900">
                  Link inválido ou expirado
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Solicite um novo e-mail de recuperação para continuar com segurança.
                </p>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/ecommerce/recuperar-senha" })}
                  className="mt-6 w-full rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
                >
                  Solicitar novo link
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="new-password" className="text-xs font-semibold text-slate-700">
                    Nova senha
                  </label>
                  <div className="relative mt-1.5">
                    <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-600" />
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Mínimo de 8 caracteres"
                      className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-12 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirm-new-password"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Confirmar nova senha
                  </label>
                  <input
                    id="confirm-new-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Repita sua nova senha"
                    className="mt-1.5 h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {errorMsg ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
                    {errorMsg}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-bold text-white transition hover:bg-blue-800 disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                  {saving ? "Salvando nova senha..." : "Salvar nova senha"}
                </button>

                <p className="text-center text-[11px] leading-relaxed text-slate-500">
                  Depois da alteração, sua sessão de recuperação será encerrada e você
                  entrará novamente com a nova senha.
                </p>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
