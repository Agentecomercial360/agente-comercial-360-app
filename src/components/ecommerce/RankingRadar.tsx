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
import {
  AlertTriangle,
  Loader2,
  Minus,
  Radar as RadarIcon,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
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
  checkedAt: string;
  createdAt: string;
};

type RankDbRow = {
  id: string;
  listing_id: string;
  keyword: string;
  position: number;
  previous_position: number | null;
  note: string | null;
  checked_at: string;
  created_at: string;
};

function normKw(value: string): string {
  return value.trim().toLowerCase();
}

function fmtDate(iso: string): string {
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
  companyId: string;
  accountId: string;
  baseListingId: string;
  baseTitle: string;
  baseSku?: string | null;
};

export function RankingRadar({
  companyId,
  accountId,
  baseListingId,
  baseTitle,
  baseSku,
}: Props) {
  const [entries, setEntries] = useState<RankEntry[]>([]);
  const [keyword, setKeyword] = useState("");
  const [position, setPosition] = useState("");
  const [previousPos, setPreviousPos] = useState("");
  const [checkedAt, setCheckedAt] = useState<string>(todayISO());
  const [note, setNote] = useState("");
  const [selectedKw, setSelectedKw] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ecommerce_rank_history")
      .select("id,listing_id,keyword,position,previous_position,note,checked_at,created_at")
      .eq("company_id", companyId)
      .eq("account_id", accountId)
      .eq("listing_id", baseListingId)
      .order("checked_at", { ascending: true })
      .limit(500);

    if (error) {
      console.error("ranking history", error);
      toast.error("Não foi possível carregar o histórico de ranking.");
      setEntries([]);
    } else {
      setEntries(
        ((data || []) as RankDbRow[]).map((row) => ({
          id: row.id,
          listingId: row.listing_id,
          sku: baseSku ?? null,
          keyword: row.keyword,
          position: Number(row.position),
          previousManual:
            row.previous_position == null ? null : Number(row.previous_position),
          note: row.note || undefined,
          checkedAt: row.checked_at,
          createdAt: row.created_at,
        })),
      );
    }
    setLoading(false);
  }, [companyId, accountId, baseListingId, baseSku]);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  const sortedEntries = useMemo(
    () =>
      [...entries].sort(
        (a, b) => new Date(a.checkedAt).getTime() - new Date(b.checkedAt).getTime(),
      ),
    [entries],
  );

  const keywords = useMemo(() => {
    const values = new Map<string, string>();
    for (const entry of sortedEntries) {
      values.set(normKw(entry.keyword), entry.keyword);
    }
    return Array.from(values.entries()).map(([key, label]) => ({ key, label }));
  }, [sortedEntries]);

  useEffect(() => {
    if (!selectedKw && keywords.length > 0) setSelectedKw(keywords[0].key);
    if (selectedKw && !keywords.find((item) => item.key === selectedKw)) {
      setSelectedKw(keywords[0]?.key ?? "");
    }
  }, [keywords, selectedKw]);

  const kwEntries = useMemo(
    () => sortedEntries.filter((entry) => normKw(entry.keyword) === selectedKw),
    [sortedEntries, selectedKw],
  );

  const handleAdd = useCallback(async () => {
    const kw = keyword.trim();
    const pos = Number.parseInt(position, 10);
    const manualPrevious =
      previousPos.trim() === "" ? null : Number.parseInt(previousPos, 10);

    if (!kw) {
      toast.error("Informe a palavra-chave monitorada.");
      return;
    }
    if (!Number.isFinite(pos) || pos < 1 || pos > 9999) {
      toast.error("Posição atual inválida. Use um número inteiro maior que zero.");
      return;
    }
    if (
      manualPrevious != null &&
      (!Number.isFinite(manualPrevious) || manualPrevious < 1 || manualPrevious > 9999)
    ) {
      toast.error("Posição anterior inválida.");
      return;
    }
    if (!checkedAt) {
      toast.error("Informe a data da verificação.");
      return;
    }

    const previousAutomatic = [...sortedEntries]
      .filter((entry) => normKw(entry.keyword) === normKw(kw))
      .sort(
        (a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime(),
      )[0]?.position;

    const previous =
      manualPrevious ?? (previousAutomatic == null ? null : previousAutomatic);
    const iso = new Date(`${checkedAt}T12:00:00`).toISOString();

    setSaving(true);
    const { error } = await supabase.from("ecommerce_rank_history").insert({
      company_id: companyId,
      account_id: accountId,
      listing_id: baseListingId,
      keyword: kw,
      position: pos,
      previous_position: previous,
      source: "manual",
      note: note.trim() || null,
      checked_at: iso,
    });
    setSaving(false);

    if (error) {
      console.error("insert ranking history", error);
      toast.error("Não foi possível registrar a posição.");
      return;
    }

    const delta = previous == null ? null : previous - pos;
    if (delta != null && delta > 0) {
      toast.success(`Ranking melhorou: +${delta} posição(ões).`);
    } else if (delta != null && delta < 0) {
      toast.warning(`Ranking caiu ${Math.abs(delta)} posição(ões).`);
    } else {
      toast.success("Posição registrada no AC360.");
    }

    setSelectedKw(normKw(kw));
    setPosition("");
    setPreviousPos("");
    setNote("");
    setCheckedAt(todayISO());
    await loadEntries();
  }, [
    keyword,
    position,
    previousPos,
    checkedAt,
    note,
    companyId,
    accountId,
    baseListingId,
    sortedEntries,
    loadEntries,
  ]);

  const removeEntry = useCallback(
    async (id: string) => {
      const { error } = await supabase
        .from("ecommerce_rank_history")
        .delete()
        .eq("id", id)
        .eq("company_id", companyId)
        .eq("account_id", accountId);

      if (error) {
        toast.error("Não foi possível remover a medição.");
        return;
      }
      setEntries((current) => current.filter((entry) => entry.id !== id));
      toast.success("Medição removida.");
    },
    [companyId, accountId],
  );

  const stats = useMemo(() => {
    if (kwEntries.length === 0) return null;
    const positions = kwEntries.map((entry) => entry.position);
    const current = positions[positions.length - 1];
    const lastEntry = kwEntries[kwEntries.length - 1];
    const previousAuto =
      positions.length > 1 ? positions[positions.length - 2] : null;
    const previous = lastEntry.previousManual ?? previousAuto;
    const best = Math.min(...positions);
    const worst = Math.max(...positions);
    const delta = previous == null ? 0 : previous - current;
    let trend: "up" | "down" | "stable" = "stable";

    if (positions.length >= 2) {
      const first = positions[0];
      if (current < first) trend = "up";
      else if (current > first) trend = "down";
    } else if (previous != null) {
      if (current < previous) trend = "up";
      else if (current > previous) trend = "down";
    }

    return { current, previous, best, worst, delta, trend };
  }, [kwEntries]);

  const visibility = useMemo(() => {
    if (!stats) return null;
    if (stats.current > 20)
      return { label: "Baixa visibilidade", tone: "warn" as const };
    if (stats.current > 10)
      return { label: "Fora do Top 10", tone: "warn" as const };
    if (stats.current <= 3)
      return { label: "Alta visibilidade", tone: "good" as const };
    return { label: "Top 10", tone: "good" as const };
  }, [stats]);

  const movements = useMemo(() => {
    const byKeyword = new Map<string, RankEntry[]>();
    for (const entry of sortedEntries) {
      const key = normKw(entry.keyword);
      if (!byKeyword.has(key)) byKeyword.set(key, []);
      byKeyword.get(key)!.push(entry);
    }

    return Array.from(byKeyword.values()).map((list) => {
      const current = list[list.length - 1];
      const previousAuto =
        list.length > 1 ? list[list.length - 2].position : null;
      const previous = current.previousManual ?? previousAuto;
      return {
        keyword: current.keyword,
        current: current.position,
        previous,
        delta: previous == null ? 0 : previous - current.position,
      };
    });
  }, [sortedEntries]);

  const losses = useMemo(
    () =>
      movements
        .filter((movement) => movement.delta < 0)
        .sort((a, b) => a.delta - b.delta)
        .slice(0, 5),
    [movements],
  );

  const chartData = useMemo(
    () =>
      kwEntries.map((entry, index) => ({
        idx: index + 1,
        date: fmtDate(entry.checkedAt),
        position: entry.position,
      })),
    [kwEntries],
  );

  const yDomain = useMemo<[number, number]>(() => {
    if (kwEntries.length === 0) return [1, 10];
    const max = Math.max(...kwEntries.map((entry) => entry.position));
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
    if (stats.current > 20)
      out.push({ tone: "warn", text: "Baixa visibilidade" });
    else if (stats.current > 10)
      out.push({ tone: "warn", text: "Produto saiu do Top 10" });
    if (stats.delta <= -5)
      out.push({ tone: "warn", text: "Produto perdeu mais de 5 posições" });
    if (stats.delta >= 3)
      out.push({ tone: "good", text: "Produto ganhou posição relevante" });
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
            Histórico salvo no AC360 para acompanhar posição por palavra-chave e
            identificar perda ou ganho de visibilidade.
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
        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-lg border px-4 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando histórico de ranking…
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
          <div className="space-y-1.5 sm:col-span-3">
            <Label htmlFor="rr-kw">Palavra-chave monitorada</Label>
            <Input
              id="rr-kw"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Ex.: robô cachorro infantil"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rr-prev">Posição anterior</Label>
            <Input
              id="rr-prev"
              inputMode="numeric"
              value={previousPos}
              onChange={(event) =>
                setPreviousPos(event.target.value.replace(/[^0-9]/g, ""))
              }
              placeholder="Automática"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rr-pos">Posição atual</Label>
            <Input
              id="rr-pos"
              inputMode="numeric"
              value={position}
              onChange={(event) =>
                setPosition(event.target.value.replace(/[^0-9]/g, ""))
              }
              placeholder="Ex.: 3"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rr-date">Data da verificação</Label>
            <Input
              id="rr-date"
              type="date"
              value={checkedAt}
              onChange={(event) => setCheckedAt(event.target.value)}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-6">
            <Label htmlFor="rr-note">Observações</Label>
            <Input
              id="rr-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Ex.: verificação após ajuste de título"
            />
          </div>
          <div className="flex justify-end sm:col-span-6">
            <Button onClick={handleAdd} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando…
                </>
              ) : (
                "Registrar posição"
              )}
            </Button>
          </div>
        </div>

        {keywords.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Palavra-chave:
            </span>
            {keywords.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setSelectedKw(item.key)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  selectedKw === item.key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background hover:bg-accent"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : !loading ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma medição registrada ainda. Adicione a primeira posição acima.
          </p>
        ) : null}

        {stats ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <StatCard label="Posição atual" value={String(stats.current)} />
            <StatCard label="Melhor posição" value={String(stats.best)} />
            <StatCard label="Pior posição" value={String(stats.worst)} />
            <StatCard
              label="Última variação"
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
              tone={
                stats.delta > 0 ? "good" : stats.delta < 0 ? "warn" : "neutral"
              }
            />
            <StatCard
              label="Visibilidade"
              value={visibility?.label ?? "—"}
              tone={
                visibility?.tone === "warn"
                  ? "warn"
                  : visibility?.tone === "good"
                    ? "good"
                    : "neutral"
              }
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

        {alerts.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {alerts.map((alert, index) => (
              <Badge
                key={index}
                variant="outline"
                className={
                  alert.tone === "warn"
                    ? "border-amber-300 bg-amber-50 text-amber-900"
                    : alert.tone === "good"
                      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                      : ""
                }
              >
                {alert.tone === "warn" ? (
                  <AlertTriangle className="mr-1 h-3 w-3" />
                ) : null}
                {alert.text}
              </Badge>
            ))}
          </div>
        ) : null}

        {executive ? (
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Leitura do ranking
            </div>
            <p className="mt-2 text-sm">{executive}</p>
            {actions.length > 0 ? (
              <>
                <div className="mt-3 text-xs font-medium text-muted-foreground">
                  Ação sugerida
                </div>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                  {actions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        ) : null}

        {chartData.length > 1 ? (
          <div className="rounded-lg border p-4">
            <div className="mb-2 text-xs font-medium text-muted-foreground">
              Evolução da posição ao longo do tempo
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 8, right: 12, bottom: 8, left: 0 }}
                >
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
                    formatter={(value: number) => [`Posição ${value}`, ""]}
                    labelFormatter={(label) => String(label)}
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

        {losses.length > 0 ? (
          <div className="rounded-lg border p-4">
            <div className="mb-2 text-xs font-medium text-muted-foreground">
              Palavras-chave com maior perda de ranking
            </div>
            <ul className="space-y-1 text-sm">
              {losses.map((movement) => (
                <li
                  key={movement.keyword}
                  className="flex items-center justify-between"
                >
                  <span>{movement.keyword}</span>
                  <span className="text-amber-700">
                    {movement.previous} → {movement.current} ({movement.delta})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {sortedEntries.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Palavra-chave</TableHead>
                  <TableHead className="text-right">Anterior</TableHead>
                  <TableHead className="text-right">Atual</TableHead>
                  <TableHead className="text-right">Variação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...sortedEntries].reverse().map((entry) => {
                  const sameKeyword = sortedEntries.filter(
                    (item) => normKw(item.keyword) === normKw(entry.keyword),
                  );
                  const index = sameKeyword.findIndex(
                    (item) => item.id === entry.id,
                  );
                  const autoPrevious =
                    index > 0 ? sameKeyword[index - 1].position : null;
                  const previous = entry.previousManual ?? autoPrevious;
                  const delta =
                    previous == null ? 0 : previous - entry.position;
                  const status =
                    previous == null
                      ? "Primeira medição"
                      : delta > 0
                        ? "Ganho de ranking"
                        : delta < 0
                          ? "Perda de ranking"
                          : "Estável";

                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {fmtDate(entry.checkedAt)}
                      </TableCell>
                      <TableCell className="text-xs">{baseTitle}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {entry.sku ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm">{entry.keyword}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {previous ?? "—"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {entry.position}
                      </TableCell>
                      <TableCell
                        className={`text-right ${
                          delta > 0
                            ? "text-emerald-700"
                            : delta < 0
                              ? "text-amber-700"
                              : ""
                        }`}
                      >
                        {previous == null
                          ? "—"
                          : delta > 0
                            ? `+${delta}`
                            : delta}
                      </TableCell>
                      <TableCell className="text-xs">{status}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {entry.note ?? ""}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void removeEntry(entry.id)}
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
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-1 flex items-center gap-1 text-lg font-semibold ${toneClass}`}
      >
        {icon}
        {value}
      </div>
      {hint ? (
        <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>
      ) : null}
    </div>
  );
}
