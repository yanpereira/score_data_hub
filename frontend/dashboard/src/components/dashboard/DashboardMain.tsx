import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { Reclamacao } from "@/data/ecommerce-data";
import { agruparPorCategoria, agruparPorLoja } from "@/data/ecommerce-data";
import DashboardFilters from "./DashboardFilters";
import KPICards from "./KPICards";
import ComplaintPanel from "./ComplaintPanel";

interface Props {
  dados: Reclamacao[];
  dadosCompletos: Reclamacao[];
  mes: number;
  estado: string;
  categoria: string;
  onMesChange: (v: number) => void;
  onEstadoChange: (v: string) => void;
  onCategoriaChange: (v: string) => void;
}

export default function DashboardMain({
  dados, dadosCompletos, mes, estado, categoria,
  onMesChange, onEstadoChange, onCategoriaChange
}: Props) {
  const topCategorias = useMemo(() => agruparPorCategoria(dados).slice(0, 10), [dados]);
  const topLojas = useMemo(() => agruparPorLoja(dados).slice(0, 8), [dados]);

  const barColors = [
    'hsl(340, 75%, 55%)', 'hsl(340, 65%, 60%)', 'hsl(340, 55%, 65%)',
    'hsl(340, 45%, 70%)', 'hsl(340, 35%, 75%)', 'hsl(340, 30%, 78%)',
    'hsl(340, 25%, 80%)', 'hsl(340, 20%, 83%)', 'hsl(340, 15%, 85%)',
    'hsl(340, 10%, 87%)',
  ];

  return (
    <main className="flex-1 min-h-screen overflow-y-auto p-5 space-y-4">
      {/* Filters */}
      <DashboardFilters
        mes={mes}
        estado={estado}
        categoria={categoria}
        onMesChange={onMesChange}
        onEstadoChange={onEstadoChange}
        onCategoriaChange={onCategoriaChange}
      />

      {/* KPI Cards */}
      <KPICards dados={dados} dadosCompletos={dadosCompletos} />

      {/* Complaint Panels */}
      <div className="flex gap-3">
        <ComplaintPanel dados={dados} tipo="resolvidas" />
        <ComplaintPanel dados={dados} tipo="naoResolvidas" />
      </div>

      {/* Bottom Charts */}
      <div className="grid grid-cols-2 gap-3">
        {/* Top Categorias */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Top Categorias de Produto
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topCategorias} layout="vertical" margin={{ left: 0, right: 10 }}>
                <XAxis type="number" hide />
                <YAxis
                  dataKey="categoria"
                  type="category"
                  width={120}
                  tick={{ fontSize: 9, fill: 'hsl(220, 10%, 46%)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid hsl(220,14%,89%)', borderRadius: 8, fontSize: 11 }}
                  formatter={(v: number) => [v.toLocaleString('pt-BR'), 'Reclamações']}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={14}>
                  {topCategorias.map((_, i) => (
                    <Cell key={i} fill={barColors[i] || barColors[0]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Lojas */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Top Lojas — Volume e Resolução
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-2">
              {topLojas.map((l, i) => (
                <div key={l.loja} className="flex items-center gap-2 text-[11px]">
                  <span className="w-24 truncate font-medium">{l.loja}</span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(l.total / topLojas[0].total) * 100}%`,
                        background: barColors[i] || barColors[0],
                      }}
                    />
                  </div>
                  <span className="w-10 text-right font-medium">{l.total.toLocaleString('pt-BR')}</span>
                  <span className="w-12 text-right text-muted-foreground">{l.resolucao.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
