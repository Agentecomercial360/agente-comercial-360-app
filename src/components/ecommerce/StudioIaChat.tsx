import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  History,
  Image as ImageIcon,
  ImagePlus,
  Layers3,
  LoaderCircle,
  Maximize2,
  MessageSquare,
  MoreHorizontal,
  PackageSearch,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Paperclip,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Store,
  WandSparkles,
  X,
  ZoomIn,
  ZoomOut,
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

type InspectorTab = "produto" | "versoes" | "publicacao";

const QUICK_ACTIONS = [
  "Fundo branco",
  "Lifestyle",
  "Remover fundo",
  "Melhorar imagem",
  "Criar variações",
] as const;

const fmtCurrency = (value: number | null | undefined) =>
  typeof value === "number"
    ? value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      })
    : "—";

function ProductRow({
  item,
  selected,
  compact,
  onSelect,
}: {
  item: FeedItem;
  selected: boolean;
  compact: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      title={compact ? item.title : undefined}
      className={`group flex w-full items-center rounded-2xl border text-left transition-all duration-200 ${
        compact ? "justify-center p-2" : "gap-3 p-2.5"
      } ${
        selected
          ? "border-[#1E5EFF]/25 bg-[#EEF4FF] shadow-[0_12px_30px_-24px_rgba(30,94,255,.7)]"
          : "border-transparent hover:border-slate-200 hover:bg-white"
      }`}
    >
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <ImageIcon className="h-5 w-5 text-slate-300" />
        )}
        {selected && (
          <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full border border-white bg-[#1E5EFF]" />
        )}
      </span>

      {!compact && (
        <>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12px] font-semibold text-[#0A1F44]">
              {item.title}
            </span>
            <span className="mt-1 block truncate text-[10px] font-medium text-slate-400">
              {item.listingId || item.sku || "Anúncio Mercado Livre"}
            </span>
          </span>
          <ChevronRight
            className={`h-4 w-4 shrink-0 transition-transform ${
              selected ? "text-[#1E5EFF]" : "text-slate-300 group-hover:translate-x-0.5"
            }`}
          />
        </>
      )}
    </button>
  );
}

function Composer({
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
    <div className="bg-white px-4 pb-4 pt-2 sm:px-6 sm:pb-5">
      <div className="mx-auto max-w-4xl">
        {previews.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {previews.map((preview, index) => (
              <div
                key={`${preview.file.name}-${index}`}
                className="group relative h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm"
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

        <div className="mb-2.5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => setInput(action)}
              className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10.5px] font-semibold text-slate-600 transition hover:border-[#1E5EFF]/30 hover:bg-[#EEF4FF] hover:text-[#1E5EFF]"
            >
              {action}
            </button>
          ))}
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-[#F8FAFD] p-2 shadow-[0_18px_50px_-35px_rgba(10,31,68,.5)] transition focus-within:border-[#1E5EFF]/40 focus-within:bg-white focus-within:ring-4 focus-within:ring-[#1E5EFF]/8">
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
                  ? "Descreva como deseja transformar esta imagem…"
                  : "Selecione um produto ou envie uma imagem…"
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

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1 text-[10px] text-slate-400">
          <span>PNG, JPG ou WEBP · até 6 imagens</span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3 w-3 text-emerald-500" />
            Modo seguro · nenhuma publicação automática
          </span>
        </div>
      </div>
    </div>
  );
}

function Inspector({
  item,
  tab,
  onTabChange,
  accountLabel,
}: {
  item: FeedItem | null;
  tab: InspectorTab;
  onTabChange: (tab: InspectorTab) => void;
  accountLabel: string;
}) {
  const tabs: { key: InspectorTab; label: string }[] = [
    { key: "produto", label: "Produto" },
    { key: "versoes", label: "Versões" },
    { key: "publicacao", label: "Publicação" },
  ];

  return (
    <aside className="hidden w-[292px] shrink-0 border-l border-slate-200 bg-[#FBFCFE] xl:flex xl:flex-col">
      <div className="border-b border-slate-200 px-4 pt-4">
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
          {tabs.map((entry) => (
            <button
              key={entry.key}
              type="button"
              onClick={() => onTabChange(entry.key)}
              className={`rounded-lg px-2 py-2 text-[10px] font-semibold transition ${
                tab === entry.key
                  ? "bg-white text-[#0A1F44] shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {entry.label}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between py-4">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Inspector
            </p>
            <p className="mt-1 text-[13px] font-bold text-[#0A1F44]">
              {tab === "produto"
                ? "Contexto do produto"
                : tab === "versoes"
                  ? "Histórico visual"
                  : "Status de publicação"}
            </p>
          </div>
          {tab === "produto" ? (
            <Store className="h-4 w-4 text-[#1E5EFF]" />
          ) : tab === "versoes" ? (
            <Layers3 className="h-4 w-4 text-[#1E5EFF]" />
          ) : (
            <ShieldCheck className="h-4 w-4 text-[#1E5EFF]" />
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === "produto" && (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="aspect-square bg-[#F6F8FC]">
                {item?.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="h-full w-full object-contain p-3" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-slate-300" />
                  </div>
                )}
              </div>
              <div className="border-t border-slate-100 p-4">
                <p className="line-clamp-2 text-[12px] font-semibold leading-snug text-[#0A1F44]">
                  {item?.title || "Nenhum produto selecionado"}
                </p>
                <p className="mt-2 truncate text-[10px] text-slate-400">
                  {item?.listingId || item?.sku || accountLabel}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                ["Vendas", item?.metrics.sales ?? "—"],
                ["Receita", fmtCurrency(item?.metrics.revenue)],
                ["Estoque", item?.metrics.stock ?? "—"],
                ["SKU", item?.sku || "—"],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-[8.5px] font-bold uppercase tracking-wide text-slate-400">
                    {label}
                  </p>
                  <p className="mt-1.5 truncate text-[13px] font-bold text-[#0A1F44]">{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-blue-100 bg-[#EEF4FF] p-4">
              <div className="flex items-center gap-2 text-[#1E5EFF]">
                <Eye className="h-4 w-4" />
                <p className="text-[9.5px] font-bold uppercase tracking-[0.12em]">Imagem conectada</p>
              </div>
              <p className="mt-2 text-[10.5px] leading-relaxed text-slate-600">
                O Studio usa a imagem real disponível no Feed Inteligente como ponto de partida.
              </p>
            </div>
          </div>
        )}

        {tab === "versoes" && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-[#1E5EFF]/20 bg-[#EEF4FF] p-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-xl border border-white bg-white">
                  {item?.imageUrl ? (
                    <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="m-auto h-5 w-5 text-slate-300" />
                  )}
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#0A1F44]">Original</p>
                  <p className="mt-1 text-[9.5px] text-slate-400">Imagem atual do anúncio</p>
                </div>
                <CheckCircle2 className="ml-auto h-4 w-4 text-[#1E5EFF]" />
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-center">
              <History className="mx-auto h-5 w-5 text-slate-300" />
              <p className="mt-2 text-[11px] font-semibold text-slate-600">Nenhuma nova versão ainda</p>
              <p className="mt-1 text-[10px] leading-relaxed text-slate-400">
                As imagens geradas aparecerão aqui para comparação e aprovação.
              </p>
            </div>
          </div>
        )}

        {tab === "publicacao" && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF4FF] text-[#1E5EFF]">
                  <Store className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                    Destino
                  </p>
                  <p className="mt-1 text-[12px] font-bold text-[#0A1F44]">Mercado Livre</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
              <div className="flex items-center gap-2 text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
                <p className="text-[9.5px] font-bold uppercase tracking-[0.12em]">Modo seguro</p>
              </div>
              <p className="mt-2 text-[10.5px] leading-relaxed text-slate-600">
                Nenhuma alteração é enviada ao anúncio nesta etapa. A publicação será conectada somente após validação.
              </p>
            </div>

            <div className="space-y-2">
              {[
                ["Produto selecionado", true],
                ["Imagem escolhida", true],
                ["Alteração descrita", false],
                ["Nova versão gerada", false],
                ["Aprovação", false],
                ["Publicação", false],
              ].map(([label, done], index) => (
                <div
                  key={String(label)}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5"
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold ${
                      done ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : index + 1}
                  </span>
                  <span className="text-[10.5px] font-medium text-slate-600">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
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
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("produto");
  const [zoom, setZoom] = useState(1);
  const [workingImage, setWorkingImage] = useState<string | null>(null);
  const [messages, setMessages] = useState<StudioMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text:
        "Escolha um produto ou envie uma imagem. Depois descreva a alteração visual que deseja fazer.",
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

  useEffect(() => {
    setWorkingImage(null);
    setZoom(1);
  }, [selectedProduct?.id]);

  const displayImage = workingImage || selectedProduct?.imageUrl || null;

  const resetSession = () => {
    setWorkingImage(null);
    setZoom(1);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        text: "Nova edição pronta. Escolha o produto, envie uma imagem se quiser e descreva o resultado desejado.",
      },
    ]);
  };

  const handleSend = (text: string, files: File[]) => {
    const previews = files.map((file) => URL.createObjectURL(file));
    if (previews[0]) setWorkingImage(previews[0]);

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
          "Briefing recebido. O Studio já organizou produto, imagem e instrução nesta sessão. A geração visual será conectada na próxima etapa.",
      },
    ]);
  };

  return (
    <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_28px_80px_-48px_rgba(10,31,68,.62)]">
      <div className="flex min-h-[760px]">
        <aside
          className={`hidden shrink-0 border-r border-slate-200 bg-[#F7F9FC] transition-[width] duration-300 lg:flex lg:flex-col ${
            leftOpen ? "w-[220px]" : "w-[72px]"
          }`}
        >
          <div className="flex items-center gap-2 border-b border-slate-200 p-3">
            <button
              type="button"
              onClick={resetSession}
              className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#0A1F44] text-[11px] font-semibold text-white shadow-sm transition hover:bg-[#123266] ${
                leftOpen ? "px-3" : "px-0"
              }`}
              title="Nova edição"
            >
              <Plus className="h-4 w-4" />
              {leftOpen && "Nova edição"}
            </button>
            {leftOpen && (
              <button
                type="button"
                onClick={() => setLeftOpen(false)}
                className="flex h-11 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:text-[#1E5EFF]"
                title="Recolher produtos"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            )}
          </div>

          {!leftOpen && (
            <button
              type="button"
              onClick={() => setLeftOpen(true)}
              className="mx-auto mt-3 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:text-[#1E5EFF]"
              title="Abrir produtos"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          )}

          {leftOpen && (
            <div className="p-3 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar produto"
                  className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-[11px] text-slate-700 outline-none transition focus:border-[#1E5EFF]/40"
                />
              </div>
              <p className="px-1 pb-1 pt-4 text-[8.5px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Produtos recentes
              </p>
            </div>
          )}

          <div className={`flex-1 space-y-1 overflow-y-auto pb-4 ${leftOpen ? "px-2.5" : "px-2"}`}>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((item) => (
                <ProductRow
                  key={item.id}
                  item={item}
                  compact={!leftOpen}
                  selected={selectedProduct?.id === item.id}
                  onSelect={() => setSelectedId(item.id)}
                />
              ))
            ) : (
              leftOpen && (
                <div className="mx-1 mt-3 rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-center">
                  <PackageSearch className="mx-auto h-5 w-5 text-slate-300" />
                  <p className="mt-2 text-[10.5px] font-medium text-slate-500">
                    Nenhum produto com imagem encontrado.
                  </p>
                </div>
              )
            )}
          </div>

          <div className="border-t border-slate-200 p-3">
            <div
              className={`flex items-center rounded-xl bg-white ring-1 ring-slate-200 ${
                leftOpen ? "gap-2 px-3 py-2.5" : "justify-center p-2.5"
              }`}
            >
              <History className="h-4 w-4 shrink-0 text-slate-400" />
              {leftOpen && (
                <div className="min-w-0">
                  <p className="truncate text-[9.5px] font-semibold text-slate-700">Histórico de edições</p>
                  <p className="mt-0.5 text-[9px] text-slate-400">Em preparação</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col bg-white">
          <div className="flex min-h-[72px] items-center justify-between gap-4 border-b border-slate-200 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1E5EFF] to-[#0A1F44] text-white shadow-md shadow-[#1E5EFF]/20">
                <WandSparkles className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-[17px] font-bold tracking-tight text-[#0A1F44]">
                    Studio de Imagens IA
                  </h2>
                  <span className="rounded-full bg-[#FFF7D6] px-2 py-1 text-[8.5px] font-bold uppercase tracking-[0.12em] text-[#9A6B00]">
                    AC360 Studio
                  </span>
                </div>
                <p className="mt-0.5 max-w-[560px] truncate text-[10.5px] text-slate-400">
                  {selectedProduct?.title || "Selecione um produto para começar"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setRightOpen((current) => !current)}
                className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
                  rightOpen
                    ? "border-[#1E5EFF]/20 bg-[#EEF4FF] text-[#1E5EFF]"
                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                }`}
                title={rightOpen ? "Ocultar inspector" : "Abrir inspector"}
              >
                {rightOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
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

          <div className="flex flex-1 flex-col overflow-hidden bg-[#F4F6FA]">
            <div className="border-b border-slate-200/80 bg-white/70 px-4 py-3 backdrop-blur sm:px-6">
              <div className="mx-auto flex max-w-4xl items-center gap-3">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
                  {selectedProduct?.imageUrl ? (
                    <img src={selectedProduct.imageUrl} alt={selectedProduct.title} className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="m-auto h-4 w-4 text-slate-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[8.5px] font-bold uppercase tracking-[0.13em] text-[#1E5EFF]">
                    Produto ativo
                  </p>
                  <p className="mt-0.5 truncate text-[11.5px] font-semibold text-[#0A1F44]">
                    {selectedProduct?.title || "Nenhum produto selecionado"}
                  </p>
                </div>
                <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-semibold text-emerald-700 sm:inline-flex">
                  Conectado ao Feed
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
              <div className="mx-auto max-w-4xl">
                <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_22px_60px_-42px_rgba(10,31,68,.5)]">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#EEF4FF] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-[#1E5EFF]">
                        Original
                      </span>
                      <span className="text-[9.5px] text-slate-400">
                        {workingImage ? "Imagem enviada nesta sessão" : "Imagem atual do anúncio"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setZoom((value) => Math.max(0.8, Number((value - 0.1).toFixed(1))))}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#1E5EFF]"
                        title="Diminuir"
                      >
                        <ZoomOut className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-10 text-center text-[9.5px] font-semibold text-slate-400">
                        {Math.round(zoom * 100)}%
                      </span>
                      <button
                        type="button"
                        onClick={() => setZoom((value) => Math.min(1.4, Number((value + 0.1).toFixed(1))))}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#1E5EFF]"
                        title="Aumentar"
                      >
                        <ZoomIn className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setZoom(1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#1E5EFF]"
                        title="Redefinir zoom"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        className="hidden h-8 w-8 items-center justify-center rounded-lg text-slate-300 sm:flex"
                        title="Visualização ampliada"
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div
                    className="relative flex min-h-[340px] items-center justify-center overflow-hidden p-7 sm:min-h-[390px]"
                    style={{
                      backgroundColor: "#F7F8FB",
                      backgroundImage:
                        "linear-gradient(45deg, rgba(10,31,68,.025) 25%, transparent 25%), linear-gradient(-45deg, rgba(10,31,68,.025) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(10,31,68,.025) 75%), linear-gradient(-45deg, transparent 75%, rgba(10,31,68,.025) 75%)",
                      backgroundSize: "24px 24px",
                      backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0px",
                    }}
                  >
                    {displayImage ? (
                      <img
                        src={displayImage}
                        alt={selectedProduct?.title || "Imagem em edição"}
                        className="max-h-[320px] max-w-[86%] rounded-2xl object-contain shadow-[0_22px_60px_-26px_rgba(10,31,68,.38)] transition-transform duration-200 sm:max-h-[360px]"
                        style={{ transform: `scale(${zoom})` }}
                      />
                    ) : (
                      <div className="text-center">
                        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm ring-1 ring-slate-200">
                          <ImagePlus className="h-6 w-6" />
                        </span>
                        <p className="mt-3 text-[12px] font-semibold text-slate-600">Nenhuma imagem selecionada</p>
                        <p className="mt-1 text-[10px] text-slate-400">Escolha um produto ou envie uma imagem pelo chat.</p>
                      </div>
                    )}

                    <div className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/85 px-3 py-1.5 text-[9px] font-semibold text-slate-500 shadow-sm backdrop-blur">
                      <Eye className="h-3 w-3 text-[#1E5EFF]" />
                      Prévia de trabalho
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-t border-slate-100 bg-white px-4 py-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-[#1E5EFF] bg-white p-0.5">
                      {selectedProduct?.imageUrl ? (
                        <img src={selectedProduct.imageUrl} alt="" className="h-full w-full rounded-lg object-cover" />
                      ) : (
                        <ImageIcon className="h-4 w-4 text-slate-300" />
                      )}
                    </div>
                    <div>
                      <p className="text-[9.5px] font-bold text-[#0A1F44]">Original</p>
                      <p className="text-[8.5px] text-slate-400">Versão atual</p>
                    </div>
                    <div className="ml-2 h-7 w-px bg-slate-200" />
                    <button
                      type="button"
                      className="flex h-10 items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 text-[9.5px] font-semibold text-slate-400 transition hover:border-[#1E5EFF]/35 hover:bg-[#EEF4FF] hover:text-[#1E5EFF]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Nova versão
                    </button>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-end gap-2.5 ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <span className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4C87FF] to-[#1E5EFF] text-white shadow-sm ring-2 ring-white">
                          <Sparkles className="h-3.5 w-3.5" />
                        </span>
                      )}

                      <div className="max-w-[78%]">
                        {message.imagePreviews && message.imagePreviews.length > 0 && (
                          <div className="mb-2 flex justify-end gap-2">
                            {message.imagePreviews.slice(0, 3).map((url) => (
                              <img
                                key={url}
                                src={url}
                                alt=""
                                className="h-20 w-20 rounded-2xl border border-white object-cover shadow-md"
                              />
                            ))}
                          </div>
                        )}
                        <div
                          className={`rounded-[18px] px-4 py-3 text-[12.5px] leading-relaxed shadow-sm ${
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
                </div>
              </div>
            </div>

            <Composer selectedProduct={selectedProduct} onSend={handleSend} />
          </div>
        </main>

        {rightOpen && (
          <Inspector
            item={selectedProduct}
            tab={inspectorTab}
            onTabChange={setInspectorTab}
            accountLabel={accountLabel}
          />
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
      <div className="flex flex-wrap items-end justify-between gap-4 px-1">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-[#EEF4FF] px-3 py-1.5 text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#1E5EFF]">
            <MessageSquare className="h-3.5 w-3.5" />
            Criação visual para marketplace
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#0A1F44] sm:text-[28px]">
            Studio de Imagens IA
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
            Selecione um produto, trabalhe a imagem em contexto e organize novas versões em uma única experiência.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void feedQuery.refetch()}
          disabled={!activeAccountId || feedQuery.isFetching}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:border-[#1E5EFF]/25 hover:text-[#1E5EFF] disabled:cursor-not-allowed disabled:opacity-50"
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
        <div className="h-[760px] animate-pulse rounded-[30px] border border-slate-200 bg-slate-100" />
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

      {feedQuery.data && <StudioWorkspace data={feedQuery.data} accountLabel={accountLabel} />}
    </section>
  );
}
