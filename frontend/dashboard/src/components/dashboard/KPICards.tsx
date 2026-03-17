import { useMemo } from "react";
import { TrendingUp, TrendingDown, CheckCircle, XCircle, DollarSign, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import type { Reclamacao } from "@/data/ecommerce-data";
import { calcularKPIs, agruparPorMes } from "@/data/ecommerce-data";

interface Props {
  dados: Reclamacao[];
  dadosCompletos: Reclamacao[];
}

export default function KPICards({ dados, dadosCompletos }: Props) {
  const kpis = useMemo(() => calcularKPIs(dados), [dados]);
  const sparkData = useMemo(() => agruparPorMes(dadosCompletos), [dadosCompletos]);

  const cards = [
    {
      label: 'Total de Reclamações',
      value: kpis.total.toLocaleString('pt-BR'),
      icon: BarChart3,
      color: 'text-primary',
      bgColor: 'bg-accent',
      showSparkline: true,
    },
    {
      label: 'Resolvidas',
      value: kpis.resolvidas.toLocaleString('pt-BR'),
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      sub: `${kpis.taxaResolucao.toFixed(1)}%`,
    },
    {
      label: 'Não Resolvidas',
      value: kpis.naoResolvidas.toLocaleString('pt-BR'),
      icon: XCircle,
      color: 'text-primary',
      bgColor: 'bg-accent',
      sub: `${(100 - kpis.taxaResolucao).toFixed(1)}%`,
    },
    {
      label: 'Taxa de Reembolso',
      value: `${kpis.taxaReembolso.toFixed(1)}%`,
      icon: DollarSign,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      sub: `${kpis.comReembolso.toLocaleString('pt-BR')} reembolsos`,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {cards.map((c) => (
        <Card key={c.label} className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className={`p-1.5 rounded-lg ${c.bgColor}`}>
                <c.icon className={`h-4 w-4 ${c.color}`} />
              </div>
              {c.showSparkline && (
                <ResponsiveContainer width={60} height={24}>
                  <LineChart data={sparkData}>
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="hsl(340, 75%, 55%)"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
            <p className="text-xl font-bold text-foreground">{c.value}</p>
            <p className="text-[10px] text-muted-foreground">{c.label}</p>
            {c.sub && <p className="text-[10px] font-medium mt-0.5" style={{ color: 'hsl(340, 75%, 55%)' }}>{c.sub}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
