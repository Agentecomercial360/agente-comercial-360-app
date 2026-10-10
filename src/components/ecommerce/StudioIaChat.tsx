import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  ChevronRight,
  Eye,
  History,
  Image as ImageIcon,
  ImagePlus,
  Layers3,
  LoaderCircle,
  MessageSquare,
  MoreHorizontal,
  PackageSearch,
  PanelRight,
  Paperclip,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Store,
  WandSparkles,
  X,
} from "lucide-react";
import { ECOMMERCE_COMPANY_ID, useEcommerceActiveAccount } from "@/lib/ecommerce-active-account";
import {
  getIntelligentFeedPreview,
  IntelligentFeedError,
  type FeedItem,
  type IntelligentFeedPreview,
} from "@/lib/intelligent-feed-preview";

type StudioMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  imagePreviews?: string[];
};

const QUICK_ACTIONS = [
  "Fundo branco",
  "Lifestyle",
  "Remover fundo",
  "Melhorar imagem",
  "Criar variações",
] as const;

const fmtCurrency = (value: number | null | undefined) =>
  typeof value === "number"
    ? value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
    : "—";

function ProductThumbnail({
  item,
  selected,
  onSelect,
}: {
  item: FeedItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition-all ${
        selected
          ? "border-[#1E5EFF]/30 bg-[#EEF4FF] shadow-[0_12px_30px_-24px_rgba(30,94,255,.65)]"
          : "border-transparent bg-transparent hover:border-slate-200 hover:bg-white"
      }`}
    >
      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <ImageIcon className="h-5 w-5 text-slate-300" />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12.5px] font-semibold text-[#0A1F44]">
          {item.title}
        </span>
        <span className="mt-1 block truncate text-[10.5px] font-medium text-slate-400">
          {item.listingId || item.sku || "Anúncio Mercado Livre"}
        </span>
      </span>

      <ChevronRight
        className={`h-4 w-4 shrink-0 transition-transform ${
          selected ? "text-[#1E5EFF]" : "text-slate-300 group-hover:translate-x-0.5"
        }`}
      />
    </button>
  );
}

function StudioComposer({
  selectedProduct,
  onSend,
}: {
  selectedProduct: FeedItem | null;
  onSend: (text: string, files: File[]) => void;
}) {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files],
  );

  useEffect(
    () => () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    },
    [previews],
  );

  const submit = () => {
    const text = input.trim();
    if (!text && files.length === 0) return;
    onSend(text, files);
    setInput("");
    setFiles([]);
  };

  return (
    <div className="border-t border-slate-200/80 bg-white px-4 py-4 sm:px-5">
      {previews.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {previews.map((preview, index) => (
            <div
              key={`${preview.file.name}-${index}`}
              className="group relative h-16 w-16 overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
            >
              <img src={preview.url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setFiles((current) => current.filter((_, i) => i !== index))}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-950/75 text-white opacity-0 transition group-hover:opacity-100"
                aria-label="Remover imagem"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mb-3 flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action}
            type="button"
            onClick={() => setInput(action)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:border-[#1E5EFF]/30 hover:bg-[#EEF4FF] hover:text-[#1E5EFF]"
          >
            {action}
          </button>
        ))}
      </div>

      <div className="rounded-[22px] border border-slate-200 bg-[#F8FAFD] p-2 transition focus-within:border-[#1E5EFF]/45 focus-within:bg-white focus-within:ring-4 focus-within:ring-[#1E5EFF]/8">
        <div className="flex items-end gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => {
              const next = Array.from(event.target.files ?? []);
              setFiles((current) => [...current, ...next].slice(0, 6));
              event.currentTarget.value = "";
            }}
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[#1E5EFF]/30 hover:text-[#1E5EFF]"
            title="Adicionar imagem"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder={
              selectedProduct
                ? "Descreva o que deseja alterar nesta imagem…"
                : "Selecione um produto ou adicione uma imagem…"
            }
            className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2.5 text-[14px] leading-relaxed text-slate-700 outline-none placeholder:text-slate-400"
          />

          <button
            type="button"
            onClick={submit}
            className="mb-0.5 inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-[#1E5EFF] to-[#0A1F44] px-4 text-[12px] font-semibold text-white shadow-md shadow-[#1E5EFF]/20 transition hover:brightness-110 active:scale-[0.98]"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1 text-[10.5px] text-slate-400">
        <span>PNG, JPG ou WEBP · até 6 imagens por edição</span>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3 w-3 text-emerald-500" />
          Prévia visual · publicação no marketplace ainda não executada
        </span>
      </div>
    </div>
  );
}

function StudioWorkspace({
  data,
  accountLabel,
}: {
  data: IntelligentFeedPreview;
  accountLabel: string;
}) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [contextOpen, setContextOpen] = useState(true);
  const [messages, setMessages] = useState<StudioMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text:
        "Escolha um produto do Mercado Livre ou envie uma imagem. Depois descreva a alteração que deseja fazer. Este ambiente já está preparado para o fluxo de edição visual do AC360.",
    },
  ]);

  const products = useMemo(
    () => data.items.filter((item) => item.imageUrl).slice(0, 24),
    [data.items],
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;
    return products.filter((item) =>
      `${item.title} ${item.listingId ?? ""} ${item.sku ?? ""}`.toLowerCase().includes(query),
    );
  }, [products, search]);

  useEffect(() => {
    if (!selectedId && products.length > 0) setSelectedId(products[0].id);
  }, [products, selectedId]);

  const selectedProduct =
    products.find((item) => item.id === selectedId) ?? products[0] ?? null;

  const handleSend = (text: string, files: File[]) => {
    const previews = files.map((file) => URL.createObjectURL(file));
    const stamp = Date.now();
    setMessages((current) => [
      ...current,
      {
        id: `user-${stamp}`,
        role: "user",
        text: text || "Imagem adicionada para edição.",
        imagePreviews: previews,
      },
      {
        id: `assistant-${stamp}`,
        role: "assistant",
        text:
          "Pedido de edição recebido. O novo Studio já organiza produto, imagem e instrução em uma única conversa. A geração e publicação automática da nova imagem serão conectadas na próxima etapa.",
      },
    ]);
  };

  return (
    <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_26px_70px_-42px_rgba(10,31,68,.55)]">
      <div className="flex min-h-[720px]">
        {/* rail esquerdo */}
        <aside className="hidden w-[238px] shrink-0 border-r border-slate-200 bg-[#F7F9FC] lg:flex lg:flex-col">
          <div className="border-b border-slate-200 p-4">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A1F44] px-4 py-3 text-[12px] font-semibold text-white shadow-sm transition hover:bg-[#123266]"
            >
              <Plus className="h-4 w-4" />
              Nova edição
            </button>
          </div>

          <div className="p-4 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar produto"
                className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-[11.5px] text-slate-700 outline-none transition focus:border-[#1E5EFF]/40"
              />
            </div>
          </div>

          <div className="px-4 pb-2 pt-3">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Produtos recentes
            </p>
          </div>

          <div className="flex-1 space-y-1.5 overflow-y-auto px-3 pb-4">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((item) => (
                <ProductThumbnail
                  key={item.id}
                  item={item}
                  selected={selectedProduct?.id === item.id}
                  onSelect={() => setSelectedId(item.id)}
                />
              ))
            ) : (
              <div className="mx-1 mt-3 rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-center">
                <PackageSearch className="mx-auto h-5 w-5 text-slate-300" />
                <p className="mt-2 text-[11px] font-medium text-slate-500">
                  Nenhum produto com imagem encontrado.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 p-4">
            <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 ring-1 ring-slate-200">
              <History className="h-4 w-4 text-slate-400" />
              <div className="min-w-0">
                <p className="truncate text-[10px] font-semibold text-slate-700">Histórico de edições</p>
                <p className="mt-0.5 text-[9.5px] text-slate-400">Em preparação</p>
              </div>
            </div>
          </div>
        </aside>

        {/* centro */}
        <main className="flex min-w-0 flex-1 flex-col bg-white">
          <div className="flex min-h-[78px] items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1E5EFF] to-[#0A1F44] text-white shadow-md shadow-[#1E5EFF]/20">
                <WandSparkles className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-[18px] font-bold tracking-tight text-[#0A1F44] sm:text-[21px]">
                    Studio de Imagens IA
                  </h1>
                  <span className="rounded-full bg-[#FFF7D6] px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.12em] text-[#9A6B00]">
                    AC360 Studio
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[11.5px] text-slate-400">
                  {selectedProduct?.title || "Selecione um produto para começar"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setContextOpen((current) => !current)}
                className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
                  contextOpen
                    ? "border-[#1E5EFF]/20 bg-[#EEF4FF] text-[#1E5EFF]"
                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                }`}
                title="Contexto do produto"
              >
                <PanelRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
                title="Mais opções"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-[#F6F8FC] px-4 py-6 sm:px-7">
            {selectedProduct && (
              <div className="mx-auto mb-6 flex max-w-3xl items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-sm backdrop-blur">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  {selectedProduct.imageUrl ? (
                    <img
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="m-auto h-5 w-5 text-slate-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9.5px] font-bold uppercase tracking-[0.13em] text-[#1E5EFF]">
                    Produto selecionado
                  </p>
                  <p className="mt-1 truncate text-[13px] font-semibold text-[#0A1F44]">
                    {selectedProduct.title}
                  </p>
                  <p className="mt-1 truncate text-[10.5px] text-slate-400">
                    {selectedProduct.listingId || selectedProduct.sku || accountLabel}
                  </p>
                </div>
                <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold text-emerald-700 sm:inline-flex">
                  Imagem conectada
                </span>
              </div>
            )}

            <div className="mx-auto max-w-3xl space-y-5">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-end gap-2.5 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <span className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4C87FF] to-[#1E5EFF] text-white shadow-sm ring-2 ring-white">
                      <Sparkles className="h-4 w-4" />
                    </span>
                  )}

                  <div
                    className={`max-w-[82%] ${
                      message.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    {message.imagePreviews && message.imagePreviews.length > 0 && (
                      <div className="mb-2 flex justify-end gap-2">
                        {message.imagePreviews.slice(0, 3).map((url) => (
                          <img
                            key={url}
                            src={url}
                            alt=""
                            className="h-24 w-24 rounded-2xl border border-white object-cover shadow-md"
                          />
                        ))}
                      </div>
                    )}
                    <div
                      className={`rounded-[20px] px-4 py-3 text-[13.5px] leading-relaxed shadow-sm ${
                        message.role === "user"
                          ? "rounded-br-md bg-[#0A1F44] text-white"
                          : "rounded-bl-md border border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                </div>
              ))}

              {messages.length === 1 && (
                <div className="ml-0 grid gap-3 sm:ml-12 sm:grid-cols-3">
                  {[
                    { icon: ImagePlus, title: "Fundo branco", text: "Prepare a imagem principal." },
                    { icon: WandSparkles, title: "Lifestyle", text: "Crie um cenário de uso." },
                    { icon: Layers3, title: "Variações", text: "Explore novas versões visuais." },
                  ].map(({ icon: Icon, title, text }) => (
                    <div
                      key={title}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_28px_-24px_rgba(10,31,68,.5)]"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EEF4FF] text-[#1E5EFF]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <p className="mt-3 text-[12px] font-bold text-[#0A1F44]">{title}</p>
                      <p className="mt-1 text-[10.5px] leading-relaxed text-slate-400">{text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <StudioComposer selectedProduct={selectedProduct} onSend={handleSend} />
        </main>

        {/* contexto */}
        {contextOpen && (
          <aside className="hidden w-[280px] shrink-0 border-l border-slate-200 bg-[#FBFCFE] xl:block">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
              <div>
                <p className="text-[9.5px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Contexto
                </p>
                <p className="mt-1 text-[13px] font-bold text-[#0A1F44]">Produto Mercado Livre</p>
              </div>
              <Store className="h-4 w-4 text-[#1E5EFF]" />
            </div>

            <div className="space-y-5 p-5">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="aspect-square bg-slate-50">
                  {selectedProduct?.imageUrl ? (
                    <img
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="line-clamp-2 text-[12px] font-semibold leading-snug text-[#0A1F44]">
                    {selectedProduct?.title || "Nenhum produto selecionado"}
                  </p>
                  <p className="mt-2 text-[10px] text-slate-400">
                    {selectedProduct?.listingId || selectedProduct?.sku || accountLabel}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Vendas</p>
                  <p className="mt-1.5 text-[15px] font-bold text-[#0A1F44]">
                    {selectedProduct?.metrics.sales ?? "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Receita</p>
                  <p className="mt-1.5 text-[15px] font-bold text-[#0A1F44]">
                    {fmtCurrency(selectedProduct?.metrics.revenue)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Fluxo de edição
                </p>
                <div className="mt-3 space-y-2">
                  {[
                    ["1", "Selecionar produto", true],
                    ["2", "Enviar ou escolher imagem", true],
                    ["3", "Descrever alteração", false],
                    ["4", "Gerar nova versão", false],
                    ["5", "Aprovar e publicar", false],
                  ].map(([step, label, complete]) => (
                    <div
                      key={String(step)}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5"
                    >
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                          complete
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {complete ? <CheckCircle2 className="h-3.5 w-3.5" /> : step}
                      </span>
                      <span className="text-[10.5px] font-medium text-slate-600">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-[#EEF4FF] p-4">
                <div className="flex items-center gap-2 text-[#1E5EFF]">
                  <Eye className="h-4 w-4" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em]">Modo atual</p>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
                  A interface já trabalha com produtos e imagens reais do Feed Inteligente. A edição
                  generativa e a publicação no Mercado Livre ainda não executam alterações.
                </p>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

export function StudioIaChatSection() {
  const { activeAccountId, activeAccount, loading: accountsLoading } = useEcommerceActiveAccount();

  const feedQuery = useQuery<IntelligentFeedPreview, Error>({
    queryKey: ["studio-images-feed", ECOMMERCE_COMPANY_ID, activeAccountId],
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      getIntelligentFeedPreview({
        companyId: ECOMMERCE_COMPANY_ID,
        accountId: activeAccountId as string,
        limit: 24,
        signal,
      }),
    enabled: !accountsLoading && Boolean(activeAccountId),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });

  const accountLabel =
    activeAccount?.account_name || activeAccount?.nickname || "Mercado Livre";

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4 px-1">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-[#EEF4FF] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#1E5EFF]">
            <MessageSquare className="h-3.5 w-3.5" />
            Novo módulo de criação visual
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#0A1F44] sm:text-[28px]">
            Studio de Imagens IA
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
            Trabalhe imagens dos seus produtos do Mercado Livre em uma conversa simples, visual e
            contextual.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void feedQuery.refetch()}
          disabled={!activeAccountId || feedQuery.isFetching}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[11.5px] font-semibold text-slate-600 shadow-sm transition hover:border-[#1E5EFF]/25 hover:text-[#1E5EFF] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${feedQuery.isFetching ? "animate-spin" : ""}`} />
          Atualizar produtos
        </button>
      </div>

      {accountsLoading && (
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Identificando conta ativa…
        </div>
      )}

      {!accountsLoading && !activeAccountId && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          Selecione uma conta Mercado Livre específica no topo da tela para carregar os produtos.
        </div>
      )}

      {feedQuery.isPending && activeAccountId && !accountsLoading && (
        <div className="h-[720px] animate-pulse rounded-[30px] border border-slate-200 bg-slate-100" />
      )}

      {feedQuery.error && (
        <div
          className={`rounded-2xl border p-5 text-sm ${
            feedQuery.error instanceof IntelligentFeedError
              ? "border-amber-200 bg-amber-50 text-amber-800"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          <p className="font-semibold">Não foi possível carregar os produtos do Studio.</p>
          <p className="mt-1 opacity-90">{feedQuery.error.message}</p>
        </div>
      )}

      {feedQuery.data && (
        <StudioWorkspace data={feedQuery.data} accountLabel={accountLabel} />
      )}
    </section>
  );
}
