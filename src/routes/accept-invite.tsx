import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/accept-invite")({ component: AcceptInvite });

function AcceptInvite() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function verify() {
      try {
        const url = new URL(window.location.href);
        const tokenHash = url.searchParams.get("token_hash");
        const type = url.searchParams.get("type");
        if (tokenHash && type === "invite") {
          const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "invite" });
          if (error) throw error;
          window.history.replaceState({}, "", "/accept-invite");
        }
        // Supabase may return invite tokens in the URL fragment.
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (active) {
          setReady(Boolean(data.session));
          if (!data.session) setMessage("Convite inválido ou expirado. Solicite um novo convite ao administrador.");
        }
      } catch {
        if (active) setMessage("Não foi possível validar o convite. Solicite um novo convite.");
      } finally {
        if (active) setChecking(false);
      }
    }
    void verify();
    return () => { active = false; };
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 8) { setMessage("A senha precisa ter pelo menos 8 caracteres."); return; }
    if (password !== confirm) { setMessage("As senhas não coincidem."); return; }
    setBusy(true); setMessage("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setMessage(error.message); setBusy(false); return; }
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <section className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-7 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Ativar acesso ao AC360</h1>
        <p className="mt-2 text-sm text-slate-600">Defina sua senha para acessar a carteira de consultoria.</p>
        {checking ? <p className="mt-6 text-sm">Validando convite...</p> : ready ? (
          <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-4">
            <label className="block text-sm font-medium">Nova senha
              <input className="mt-1 w-full rounded-lg border p-3" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e => setPassword(e.target.value)} />
            </label>
            <label className="block text-sm font-medium">Confirmar senha
              <input className="mt-1 w-full rounded-lg border p-3" type="password" autoComplete="new-password" minLength={8} required value={confirm} onChange={e => setConfirm(e.target.value)} />
            </label>
            {message && <p role="alert" className="text-sm text-rose-700">{message}</p>}
            <button type="submit" disabled={busy} className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white disabled:opacity-50">{busy ? "Salvando..." : "Ativar conta"}</button>
          </form>
        ) : <p role="alert" className="mt-6 text-sm text-rose-700">{message}</p>}
      </section>
    </main>
  );
}
