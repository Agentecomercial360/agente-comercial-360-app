
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/redefinir-senha")({
  component: RedefinirSenha,
});

function RedefinirSenha() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [usuario, setUsuario] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [concluido, setConcluido] = useState(false);

  useEffect(() => {
    let ativo = true;

    const { data: listener } = supabase.auth.onAuthStateChange(
      (evento, sessao) => {
        if (!ativo) return;

        if (evento === "PASSWORD_RECOVERY") {
          setUsuario(sessao?.user.email ?? null);
          setVerificando(false);
        }

        if (evento === "SIGNED_OUT") {
          setUsuario(null);
          setVerificando(false);
        }
      }
    );

    setVerificando(false);

    return () => {
      ativo = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function solicitarLink(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setProcessando(true);
    setMensagem("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo:
            window.location.origin + "/admin/redefinir-senha",
        }
      );

      setMensagem(
        error
          ? "Não foi possível solicitar o link. Tente novamente."
          : "Se o e-mail estiver cadastrado, você receberá um link de recuperação."
      );
    } catch {
      setMensagem("Não foi possível solicitar o link.");
    } finally {
      setProcessando(false);
    }
  }

  async function salvarSenha(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setMensagem("");

    if (senha.length < 12) {
      setMensagem("Utilize uma senha com pelo menos 12 caracteres.");
      return;
    }

    if (senha !== confirmacao) {
      setMensagem("As senhas informadas não coincidem.");
      return;
    }

    setProcessando(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: senha,
      });

      if (error) {
        setMensagem(
          `Erro do Supabase: ${error.message} (código: ${error.code ?? "não informado"})`
        );
        return;
      }

      setConcluido(true);
      setMensagem("Senha atualizada com sucesso.");
      await supabase.auth.signOut();
    } catch {
      setMensagem("Erro ao atualizar a senha.");
    } finally {
      setProcessando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-600">
          AC360
        </p>

        <h1 className="mb-3 text-2xl font-bold text-slate-900">
          Recuperação de acesso
        </h1>

        {concluido ? (
          <div className="space-y-4">
            <p role="status" className="text-emerald-700">
              {mensagem}
            </p>
            <a
              href="/admin/login"
              className="inline-block rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white"
            >
              Entrar no painel
            </a>
          </div>
        ) : verificando ? (
          <p className="text-slate-600">Verificando seu acesso...</p>
        ) : usuario ? (
          <form onSubmit={salvarSenha} className="space-y-4">
            <p className="text-sm text-slate-600">
              Conta autenticada: <strong>{usuario}</strong>
            </p>

            <label className="block text-sm font-semibold">
              Nova senha
              <input
                type="password"
                autoComplete="new-password"
                minLength={12}
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="mt-2 w-full rounded-lg border p-3"
              />
            </label>

            <label className="block text-sm font-semibold">
              Confirmar nova senha
              <input
                type="password"
                autoComplete="new-password"
                minLength={12}
                required
                value={confirmacao}
                onChange={(e) => setConfirmacao(e.target.value)}
                className="mt-2 w-full rounded-lg border p-3"
              />
            </label>

            <button
              type="submit"
              disabled={processando}
              className="w-full rounded-xl bg-blue-600 p-3 font-bold text-white disabled:opacity-50"
            >
              {processando ? "Atualizando..." : "Salvar nova senha"}
            </button>
          </form>
        ) : (
          <form onSubmit={solicitarLink} className="space-y-4">
            <p className="text-sm text-slate-600">
              Informe seu e-mail para receber um novo link.
            </p>

            <label className="block text-sm font-semibold">
              E-mail
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-lg border p-3"
              />
            </label>

            <button
              type="submit"
              disabled={processando}
              className="w-full rounded-xl bg-blue-600 p-3 font-bold text-white disabled:opacity-50"
            >
              {processando ? "Aguarde..." : "Solicitar recuperação"}
            </button>
          </form>
        )}

        {!concluido && mensagem && (
          <p role="status" className="mt-4 text-sm text-slate-700">
            {mensagem}
          </p>
        )}
      </section>
    </main>
  );
}
