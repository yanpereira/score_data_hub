import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis, Cell } from "recharts";
import { ShoppingCart, TrendingUp, Clock, DollarSign } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { Reclamacao } from "@/data/ecommerce-data";
import { calcularKPIs, agruparPorMes, agruparPorCanal, agruparPorEstado } from "@/data/ecommerce-data";

interface Props {
  dados: Reclamacao[];
  dadosCompletos: Reclamacao[];
}

export default function DashboardSidebar({ dados, dadosCompletos }: Props) {
  const kpisYTD = useMemo(() => calcularKPIs(dadosCompletos), [dadosCompletos]);
  const kpis = useMemo(() => calcularKPIs(dados), [dados]);
  const porMes = useMemo(() => agruparPorMes(dadosCompletos), [dadosCompletos]);
  const porCanal = useMemo(() => agruparPorCanal(dados), [dados]);
  const porEstado = useMemo(() => agruparPorEstado(dados).slice(0, 10), [dados]);

  const canalColors = [
    'hsl(340, 75%, 55%)', 'hsl(340, 60%, 65%)', 'hsl(340, 45%, 72%)',
    'hsl(340, 30%, 78%)', 'hsl(340, 20%, 84%)'
  ];

  return (
    <aside className="w-[340px] min-h-screen bg-primary text-primary-foreground flex flex-col overflow-y-auto shrink-0">
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <ShoppingCart className="h-5 w-5" />
          <h1 className="text-lg font-bold tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            RECLAMAÇÕES INSIGHTS
          </h1>
        </div>
        <p className="text-[11px] opacity-80 leading-tight">
          Mapeando reclamações de consumidores em lojas online brasileiras
        </p>
      </div>

      {/* YTD Summary */}
      <div className="mx-4 mb-3 rounded-lg p-3" style={{ background: 'hsla(0,0%,100%,0.12)' }}>
        <p className="text-[10px] uppercase tracking-wider opacity-70 mb-1">Ano 2024 (YTD)</p>
        <p className="text-2xl font-bold">{kpisYTD.total.toLocaleString('pt-BR')}</p>
        <p className="text-[10px] opacity-70 mb-2">Total de Reclamações</p>
        <div className="flex items-center gap-2 text-[10px]">
          <div className="flex-1">
            <div className="flex justify-between mb-0.5">
              <span>Resolvidas</span>
              <span>{kpisYTD.taxaResolucao.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'hsla(0,0%,100%,0.2)' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${kpisYTD.taxaResolucao}%`, background: 'hsl(152, 60%, 55%)' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Bar Chart */}
      <div className="mx-4 mb-3">
        <p className="text-[10px] uppercase tracking-wider opacity-70 mb-2">Reclamações por Mês</p>
        <ResponsiveContainer width="100%" height={110}>
          <BarChart data={porMes} barSize={14}>
            <XAxis dataKey="mes" tick={{ fontSize: 8, fill: 'hsla(0,0%,100%,0.6)' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: 'hsl(340,75%,45%)', border: 'none', borderRadius: 8, fontSize: 11, color: '#fff' }}
              formatter={(v: number) => [v.toLocaleString('pt-BR'), '']}
            />
            <Bar dataKey="resolvidas" stackId="a" fill="hsl(152, 60%, 55%)" radius={[0, 0, 0, 0]} />
            <Bar dataKey="naoResolvidas" stackId="a" fill="hsla(0,0%,100%,0.35)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* KPI Row */}
      <div className="mx-4 mb-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg p-2.5" style={{ background: 'hsla(0,0%,100%,0.12)' }}>
          <TrendingUp className="h-3.5 w-3.5 mb-1 opacity-70" />
          <p className="text-lg font-bold">{kpis.taxaResolucao.toFixed(1)}%</p>
          <p className="text-[9px] opacity-70">Taxa de Resolução</p>
        </div>
        <div className="rounded-lg p-2.5" style={{ background: 'hsla(0,0%,100%,0.12)' }}>
          <DollarSign className="h-3.5 w-3.5 mb-1 opacity-70" />
          <p className="text-lg font-bold">{kpis.taxaReembolso.toFixed(1)}%</p>
          <p className="text-[9px] opacity-70">Taxa de Reembolso</p>
        </div>
        <div className="rounded-lg p-2.5" style={{ background: 'hsla(0,0%,100%,0.12)' }}>
          <Clock className="h-3.5 w-3.5 mb-1 opacity-70" />
          <p className="text-lg font-bold">{kpis.tempoMedioResolucao.toFixed(0)}d</p>
          <p className="text-[9px] opacity-70">Tempo Médio Resolução</p>
        </div>
        <div className="rounded-lg p-2.5" style={{ background: 'hsla(0,0%,100%,0.12)' }}>
          <DollarSign className="h-3.5 w-3.5 mb-1 opacity-70" />
          <p className="text-lg font-bold">R${(kpis.valorMedio).toFixed(0)}</p>
          <p className="text-[9px] opacity-70">Valor Médio</p>
        </div>
      </div>

      {/* Canal Distribution */}
      <div className="mx-4 mb-3">
        <p className="text-[10px] uppercase tracking-wider opacity-70 mb-2">Reclamações por Canal</p>
        <div className="space-y-1.5">
          {porCanal.map((c, i) => (
            <div key={c.canal} className="flex items-center gap-2 text-[10px]">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: canalColors[i] || canalColors[0] }} />
              <span className="flex-1 truncate">{c.canal}</span>
              <span className="font-medium">{c.count.toLocaleString('pt-BR')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bubble Chart: Estado x Resolução */}
      <div className="mx-4 mb-4 flex-1">
        <p className="text-[10px] uppercase tracking-wider opacity-70 mb-2">Top Estados: Volume vs Resolução</p>
        <ResponsiveContainer width="100%" height={160}>
          <ScatterChart margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <XAxis
              dataKey="resolucao"
              name="Resolução %"
              tick={{ fontSize: 8, fill: 'hsla(0,0%,100%,0.6)' }}
              axisLine={false}
              tickLine={false}
              domain={[75, 95]}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              dataKey="total"
              name="Volume"
              tick={{ fontSize: 8, fill: 'hsla(0,0%,100%,0.6)' }}
              axisLine={false}
              tickLine={false}
              width={35}
            />
            <ZAxis dataKey="total" range={[40, 400]} />
            <Tooltip
              contentStyle={{ background: 'hsl(340,75%,45%)', border: 'none', borderRadius: 8, fontSize: 11, color: '#fff' }}
              formatter={(v: number, name: string) => {
                if (name === 'Resolução %') return [`${v.toFixed(1)}%`, name];
                return [v.toLocaleString('pt-BR'), name];
              }}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.estado || ''}
            />
            <Scatter data={porEstado}>
              {porEstado.map((_, i) => (
                <Cell key={i} fill={`hsla(0,0%,100%,${0.3 + (i < 3 ? 0.5 : 0.2)})`} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </aside>
  );
}
