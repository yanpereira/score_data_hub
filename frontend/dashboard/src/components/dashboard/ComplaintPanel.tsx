import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { CheckCircle, XCircle, TrendingUp, TrendingDown } from "lucide-react";
import type { Reclamacao } from "@/data/ecommerce-data";
import { agruparPorMotivo } from "@/data/ecommerce-data";

interface Props {
  dados: Reclamacao[];
  tipo: 'resolvidas' | 'naoResolvidas';
}

export default function ComplaintPanel({ dados, tipo }: Props) {
  const filtrado = useMemo(() =>
    dados.filter(r => tipo === 'resolvidas' ? r.resolvida : !r.resolvida),
    [dados, tipo]
  );

  const motivos = useMemo(() => agruparPorMotivo(filtrado).slice(0, 8), [filtrado]);
  const total = filtrado.length;

  const reembolsoData = useMemo(() => {
    const sim = filtrado.filter(r => r.reembolso).length;
    return [
      { name: 'Com Reembolso', value: sim },
      { name: 'Sem Reembolso', value: total - sim },
    ];
  }, [filtrado, total]);

  const isResolvida = tipo === 'resolvidas';
  const Icon = isResolvida ? CheckCircle : XCircle;
  const accentColor = isResolvida ? 'hsl(152, 60%, 50%)' : 'hsl(340, 75%, 55%)';
  const accentColorLight = isResolvida ? 'hsl(152, 60%, 92%)' : 'hsl(340, 75%, 95%)';
  const pieColors = [isResolvida ? 'hsl(45, 90%, 55%)' : 'hsl(340, 60%, 65%)', 'hsl(220, 14%, 89%)'];

  // Top 5 reclamações detalhadas
  const detalhes = useMemo(() => filtrado.slice(0, 5), [filtrado]);

  const pctTotal = dados.length > 0 ? ((total / dados.length) * 100).toFixed(1) : '0';

  return (
    <Card className="border-0 shadow-sm flex-1 min-w-0">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg" style={{ background: accentColorLight }}>
            <Icon className="h-4 w-4" style={{ color: accentColor }} />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold">
              {isResolvida ? 'RESOLVIDAS' : 'NÃO RESOLVIDAS'}
            </CardTitle>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xl font-bold">{total.toLocaleString('pt-BR')}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: accentColorLight, color: accentColor }}>
                {pctTotal}%
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-4">
        {/* Motivos */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Top Motivos</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={motivos} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis
                dataKey="motivo"
                type="category"
                width={130}
                tick={{ fontSize: 9, fill: 'hsl(220, 10%, 46%)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid hsl(220,14%,89%)', borderRadius: 8, fontSize: 11 }}
                formatter={(v: number) => [v.toLocaleString('pt-BR'), 'Reclamações']}
              />
              <Bar dataKey="count" fill={accentColor} radius={[0, 4, 4, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Reembolso Pie */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Reembolso</p>
            <ResponsiveContainer width="100%" height={80}>
              <PieChart>
                <Pie
                  data={reembolsoData}
                  cx="50%"
                  cy="50%"
                  innerRadius={22}
                  outerRadius={36}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {reembolsoData.map((_, i) => (
                    <Cell key={i} fill={pieColors[i]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid hsl(220,14%,89%)', borderRadius: 8, fontSize: 11 }}
                  formatter={(v: number) => [v.toLocaleString('pt-BR'), '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1 text-[10px]">
            {reembolsoData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: pieColors[i] }} />
                <span className="text-muted-foreground">{d.name}:</span>
                <span className="font-medium">{d.value.toLocaleString('pt-BR')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detalhes de Reclamações */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Reclamações Recentes</p>
          <div className="space-y-1.5">
            {detalhes.map((r) => (
              <div key={r.id} className="flex items-center gap-2 text-[10px] p-1.5 rounded-md bg-muted/50">
                <span className="font-mono text-muted-foreground">{r.protocolo}</span>
                <span className="truncate flex-1 font-medium">{r.motivo}</span>
                <span className="text-muted-foreground">{r.categoria}</span>
                <span className="font-medium whitespace-nowrap">{r.diasAberto}d</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
