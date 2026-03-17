import { Card } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from "recharts";
import { groupByCategory, groupByDfcGrupo, groupByFormaPagamento, formatBRL } from "@/lib/finance-utils";
import type { MovimentacaoFinanceira } from "@/hooks/useFinanceData";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface CategoryChartsProps {
  data: MovimentacaoFinanceira[];
}

const TABS = [
  { id: "categoria", label: "Categoria" },
  { id: "natureza", label: "Natureza" },
  { id: "contas", label: "Contas" },
];

const DONUT_COLORS = [
  "hsl(var(--chart-donut-1))",
  "hsl(var(--chart-donut-2))",
  "hsl(var(--chart-donut-3))",
  "hsl(var(--chart-donut-4))",
  "hsl(var(--chart-donut-5))",
  "hsl(var(--chart-red))",
  "hsl(var(--chart-blue))",
];

/* ─── Tooltips ─── */

function SimpleTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="bg-card p-2.5 rounded-lg shadow-xl border border-border text-xs space-y-0.5">
      <p className="font-bold text-foreground text-[11px]">{item.name}</p>
      <p className="tabular-nums text-primary font-semibold">{formatBRL(item.value ?? item.valor_real ?? 0)}</p>
    </div>
  );
}

function DonutTooltip({ active, payload, total }: any) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  const pct = total ? ((item.value / total) * 100).toFixed(1) : "0.0";
  return (
    <div className="bg-card p-2.5 rounded-lg shadow-xl border border-border text-xs space-y-0.5">
      <p className="font-bold text-foreground">{item.name}</p>
      <p className="tabular-nums text-muted-foreground">{formatBRL(item.value)}</p>
      <p className="text-primary font-semibold">{pct}%</p>
    </div>
  );
}

/* ─── Performance Bar ─── */

function PerformanceBar({ name, value, maxValue, color = "hsl(var(--primary))" }: {
  name: string; value: number; maxValue: number; color?: string;
}) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="text-[10px] text-muted-foreground w-[100px] text-right truncate flex-shrink-0 leading-tight">{name}</span>
      <div className="flex-1 h-6 bg-muted/30 rounded overflow-hidden relative">
        <div
          className="h-full rounded flex items-center px-2 transition-all duration-500"
          style={{ width: `${Math.max(pct, 12)}%`, background: color }}
        >
          <span className="text-[9px] font-bold text-primary-foreground tabular-nums whitespace-nowrap">
            {formatBRL(value)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Tab: Categoria ─── */

function TabCategoria({ data }: { data: MovimentacaoFinanceira[] }) {
  const entradas = groupByCategory(data, "Entrada").slice(0, 6);
  const saidas = groupByCategory(data, "Saída").slice(0, 6);
  const maxEntrada = entradas[0]?.value ?? 1;
  const maxSaida = saidas[0]?.value ?? 1;

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-[9px] font-bold tracking-[0.1em] text-foreground uppercase mb-2">PERFORMANCE ENTRADAS</h4>
        {entradas.map((item) => (
          <PerformanceBar key={item.name} name={item.name} value={item.value} maxValue={maxEntrada} />
        ))}
      </div>
      <div>
        <h4 className="text-[9px] font-bold tracking-[0.1em] text-foreground uppercase mb-2">PERFORMANCE SAÍDAS</h4>
        {saidas.map((item) => (
          <PerformanceBar key={item.name} name={item.name} value={item.value} maxValue={maxSaida} color="hsl(var(--chart-red))" />
        ))}
      </div>
    </div>
  );
}

/* ─── Tab: Natureza ─── */

function TabNatureza({ data }: { data: MovimentacaoFinanceira[] }) {
  const despesas = useMemo(() => groupByDfcGrupo(data, "Saída"), [data]);
  const receitas = useMemo(() => groupByDfcGrupo(data, "Entrada"), [data]);
  const totalDespesas = despesas.reduce((s, e) => s + e.value, 0);
  const maxReceita = receitas[0]?.value ?? 1;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <h4 className="text-[9px] font-bold tracking-[0.1em] text-foreground uppercase mb-2">COMPOSIÇÃO DE DESPESAS</h4>
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={despesas}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={75}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {despesas.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<DonutTooltip total={totalDespesas} />} />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 9, lineHeight: "16px" }}
                  formatter={(value: string) => value.length > 16 ? value.slice(0, 14) + "…" : value}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <h4 className="text-[9px] font-bold tracking-[0.1em] text-foreground uppercase mb-2">PERFORMANCE RECEITAS</h4>
          <div className="space-y-0.5 mt-2">
            {receitas.slice(0, 5).map((item, i) => (
              <PerformanceBar key={item.name} name={item.name} value={item.value} maxValue={maxReceita} color={DONUT_COLORS[i % DONUT_COLORS.length]} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Tab: Contas ─── */

function TabContas({ data }: { data: MovimentacaoFinanceira[] }) {
  const formaData = useMemo(() => groupByFormaPagamento(data).slice(0, 6), [data]);
  const maxVal = formaData.reduce((m, d) => Math.max(m, d.entradas, d.saidas), 1);

  return (
    <div>
      <h4 className="text-[9px] font-bold tracking-[0.1em] text-foreground uppercase mb-2">FORMA DE PAGAMENTO</h4>
      <div className="space-y-1.5">
        {formaData.map((item) => (
          <div key={item.name} className="flex items-center gap-2 py-0.5">
            <span className="text-[10px] text-muted-foreground w-[100px] text-right truncate flex-shrink-0">{item.name}</span>
            <div className="flex-1 flex gap-0.5">
              <div className="flex-1 h-5 bg-muted/30 rounded overflow-hidden">
                <div
                  className="h-full rounded flex items-center px-1.5"
                  style={{ width: `${Math.max((item.entradas / maxVal) * 100, 12)}%`, background: "hsl(var(--primary))" }}
                >
                  <span className="text-[8px] font-bold text-primary-foreground tabular-nums whitespace-nowrap">{formatBRL(item.entradas)}</span>
                </div>
              </div>
              <div className="flex-1 h-5 bg-muted/30 rounded overflow-hidden">
                <div
                  className="h-full rounded flex items-center px-1.5"
                  style={{ width: `${Math.max((item.saidas / maxVal) * 100, 12)}%`, background: "hsl(var(--chart-red))" }}
                >
                  <span className="text-[8px] font-bold text-primary-foreground tabular-nums whitespace-nowrap">{formatBRL(item.saidas)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="flex items-center gap-3 pt-2 pl-[108px] text-[9px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ background: "hsl(var(--primary))" }} /> Entradas</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ background: "hsl(var(--chart-red))" }} /> Saídas</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */

export function CategoryCharts({ data }: CategoryChartsProps) {
  const [activeTab, setActiveTab] = useState("categoria");

  return (
    <Card className="p-5 border-0 rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.08)] h-fit">
      <div className="flex items-center gap-1.5 mb-4">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all duration-200",
              activeTab === id
                ? "bg-primary text-primary-foreground"
                : "bg-transparent text-muted-foreground hover:bg-accent border border-border"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "categoria" && <TabCategoria data={data} />}
      {activeTab === "natureza" && <TabNatureza data={data} />}
      {activeTab === "contas" && <TabContas data={data} />}
    </Card>
  );
}
