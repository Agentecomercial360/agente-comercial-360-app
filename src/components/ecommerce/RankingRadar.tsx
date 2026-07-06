import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Radar as RadarIcon, TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type RankEntry = {
  id: string;
  listingId: string;
  sku?: string | null;
  keyword: string;
  position: number;
  previousManual?: number | null;
  note?: string;
  checkedAt: string; // ISO — data da verificação
  createdAt: string; // ISO
};

const STORAGE_KEY = "ac360:ranking-radar:v2";
const LEGACY_KEY = "ac360:ranking-radar:v1";

function loadAll(): Record<string, RankEntry[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Record<string, RankEntry[]>;
    // migrate from v1
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy) as Record<string, Array<Omit<RankEntry, "checkedAt"> & { checkedAt?: string }>>;
      const migrated: Record<string, RankEntry[]> = {};
      for (const [k, list] of Object.entries(parsed)) {
        migrated[k] = list.map((e) => ({ ...e, checkedAt: e.checkedAt ?? e.createdAt }));
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
    return {};
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, RankEntry[]>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

function normKw(k: string) {
  return k.trim().toLowerCase();
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type Props = {
  baseListingId: string;
  baseTitle: string;
  baseSku?: string | null;
};

export function RankingRadar({ baseListingId, baseTitle, baseSku }: Props) {
  const [store, setStore] = useState<Record<string, RankEntry[]>>({});
  const [keyword, setKeyword] = useState("");
  const [position, setPosition] = useState("");
  const [previousPos, setPreviousPos] = useState("");
  const [checkedAt, setCheckedAt] = useState<string>(todayISO());
  const [note, setNote] = useState("");
  const [selectedKw, setSelectedKw] = useState<string>("");

  useEffect(() => {
    setStore(loadAll());
  }, []);

  const entries = useMemo<RankEntry[]>(() => {
    const list = store[baseListingId] ?? [];
    return [...list].sort(
      (a, b) => new Date(a.checkedAt).getTime() - new Date(b.checkedAt).getTime(),
    );
  }, [store, baseListingId]);

  const keywords = useMemo(() => {
    const set = new Map<string, string>();
    for (const e of entries) set.set(normKw(e.keyword), e.keyword);
    return Array.from(set.entries()).map(([k, label]) => ({ key: k, label }));
  }, [entries]);

  useEffect(() => {
    if (!selectedKw && keywords.length > 0) setSelectedKw(keywords[0].key);
    if (selectedKw && !keywords.find((k) => k.key === selectedKw)) {
      setSelectedKw(keywords[0]?.key ?? "");
    }
  }, [keywords, selectedKw]);

  const kwEntries = useMemo(
    () => entries.filter((e) => normKw(e.keyword) === selectedKw),
    [entries, selectedKw],
  );

  const handleAdd = useCallback(() => {
    const kw = keyword.trim();
    const pos = Number.parseInt(position, 10);
    const prev = previousPos.trim() === "" ? null : Number.parseInt(previousPos, 10);
    if (!kw) {
      toast.error("Informe a palavra-chave monitorada.");
      return;
    }
    if (!Number.isFinite(pos) || pos < 1 || pos > 9999) {
      toast.error("Posição atual inválida. Use um número inteiro maior que zero.");
      return;
    }
    if (prev != null && (!Number.isFinite(prev) || prev < 1 || prev > 9999)) {
      toast.error("Posição anterior inválida.");
      return;
    }
    if (!checkedAt) {
      toast.error("Informe a data da verificação.");
      return;
    }
    const iso = new Date(`${checkedAt}T12:00:00`).toISOString();
    const entry: RankEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      listingId: baseListingId,
      sku: baseSku ?? null,
      keyword: kw,
      position: pos,
      previousManual: prev,
      note: note.trim() || undefined,
      checkedAt: iso,
      createdAt: new Date().toISOString(),
    };
    setStore((prev) => {
      const next = { ...prev };
      const list = next[baseListingId] ? [...next[baseListingId]] : [];
      list.push(entry);
      next[baseListingId] = list;
      saveAll(next);
      return next;
    });
    setSelectedKw(normKw(kw));
    setPosition("");
    setPreviousPos("");
    setNote("");
    setCheckedAt(todayISO());
    toast.success("Posição registrada.");
  }, [keyword, position, previousPos, checkedAt, note, baseListingId, baseSku]);

  const removeEntry = useCallback(
    (id: string) => {
      setStore((prev) => {
        const next = { ...prev };
        next[baseListingId] = (next[baseListingId] ?? []).filter((e) => e.id !== id);
        saveAll(next);
        return next;
      });
    },
    [baseListingId],
  );

  // ---- Stats for selected keyword ----
  const stats = useMemo(() => {
    if (kwEntries.length === 0) return null;
    const positions = kwEntries.map((e) => e.position);
    const current = positions[positions.length - 1];
    const lastEntry = kwEntries[kwEntries.length - 1];
    const previousAuto = positions.length > 1 ? positions[positions.length - 2] : null;
    const previous = lastEntry.previousManual ?? previousAuto;
    const best = Math.min(...positions);
    const worst = Math.max(...positions);
    const delta = previous == null ? 0 : previous - current; // positive => gained
    let trend: "up" | "down" | "stable" = "stable";
    if (positions.length >= 2) {
      const first = positions[0];
      if (current < first) trend = "up";
      else if (current > first) trend = "down";
    } else if (previous != null) {
      if (current < previous) trend = "up";
      else if (current > previous) trend = "down";
    }
    return { current, previous, best, worst, delta, trend, count: positions.length };
  }, [kwEntries]);

  const visibility = useMemo(() => {
    if (!stats) return null;
    if (stats.current > 20)
      return { label: "Baixa visibilidade", tone: "warn" as const };
    if (stats.current > 10) return { label: "Fora do Top 10", tone: "warn" as const };
    if (stats.current <= 3) return { label: "Alta visibilidade", tone: "good" as const };
    return { label: "Top 10", tone: "good" as const };
  }, [stats]);

  const movements = useMemo(() => {
    const byKw = new Map<string, RankEntry[]>();
    for (const e of entries) {
      const k = normKw(e.keyword);
      if (!byKw.has(k)) byKw.set(k, []);
      byKw.get(k)!.push(e);
    }
    const out: Array<{ keyword: string; current: number; previous: number | null; delta: number }> = [];
    for (const [, list] of byKw) {
      const sorted = [...list].sort(
        (a, b) => new Date(a.checkedAt).getTime() - new Date(b.checkedAt).getTime(),
      );
      const current = sorted[sorted.length - 1];
      const prevAuto = sorted.length > 1 ? sorted[sorted.length - 2].position : null;
      const prev = current.previousManual ?? prevAuto;
      out.push({
        keyword: current.keyword,
        current: current.position,
        previous: prev,
        delta: prev != null ? prev - current.position : 0,
      });
    }
    return out;
  }, [entries]);

  const losses = useMemo(
    () => movements.filter((m) => m.delta < 0).sort((a, b) => a.delta - b.delta).slice(0, 5),
    [movements],
  );

  const chartData = useMemo(
    () =>
      kwEntries.map((e, i) => ({
        idx: i + 1,
        date: fmtDate(e.checkedAt),
        position: e.position,
      })),
    [kwEntries],
  );

  const yDomain = useMemo<[number, number]>(() => {
    if (kwEntries.length === 0) return [1, 10];
    const max = Math.max(...kwEntries.map((e) => e.position));
    return [1, Math.max(10, max + 2)];
  }, [kwEntries]);

  const executive = useMemo(() => {
    if (!stats) return null;
    if (stats.delta > 0) {
      return "O produto melhorou sua visibilidade para esta palavra-chave. Acompanhe se o ganho se mantém nas próximas verificações.";
    }
    if (stats.delta < 0) {
      return "O produto perdeu visibilidade. Avalie preço, frete, título, fotos, reputação, anúncios patrocinados e estoque.";
    }
    return "O produto manteve posição. Continue acompanhando concorrentes próximos.";
  }, [stats]);

  const alerts = useMemo(() => {
    const out: Array<{ tone: "warn" | "good" | "info"; text: string }> = [];
    if (!stats) return out;
    if (stats.current > 20) out.push({ tone: "warn", text: "Baixa visibilidade" });
    else if (stats.current > 10) out.push({ tone: "warn", text: "Produto saiu do Top 10" });
    if (stats.delta <= -5) out.push({ tone: "warn", text: "Produto perdeu mais de 5 posições" });
    if (stats.delta >= 3) out.push({ tone: "good", text: "Produto ganhou posição relevante" });
    if (stats.previous != null && stats.delta === 0)
      out.push({ tone: "info", text: "Produto está estável" });
    return out;
  }, [stats]);

  const actions = useMemo(() => {
    if (!stats) return [] as string[];
    const list: string[] = [];
    if (stats.current > 10) {
      list.push("Revisar título e palavras-chave do anúncio");
      list.push("Melhorar fotos e ficha técnica");
    }
    if (stats.delta < 0) {
      list.push("Analisar concorrentes acima na tabela de comparação");
      list.push("Verificar frete grátis e elegibilidade Full");
      list.push("Avaliar cupom ou campanha de Ads pontual");
    }
    if (stats.delta >= 0 && stats.current <= 10) {
      list.push("Apenas monitorar, sem ação imediata");
    }
    list.push("Só reduzir preço após revisar custo e margem");
    return list;
  }, [stats]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <RadarIcon className="h-4 w-4" />
            Radar de Rankeamento
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Acompanhe a posição dos seus produtos por palavra-chave e identifique perda ou ganho de
            visibilidade no Mercado Livre.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Produto monitorado: <span className="font-medium">{baseTitle}</span>
            {baseSku ? (
              <>
                {" "}· SKU <span className="font-mono">{baseSku}</span>
              </>
            ) : null}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Form */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
          <div className="sm:col-span-3 space-y-1.5">
            <Label htmlFor="rr-kw">Palavra-chave monitorada</Label>
            <Input
              id="rr-kw"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Ex.: robô cachorro infantil"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rr-prev">Posição anterior</Label>
            <Input
              id="rr-prev"
              inputMode="numeric"
              value={previousPos}
              onChange={(e) => setPreviousPos(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="Opcional"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rr-pos">Posição atual</Label>
            <Input
              id="rr-pos"
              inputMode="numeric"
              value={position}
              onChange={(e) => setPosition(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="Ex.: 3"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rr-date">Data da verificação</Label>
            <Input
              id="rr-date"
              type="date"
              value={checkedAt}
              onChange={(e) => setCheckedAt(e.target.value)}
            />
          </div>
          <div className="sm:col-span-6 space-y-1.5">
            <Label htmlFor="rr-note">Observações</Label>
            <Input
              id="rr-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex.: verificação após ajuste de título"
            />
          </div>
          <div className="sm:col-span-6 flex justify-end">
            <Button onClick={handleAdd}>Registrar posição</Button>
          </div>
        </div>

        {/* Keyword selector */}
        {keywords.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Posição monitorada:</span>
            {keywords.map((k) => (
              <button
                key={k.key}
                type="button"
                onClick={() => setSelectedKw(k.key)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  selectedKw === k.key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background hover:bg-accent"
                }`}
              >
                {k.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhuma medição registrada ainda. Adicione a primeira posição acima.
          </p>
        )}

        {/* Stats cards */}
        {stats ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <StatCard label="Posição atual" value={String(stats.current)} />
            <StatCard label="Melhor posição registrada" value={String(stats.best)} />
            <StatCard label="Pior posição registrada" value={String(stats.worst)} />
            <StatCard
              label="Variação da última medição"
              value={
                stats.previous == null
                  ? "—"
                  : stats.delta > 0
                    ? `+${stats.delta}`
                    : String(stats.delta)
              }
              hint={
                stats.previous == null
                  ? "Sem medição anterior"
                  : `De ${stats.previous} → ${stats.current}`
              }
              tone={stats.delta > 0 ? "good" : stats.delta < 0 ? "warn" : "neutral"}
            />
            <StatCard
              label="Status de visibilidade"
              value={visibility?.label ?? "—"}
              tone={visibility?.tone === "warn" ? "warn" : visibility?.tone === "good" ? "good" : "neutral"}
              icon={
                stats.trend === "up" ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : stats.trend === "down" ? (
                  <TrendingDown className="h-3.5 w-3.5" />
                ) : (
                  <Minus className="h-3.5 w-3.5" />
                )
              }
            />
          </div>
        ) : null}

        {/* Alerts */}
        {alerts.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {alerts.map((a, i) => (
              <Badge
                key={i}
                variant="outline"
                className={
                  a.tone === "warn"
                    ? "border-amber-300 bg-amber-50 text-amber-900"
                    : a.tone === "good"
                      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                      : ""
                }
              >
                {a.tone === "warn" ? <AlertTriangle className="mr-1 h-3 w-3" /> : null}
                {a.text}
              </Badge>
            ))}
          </div>
        ) : null}

        {/* Executive text + actions */}
        {executive ? (
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Leitura do ranking
            </div>
            <p className="mt-2 text-sm">{executive}</p>
            {actions.length > 0 ? (
              <>
                <div className="mt-3 text-xs font-medium text-muted-foreground">Ação sugerida</div>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                  {actions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        ) : null}

        {/* Chart */}
        {chartData.length > 1 ? (
          <div className="rounded-lg border p-4">
            <div className="mb-2 text-xs font-medium text-muted-foreground">
              Evolução da posição ao longo do tempo
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis
                    reversed
                    domain={yDomain}
                    allowDecimals={false}
                    tick={{ fontSize: 11 }}
                    label={{
                      value: "Posição",
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: 11 },
                    }}
                  />
                  <Tooltip
                    formatter={(v: number) => [`Posição ${v}`, ""]}
                    labelFormatter={(l) => String(l)}
                  />
                  <Line
                    type="monotone"
                    dataKey="position"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Quanto menor o número, melhor a posição. Eixo invertido para leitura executiva.
            </p>
          </div>
        ) : null}

        {/* Losses list */}
        {losses.length > 0 ? (
          <div className="rounded-lg border p-4">
            <div className="mb-2 text-xs font-medium text-muted-foreground">
              Palavras-chave com maior perda de ranking
            </div>
            <ul className="space-y-1 text-sm">
              {losses.map((m) => (
                <li key={m.keyword} className="flex items-center justify-between">
                  <span>{m.keyword}</span>
                  <span className="text-amber-700">
                    {m.previous} → {m.current} ({m.delta})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* History table */}
        {entries.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Palavra-chave</TableHead>
                  <TableHead className="text-right">Posição anterior</TableHead>
                  <TableHead className="text-right">Posição atual</TableHead>
                  <TableHead className="text-right">Variação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries
                  .slice()
                  .reverse()
                  .map((e) => {
                    // find auto previous within same keyword
                    const sameKw = entries.filter((x) => normKw(x.keyword) === normKw(e.keyword));
                    const idxInKw = sameKw.findIndex((x) => x.id === e.id);
                    const autoPrev = idxInKw > 0 ? sameKw[idxInKw - 1].position : null;
                    const prev = e.previousManual ?? autoPrev;
                    const delta = prev == null ? 0 : prev - e.position;
                    const status =
                      prev == null
                        ? "Primeira medição"
                        : delta > 0
                          ? "Ganho de ranking"
                          : delta < 0
                            ? "Perda de ranking"
                            : "Estável";
                    return (
                      <TableRow key={e.id}>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {fmtDate(e.checkedAt)}
                        </TableCell>
                        <TableCell className="text-xs">{baseTitle}</TableCell>
                        <TableCell className="font-mono text-xs">{e.sku ?? "—"}</TableCell>
                        <TableCell className="text-sm">{e.keyword}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {prev ?? "—"}
                        </TableCell>
                        <TableCell className="text-right font-medium">{e.position}</TableCell>
                        <TableCell
                          className={`text-right ${
                            delta > 0 ? "text-emerald-700" : delta < 0 ? "text-amber-700" : ""
                          }`}
                        >
                          {prev == null ? "—" : delta > 0 ? `+${delta}` : delta}
                        </TableCell>
                        <TableCell className="text-xs">{status}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {e.note ?? ""}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEntry(e.id)}
                            title="Remover"
                          >
                            Remover
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function StatCard({
  label,
  value,
  hint,
  tone = "neutral",
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "good" | "warn" | "neutral";
  icon?: React.ReactNode;
}) {
  const toneClass =
    tone === "good"
      ? "text-emerald-700"
      : tone === "warn"
        ? "text-amber-700"
        : "text-foreground";
  return (
    <div className="rounded-lg border p-3">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-1 flex items-center gap-1 text-lg font-semibold ${toneClass}`}>
        {icon}
        {value}
      </div>
      {hint ? <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div> : null}
    </div>
  );
}
