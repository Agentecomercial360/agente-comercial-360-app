import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { supabase, inviteLinkDetected, inviteLinkAccessToken, inviteLinkError } from "@/lib/supabase";
import { acceptAdminUserInvitation } from "@/lib/admin-api";

export const Route = createFileRoute("/aceitar-convite")({
  component: AceitarConvite,
});

type ConviteValidado = {
  valido: true;
  email: string | null;
};

type ConviteInvalido = {
  valido: false;
  motivo: "token" | "sessao" | "divergencia";
};

async function validarIdentidadeDoConvite(): Promise<ConviteValidado | ConviteInvalido> {
  if (!inviteLinkDetected || inviteLinkError || !inviteLinkAccessToken) {
    return { valido: false, motivo: "token" };
  }

  const { data: convite, error: erroConvite } = await supabase.auth.getUser(
    inviteLinkAccessToken,
  );

  if (erroConvite || !convite.user?.id) {
    return { valido: false, motivo: "token" };
  }

  const { data: atual, error: erroAtual } = await supabase.auth.getUser();

  if (erroAtual || !atual.user?.id) {
    return { valido: false, motivo: "sessao" };
  }

  if (atual.user.id !== convite.user.id) {
    return { valido: false, motivo: "divergencia" };
  }

  return {
    valido: true,
    email: atual.user.email ?? convite.user.email ?? null,
  };
}

function AceitarConvite() {
  const [email, setEmail] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(true);
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [processando, setProcessando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [concluido, setConcluido] = useState(false);
  const [destino, setDestino] = useState<string | null>(null);
  const [sessaoTick, setSessaoTick] = useState(0);
  const ativacaoEmAndamentoRef = useRef(false);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      if (!ativacaoEmAndamentoRef.current) {
        setSessaoTick((valor) => valor + 1);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let ativo = true;

    if (inviteLinkError) {
      setMensagem("Este convite e invalido ou expirou. Solicite um novo convite.");
      setVerificando(false);
      return;
    }

    if (!inviteLinkDetected) {
      setVerificando(false);
      return;
    }

    async function verificarConvite() {
      const resultado = await validarIdentidadeDoConvite();

      if (!ativo) return;

      if (resultado.valido) {
        setEmail(resultado.email);
        setMensagem("");
        setVerificando(false);
        return;
      }

      if (resultado.motivo === "sessao") {
        setEmail(null);
        return;
      }

      setEmail(null);
      setMensagem("Este convite e invalido ou expirou. Solicite um novo convite.");
      setVerificando(false);
    }

    void verificarConvite();

    return () => {
      ativo = false;
    };
  }, [sessaoTick]);

  async function criarSenha(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setMensagem("");

    const validacaoInicial = await validarIdentidadeDoConvite();

    if (!validacaoInicial.valido) {
      setMensagem("Convite nao validado. Solicite um novo link.");
      return;
    }

    if (senha.length < 12) {
      setMensagem("A senha precisa ter pelo menos 12 caracteres.");
      return;
    }

    if (senha !== confirmacao) {
      setMensagem("As senhas informadas nao coincidem.");
      return;
    }

    setProcessando(true);

    try {
      const validacaoFinal = await validarIdentidadeDoConvite();

      if (!validacaoFinal.valido) {
        if (validacaoFinal.motivo === "sessao") {
          setMensagem("Sua sessao expirou. Solicite um novo convite.");
        } else {
          setMensagem("Este convite e invalido ou expirou. Solicite um novo convite.");
        }
        return;
      }

      ativacaoEmAndamentoRef.current = true;

      const { error } = await supabase.auth.updateUser({
        password: senha,
      });

      if (error) {
        setMensagem("Nao foi possivel definir sua senha. Solicite ajuda ao administrador.");
        return;
      }

      try {
        await acceptAdminUserInvitation();
      } catch {
        setMensagem(
          "Sua senha foi criada, mas nao foi possivel concluir a ativacao. Tente novamente.",
        );
        return;
      }
      const { data: acesso, error: erroAcesso } = await supabase
        .from("vw_user_access_context")
        .select("has_crm_access, has_ecommerce_access")
        .maybeSingle();

      if (!erroAcesso && acesso) {
        if (acesso.has_crm_access && acesso.has_ecommerce_access) {
          setDestino("/modulos");
        } else if (acesso.has_ecommerce_access) {
          setDestino("/ecommerce/login");
        } else if (acesso.has_crm_access) {
          setDestino("/login");
        }
      }

      setConcluido(true);
      setMensagem("Sua senha foi criada com sucesso.");
      await supabase.auth.signOut({ scope: "local" });
    } catch {
      setMensagem("Ocorreu um erro. Tente novamente.");
    } finally {
      ativacaoEmAndamentoRef.current = false;
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
          Ativar minha conta
        </h1>

        {concluido ? (
          <div className="space-y-4">
            <p role="status" className="text-emerald-700">
              {mensagem}
            </p>
            {destino ? (
              <a
                href={destino}
                className="inline-block rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
              >
                Acessar minha conta
              </a>
            ) : (
              <p className="text-sm text-slate-600">
                Solicite ao administrador a confirmacao das suas permissoes de acesso.
              </p>
            )}
          </div>
        ) : verificando ? (
          <p className="text-slate-600">Validando seu convite...</p>
        ) : email ? (
          <form onSubmit={criarSenha} className="space-y-4">
            <p className="text-sm text-slate-600">
              Conta: <strong>{email}</strong>
            </p>

            <label className="block text-sm font-semibold">
              Criar senha
              <input
                type="password"
                autoComplete="new-password"
                minLength={12}
                required
                value={senha}
                onChange={(evento) => setSenha(evento.target.value)}
                className="mt-2 w-full rounded-lg border p-3"
              />
            </label>

            <label className="block text-sm font-semibold">
              Confirmar senha
              <input
                type="password"
                autoComplete="new-password"
                minLength={12}
                required
                value={confirmacao}
                onChange={(evento) => setConfirmacao(evento.target.value)}
                className="mt-2 w-full rounded-lg border p-3"
              />
            </label>

            <button
              type="submit"
              disabled={processando}
              className="w-full rounded-xl bg-blue-600 p-3 font-bold text-white disabled:opacity-50"
            >
              {processando ? "Aguarde..." : "Ativar minha conta"}
            </button>
          </form>
        ) : (
          <p role="status" className="text-sm text-slate-600">
            {mensagem || "Nenhum convite valido foi identificado. Abra o link recebido por e-mail."}
          </p>
        )}

        {!concluido && email && mensagem && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            {mensagem}
          </p>
        )}
      </section>
    </main>
  );
}
