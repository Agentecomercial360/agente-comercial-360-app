import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  listAdminUsers,
  listAdminCompanies,
  createAdminUser,
  resendAdminUserInvitation,
  type AdminUser,
  type AdminCompany,
  type CreateAdminUserInput,
} from "@/lib/admin-api";
import {
  Search,
  Shield,
  Clock,
  RefreshCw,
  Users,
  AlertCircle,
  Plus,
  X,
} from "lucide-react";

export const Route = createFileRoute("/admin/usuarios")({
  component: AdminUsuarios,
});

const PERFIS: Record<CreateAdminUserInput["role"], string> = {
  owner: "Dono",
  admin: "Administrador",
  gestor: "Gestor",
  vendas: "Vendas",
  financeiro: "Financeiro",
  administrativo: "Administrativo",
};

function emailValido(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isPerfilAcesso(valor: string): valor is keyof typeof PERFIS {
  return Object.prototype.hasOwnProperty.call(PERFIS, valor);
}

function nomeDoPerfil(role: string) {
  return isPerfilAcesso(role) ? PERFIS[role] || role : role;
}

function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [perfil, setPerfil] = useState("");
  const [atualizacao, setAtualizacao] = useState(0);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [empresas, setEmpresas] = useState<AdminCompany[]>([]);
  const [carregandoEmpresas, setCarregandoEmpresas] = useState(false);
  const [erroEmpresas, setErroEmpresas] = useState<string | null>(null);
  const [novoNome, setNovoNome] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novaEmpresa, setNovaEmpresa] = useState("");
  const [novoPerfil, setNovoPerfil] = useState<CreateAdminUserInput["role"]>("vendas");
  const [enviandoConvite, setEnviandoConvite] = useState(false);
  const [erroFormulario, setErroFormulario] = useState<string | null>(null);
  const [sucessoConvite, setSucessoConvite] = useState<string | null>(null);
  const [reenviandoConviteId, setReenviandoConviteId] =
    useState<string | null>(null);
  const [erroReenvio, setErroReenvio] =
    useState<string | null>(null);
  const [sucessoReenvio, setSucessoReenvio] =
    useState<string | null>(null);

  async function abrirFormulario() {
    if (enviandoConvite) {
      return;
    }

    if (mostrarFormulario) {
      setMostrarFormulario(false);
      return;
    }

    setMostrarFormulario(true);
    setCarregandoEmpresas(true);
    setErroEmpresas(null);
    setErroFormulario(null);
    setSucessoConvite(null);

    try {
      const resultado = await listAdminCompanies();
      setEmpresas(
        resultado.filter((empresa) =>
          ["active", "implementation"].includes(empresa.status ?? "")
        )
      );
    } catch (error) {
      setErroEmpresas(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as empresas."
      );
    } finally {
      setCarregandoEmpresas(false);
    }
  }

  useEffect(() => {
    let ativo = true;

    async function carregarUsuarios() {
      setLoading(true);
      setErro(null);

      try {
        const resultado = await listAdminUsers();

        if (ativo) {
          setUsuarios(resultado);
        }
      } catch (error) {
        if (ativo) {
          setErro(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar os usuários.",
          );
        }
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    }

    void carregarUsuarios();

    return () => {
      ativo = false;
    };
  }, [atualizacao]);

  async function reenviarConvite(
    usuario: AdminUser,
  ) {
    if (reenviandoConviteId) {
      return;
    }

    if (
      usuario.account_status !==
        "invitation_pending" ||
      !usuario.invitation_id
    ) {
      setErroReenvio(
        "Este usuário não possui convite pendente para reenvio.",
      );
      return;
    }

    setReenviandoConviteId(
      usuario.invitation_id,
    );
    setErroReenvio(null);
    setSucessoReenvio(null);

    try {
      await resendAdminUserInvitation(
        usuario.invitation_id,
      );

      setSucessoReenvio(
        usuario.email
          ? `Novo convite enviado para ${usuario.email}.`
          : "Novo convite enviado com sucesso.",
      );

      setAtualizacao(
        (valor) => valor + 1,
      );
    } catch (error) {
      setErroReenvio(
        error instanceof Error
          ? error.message
          : "Não foi possível reenviar o convite.",
      );
    } finally {
      setReenviandoConviteId(null);
    }
  }

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");

    const correspondeBusca =
      !termo ||
      [usuario.name, usuario.email, usuario.company_name]
        .some((valor) =>
          String(valor ?? "")
            .toLocaleLowerCase("pt-BR")
            .includes(termo),
        );

    return correspondeBusca && (!perfil || usuario.role === perfil);
  });

  async function enviarConvite() {
    if (enviandoConvite) {
      return;
    }

    const name = novoNome.trim();
    const email = novoEmail.trim();
    const companyId = novaEmpresa.trim();
    const role = novoPerfil;

    if (!name) {
      setErroFormulario("Informe o nome completo.");
      return;
    }

    if (!email) {
      setErroFormulario("Informe o e-mail.");
      return;
    }

    if (!emailValido(email)) {
      setErroFormulario("Informe um e-mail válido.");
      return;
    }

    if (!companyId) {
      setErroFormulario("Selecione a empresa.");
      return;
    }

    if (!(role in PERFIS)) {
      setErroFormulario("Selecione um perfil de acesso válido.");
      return;
    }

    const payload: CreateAdminUserInput = {
      name,
      email,
      company_id: companyId,
      role,
    };

    setEnviandoConvite(true);
    setErroFormulario(null);
    setSucessoConvite(null);

    try {
      const resultado = await createAdminUser(payload);

      if (resultado.success !== true) {
        setErroFormulario("Não foi possível enviar o convite.");
        return;
      }

      setSucessoConvite("Convite enviado com sucesso.");
      setNovoNome("");
      setNovoEmail("");
      setNovaEmpresa("");
      setNovoPerfil("vendas");
      setMostrarFormulario(false);
      setAtualizacao((valor) => valor + 1);
    } catch (error) {
      setErroFormulario(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar o convite.",
      );
    } finally {
      setEnviandoConvite(false);
    }
  }

  function formatarAcesso(valor: string | null) {
    if (!valor) return "Não registrado";

    const data = new Date(valor);

    return Number.isNaN(data.getTime())
      ? "Não registrado"
      : data.toLocaleString("pt-BR");
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Usuários
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Gerencie os usuários vinculados às empresas do AC360.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void abrirFormulario()}
            disabled={enviandoConvite}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Novo usuário
          </button>
          <button
            type="button"
            onClick={() => setAtualizacao((valor) => valor + 1)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
          </div>
        </div>


        {sucessoConvite && (
          <p
            role="status"
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            {sucessoConvite}
          </p>
        )}

        {sucessoReenvio && (
          <p
            role="status"
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            {sucessoReenvio}
          </p>
        )}

        {erroReenvio && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {erroReenvio}
          </p>
        )}
        {mostrarFormulario && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Novo usuário
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Preencha os dados para preparar um convite de acesso.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                aria-label="Fechar formulário"
                disabled={enviandoConvite}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">
                Nome completo
                <input
                  type="text"
                  value={novoNome}
                  maxLength={150}
                  onChange={(evento) => setNovoNome(evento.target.value)}
                  placeholder="Nome do usuário"
                  autoComplete="name"
                  disabled={enviandoConvite}
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 font-normal outline-none focus:border-blue-500 disabled:opacity-60"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                E-mail
                <input
                  type="email"
                  value={novoEmail}
                  maxLength={254}
                  onChange={(evento) => setNovoEmail(evento.target.value)}
                  placeholder="usuario@empresa.com.br"
                  autoComplete="email"
                  disabled={enviandoConvite}
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 font-normal outline-none focus:border-blue-500 disabled:opacity-60"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Empresa
                <select
                  value={novaEmpresa}
                  onChange={(evento) => setNovaEmpresa(evento.target.value)}
                  disabled={enviandoConvite || carregandoEmpresas || Boolean(erroEmpresas)}
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 font-normal outline-none focus:border-blue-500 disabled:opacity-60"
                >
                  <option value="">
                    {carregandoEmpresas ? "Carregando empresas..." : "Selecione a empresa"}
                  </option>
                  {empresas.map((empresa) => (
                    <option key={empresa.id} value={empresa.id}>
                      {empresa.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Perfil de acesso
                <select
                  value={novoPerfil}
                  onChange={(evento) =>
                    setNovoPerfil(evento.target.value as CreateAdminUserInput["role"])
                  }
                  disabled={enviandoConvite}
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 font-normal outline-none focus:border-blue-500 disabled:opacity-60"
                >
                  {Object.entries(PERFIS).map(([valor, nome]) => (
                    <option key={valor} value={valor}>
                      {nome}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {erroEmpresas && (
              <p role="alert" className="mt-4 text-sm text-red-700">
                {erroEmpresas}
              </p>
            )}

            {!carregandoEmpresas && !erroEmpresas && empresas.length === 0 && (
              <p className="mt-4 text-sm text-amber-700">
                Nenhuma empresa habilitada para receber usuários.
              </p>
            )}

            {erroFormulario && (
              <p role="alert" className="mt-4 text-sm text-red-700">
                {erroFormulario}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={() => void enviarConvite()}
                disabled={enviandoConvite || carregandoEmpresas || Boolean(erroEmpresas)}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                {enviandoConvite ? "Enviando convite..." : "Enviar convite"}
              </button>
              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                disabled={enviandoConvite}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-50"
              >
                Cancelar
              </button>
              <p className="text-xs text-slate-500">
                {enviandoConvite
                  ? "Aguarde a confirmação do envio."
                  : "O convite será enviado para o e-mail informado."}
              </p>
            </div>
          </section>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
                placeholder="Buscar por nome, e-mail ou empresa..."
                aria-label="Pesquisar usuários"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={perfil}
              onChange={(evento) => setPerfil(evento.target.value)}
              aria-label="Filtrar por perfil"
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="">Todos os perfis</option>
              {Object.entries(PERFIS).map(([valor, nome]) => (
                <option key={valor} value={valor}>
                  {nome}
                </option>
              ))}
            </select>
          </div>

          {erro && (
            <div
              role="alert"
              className="m-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {[
                    "Nome / E-mail",
                    "Empresa",
                    "Perfil",
                    "Módulos",
                    "Status",
                    "Último acesso",
                  ].map((titulo) => (
                    <th
                      key={titulo}
                      className="whitespace-nowrap px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500"
                    >
                      {titulo}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {!loading &&
                  !erro &&
                  usuariosFiltrados.map((usuario) => {
                    const nome = usuario.name?.trim() || "Sem nome";
                    const modulos = usuario.modules
                      .map((modulo) => modulo.module_name || modulo.module_key)
                      .filter(Boolean)
                      .join(", ");

                    return (
                      <tr
                        key={usuario.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                              <Users className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">
                                {nome}
                              </div>
                              <div className="text-xs text-slate-500">
                                {usuario.email || "Sem e-mail"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {usuario.company_name || "Empresa não identificada"}
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
                            <Shield className="h-3 w-3" />
                            {nomeDoPerfil(usuario.role)}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {modulos || "Nenhum módulo"}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col items-start gap-2">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                                usuario.account_status === "active"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : usuario.account_status === "invitation_pending"
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-red-50 text-red-700"
                              }`}
                            >
                              {usuario.account_status === "active"
                                ? "Ativo"
                                : usuario.account_status === "invitation_pending"
                                  ? "Convite pendente"
                                  : "Inativo"}
                            </span>

                            {usuario.account_status === "invitation_pending" &&
                              usuario.invitation_id && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    void reenviarConvite(usuario);
                                  }}
                                  disabled={reenviandoConviteId !== null}
                                  className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-blue-700 transition hover:text-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <RefreshCw
                                    className={`h-3.5 w-3.5 ${
                                      reenviandoConviteId === usuario.invitation_id
                                        ? "animate-spin"
                                        : ""
                                    }`}
                                  />

                                  {reenviandoConviteId === usuario.invitation_id
                                    ? "Reenviando..."
                                    : "Reenviar convite"}
                                </button>
                              )}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500">
                          <span className="inline-flex items-center gap-2 whitespace-nowrap">
                            <Clock className="h-4 w-4" />
                            {formatarAcesso(usuario.last_login_at)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>

            {loading && (
              <div className="p-10 text-center text-sm text-slate-500">
                Carregando usuários...
              </div>
            )}

            {!loading && !erro && usuariosFiltrados.length === 0 && (
              <div className="p-10 text-center text-sm text-slate-500">
                Nenhum usuário encontrado.
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-400">
          {loading || erro
            ? "Aguardando dados da API administrativa."
            : `${usuariosFiltrados.length} de ${usuarios.length} usuários exibidos.`}
        </p>
      </div>
    </AdminLayout>
  );
}
