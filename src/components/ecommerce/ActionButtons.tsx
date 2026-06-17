import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Info,
  Settings2,
  ScrollText,
  Sparkles,
  ListChecks,
  Plus,
  ClipboardCheck,
  Truck,
} from "lucide-react";

function Row({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 pt-1">{children}</div>
  );
}

function GhostButton({
  children,
  onClick,
  icon: Icon,
}: {
  children: ReactNode;
  onClick?: () => void;
  icon: typeof Info;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      variant="outline"
      size="sm"
      className="h-9 rounded-full border-border/70 bg-card/60 px-4 text-xs font-semibold text-foreground/80 hover:bg-muted/60"
    >
      <Icon className="mr-1.5 h-3.5 w-3.5" />
      {children}
    </Button>
  );
}

function PrimaryButton({
  children,
  onClick,
  icon: Icon,
}: {
  children: ReactNode;
  onClick?: () => void;
  icon: typeof Info;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      size="sm"
      className="h-9 rounded-full bg-gradient-to-br from-blue-700 to-blue-900 px-4 text-xs font-semibold text-white shadow-md hover:opacity-95"
    >
      <Icon className="mr-1.5 h-3.5 w-3.5" />
      {children}
    </Button>
  );
}

function Bullet({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-2 text-sm text-muted-foreground">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-700" />
      <span>{children}</span>
    </li>
  );
}

/* ---------------- Curva ABC ---------------- */
export function CurvaABCActions() {
  return (
    <Row>
      <Dialog>
        <DialogTrigger asChild>
          <span>
            <GhostButton icon={ScrollText}>Ver regra de cálculo</GhostButton>
          </span>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Regra de cálculo da Curva ABC</DialogTitle>
            <DialogDescription>
              Como o sistema classificará os produtos após a leitura dos dados
              reais.
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2">
            <Bullet>
              <strong className="text-foreground">Classe A:</strong> produtos
              que concentram maior faturamento ou lucro.
            </Bullet>
            <Bullet>
              <strong className="text-foreground">Classe B:</strong> produtos
              com desempenho intermediário e potencial de crescimento.
            </Bullet>
            <Bullet>
              <strong className="text-foreground">Classe C:</strong> produtos
              de menor impacto, baixo giro ou baixa contribuição.
            </Bullet>
            <Bullet>
              <strong className="text-foreground">Pareto:</strong> produtos
              que representam aproximadamente 80% do faturamento ou lucro.
            </Bullet>
          </ul>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Fechar
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Row>
  );
}

/* ---------------- Estoque ---------------- */
export function EstoqueActions() {
  const [leadTime, setLeadTime] = useState("");
  return (
    <Row>
      <Dialog>
        <DialogTrigger asChild>
          <span>
            <PrimaryButton icon={Settings2}>Configurar lead time</PrimaryButton>
          </span>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Configurar lead time</DialogTitle>
            <DialogDescription>
              Defina o lead time padrão considerado nas recomendações de
              reposição.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="leadtime">Lead time padrão (dias)</Label>
              <Input
                id="leadtime"
                type="number"
                inputMode="numeric"
                placeholder="Ex: 90"
                value={leadTime}
                onChange={(e) => setLeadTime(e.target.value)}
              />
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50/60 px-3 py-2 text-xs text-blue-900">
              <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                O lead time padrão poderá considerar importações da China,
                inicialmente com referência de 90 dias.
              </span>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                onClick={() =>
                  toast.success(
                    "Configuração preparada. O salvamento será ativado após conexão dos dados reais.",
                  )
                }
              >
                Salvar configuração
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <span>
            <GhostButton icon={ScrollText}>Ver regra de reposição</GhostButton>
          </span>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Regra de reposição de estoque</DialogTitle>
            <DialogDescription>
              A recomendação futura de compra considerará os seguintes
              critérios.
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2">
            <Bullet>Estoque atual</Bullet>
            <Bullet>Média de vendas</Bullet>
            <Bullet>Cobertura em dias</Bullet>
            <Bullet>Pedidos em trânsito</Bullet>
            <Bullet>Margem de segurança</Bullet>
            <Bullet>Lead time</Bullet>
          </ul>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Fechar
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Row>
  );
}

/* ---------------- Ads ---------------- */
export function AdsActions() {
  return (
    <Row>
      <Dialog>
        <DialogTrigger asChild>
          <span>
            <GhostButton icon={ScrollText}>Ver critérios de análise</GhostButton>
          </span>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Critérios de análise de Ads</DialogTitle>
            <DialogDescription>
              A análise futura de desempenho de anúncios considerará os
              seguintes indicadores.
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2">
            <Bullet>Investimento</Bullet>
            <Bullet>Receita atribuída</Bullet>
            <Bullet>ROAS</Bullet>
            <Bullet>ACOS</Bullet>
            <Bullet>CTR</Bullet>
            <Bullet>CPC</Bullet>
            <Bullet>Conversão</Bullet>
            <Bullet>Potencial de escala</Bullet>
          </ul>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Fechar
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Row>
  );
}

/* ---------------- Prioridades ---------------- */
export function PrioridadesActions() {
  return (
    <Row>
      <Dialog>
        <DialogTrigger asChild>
          <span>
            <PrimaryButton icon={Sparkles}>
              Gerar prioridades da semana
            </PrimaryButton>
          </span>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Gerar prioridades da semana</DialogTitle>
            <DialogDescription>
              As prioridades serão geradas após a leitura dos dados reais de
              vendas, estoque, produtos, curva ABC e Ads.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button">Entendi</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <span>
            <GhostButton icon={ListChecks}>
              Ver lógica de priorização
            </GhostButton>
          </span>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Lógica de priorização</DialogTitle>
            <DialogDescription>
              Como o sistema classificará a urgência de cada ação.
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2">
            <Bullet>
              <strong className="text-foreground">Alta prioridade:</strong>{" "}
              impacto em venda, ruptura, margem ou campanha crítica.
            </Bullet>
            <Bullet>
              <strong className="text-foreground">Média prioridade:</strong>{" "}
              melhoria importante sem risco imediato.
            </Bullet>
            <Bullet>
              <strong className="text-foreground">Baixa prioridade:</strong>{" "}
              ajustes operacionais e preventivos.
            </Bullet>
          </ul>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Fechar
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Row>
  );
}

/* ---------------- Tarefas ---------------- */
export function TarefasActions() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    titulo: "",
    prioridade: "",
    origem: "",
    sku: "",
    responsavel: "",
    prazo: "",
    observacao: "",
  });
  const reset = () =>
    setForm({
      titulo: "",
      prioridade: "",
      origem: "",
      sku: "",
      responsavel: "",
      prazo: "",
      observacao: "",
    });
  return (
    <Row>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <span>
            <PrimaryButton icon={Plus}>Criar tarefa manual</PrimaryButton>
          </span>
        </DialogTrigger>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Criar tarefa manual</DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo. O salvamento será ativado na próxima
              etapa operacional.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="t-titulo">Título da tarefa</Label>
              <Input
                id="t-titulo"
                placeholder="Ex: Revisar fotos do anúncio"
                value={form.titulo}
                onChange={(e) =>
                  setForm({ ...form, titulo: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Prioridade</Label>
              <Select
                value={form.prioridade}
                onValueChange={(v) => setForm({ ...form, prioridade: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-origem">Origem</Label>
              <Input
                id="t-origem"
                placeholder="Ex: Curva ABC, Estoque, Ads"
                value={form.origem}
                onChange={(e) => setForm({ ...form, origem: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-sku">Produto / SKU</Label>
              <Input
                id="t-sku"
                placeholder="SKU ou nome do produto"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-resp">Responsável</Label>
              <Input
                id="t-resp"
                placeholder="Nome do operador"
                value={form.responsavel}
                onChange={(e) =>
                  setForm({ ...form, responsavel: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-prazo">Prazo</Label>
              <Input
                id="t-prazo"
                type="date"
                value={form.prazo}
                onChange={(e) => setForm({ ...form, prazo: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="t-obs">Observação</Label>
              <Textarea
                id="t-obs"
                rows={3}
                placeholder="Contexto, motivo ou detalhe da execução"
                value={form.observacao}
                onChange={(e) =>
                  setForm({ ...form, observacao: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={() => {
                toast.success(
                  "Tarefa preparada. O salvamento será ativado na próxima etapa operacional.",
                );
                reset();
                setOpen(false);
              }}
            >
              Criar tarefa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Row>
  );
}

/* ---------------- Resultados ---------------- */
export function ResultadosActions() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    acao: "",
    indicador: "",
    antes: "",
    depois: "",
    observacao: "",
  });
  const reset = () =>
    setForm({
      acao: "",
      indicador: "",
      antes: "",
      depois: "",
      observacao: "",
    });
  return (
    <Row>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <span>
            <PrimaryButton icon={ClipboardCheck}>
              Registrar resultado manual
            </PrimaryButton>
          </span>
        </DialogTrigger>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Registrar resultado manual</DialogTitle>
            <DialogDescription>
              Documente o impacto observado de uma ação. A medição real será
              ativada após integração dos dados.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="r-acao">Ação executada</Label>
              <Input
                id="r-acao"
                placeholder="Ex: Ajuste de preço no SKU X"
                value={form.acao}
                onChange={(e) => setForm({ ...form, acao: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="r-ind">Indicador analisado</Label>
              <Input
                id="r-ind"
                placeholder="Ex: Conversão, ROAS, Vendas"
                value={form.indicador}
                onChange={(e) =>
                  setForm({ ...form, indicador: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="r-antes">Antes</Label>
              <Input
                id="r-antes"
                placeholder="Valor anterior"
                value={form.antes}
                onChange={(e) => setForm({ ...form, antes: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="r-depois">Depois</Label>
              <Input
                id="r-depois"
                placeholder="Valor após a ação"
                value={form.depois}
                onChange={(e) => setForm({ ...form, depois: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="r-obs">Observação</Label>
              <Textarea
                id="r-obs"
                rows={3}
                placeholder="Contexto, hipótese ou aprendizado"
                value={form.observacao}
                onChange={(e) =>
                  setForm({ ...form, observacao: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={() => {
                toast.success(
                  "Registro preparado. A medição real será ativada após integração dos dados.",
                );
                reset();
                setOpen(false);
              }}
            >
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Row>
  );
}
