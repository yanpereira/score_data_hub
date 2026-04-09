import { useMemo, useState } from "react";
import type { DateField, MovimentacaoFinanceira } from "@/hooks/useFinanceData";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatBRL } from "@/lib/finance-utils";
import { cn } from "@/lib/utils";

function normalizeText(v: string) {
  return v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function isSaida(tipo: unknown) {
  return normalizeText(String(tipo ?? "")).includes("saida");
}

type ViewMode = "pendentes" | "pagos";

export function ContasPagar({ data, dateField }: { data: MovimentacaoFinanceira[]; dateField: DateField }) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewMode>("pendentes");

  const { pendentes, pagos } = useMemo(() => {
    const saidas = data.filter((d) => isSaida(d.tipo_movimento));
    return {
      pendentes: saidas.filter((d) => !String(d.data_pagamento ?? "").trim()),
      pagos: saidas.filter((d) => !!String(d.data_pagamento ?? "").trim()),
    };
  }, [data]);

  const totalPendente = useMemo(() => pendentes.reduce((s, d) => s + Math.abs(d.valor_liquido ?? 0), 0), [pendentes]);
  const totalPago = useMemo(() => pagos.reduce((s, d) => s + Math.abs(d.valor_liquido ?? 0), 0), [pagos]);
  const totalGeral = totalPendente + totalPago;
  const pctPago = totalGeral > 0 ? (totalPago / totalGeral) * 100 : 0;

  const activeRows = useMemo(() => {
    const source = view === "pendentes" ? pendentes : pagos;
    const q = normalizeText(query);
    return source
      .filter((d) => (q ? normalizeText(String(d.categoria_lancamento ?? "")).includes(q) : true))
      .map((d) => ({
        date: ((view === "pendentes" ? d[dateField] : d.data_pagamento) as string | null)?.slice(0, 10) ?? "",
        categoria: String(d.categoria_lancamento ?? ""),
        grupo: String(d.dfc_grupo ?? ""),
        valor: Math.abs(Number(d.valor_liquido ?? 0)),
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [view, pendentes, pagos, query, dateField]);

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 border-0 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <p className="text-[11px] text-muted-foreground mb-1">A Pagar (pendente)</p>
          <p className="text-xl font-bold text-amber-500 tabular-nums">{formatBRL(totalPendente)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{pendentes.length} lançamentos</p>
        </Card>
        <Card className="p-4 border-0 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <p className="text-[11px] text-muted-foreground mb-1">Pago (realizado)</p>
          <p className="text-xl font-bold text-red-500 tabular-nums">{formatBRL(totalPago)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{pagos.length} lançamentos</p>
        </Card>
        <Card className="p-4 border-0 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <p className="text-[11px] text-muted-foreground mb-1">Total previsto</p>
          <p className="text-xl font-bold text-foreground tabular-nums">{formatBRL(totalGeral)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{pendentes.length + pagos.length} lançamentos</p>
        </Card>
        <Card className="p-4 border-0 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <p className="text-[11px] text-muted-foreground mb-1">% Pago</p>
          <p className="text-xl font-bold text-foreground tabular-nums">{pctPago.toFixed(1)}%</p>
          <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full transition-all"
              style={{ width: `${pctPago}%` }}
            />
          </div>
        </Card>
      </div>

      {/* Tabela */}
      <Card className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
        <div className="p-4 pb-2 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {view === "pendentes" ? "A Pagar — Pendentes" : "Pagos — Realizados"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {view === "pendentes" ? "Saídas ainda sem baixa no período" : "Saídas já pagas no período"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-8 text-xs w-[180px]"
              placeholder="Filtrar por categoria..."
            />
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setView("pendentes")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  view === "pendentes"
                    ? "bg-amber-500 text-white"
                    : "bg-card text-muted-foreground hover:bg-muted"
                )}
              >
                Pendentes ({pendentes.length})
              </button>
              <button
                onClick={() => setView("pagos")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors border-l border-border",
                  view === "pagos"
                    ? "bg-red-500 text-white"
                    : "bg-card text-muted-foreground hover:bg-muted"
                )}
              >
                Pagos ({pagos.length})
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-auto max-h-[600px]">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary">
                <TableHead className="text-[11px] font-bold text-primary-foreground">DATA</TableHead>
                <TableHead className="text-[11px] font-bold text-primary-foreground">CATEGORIA</TableHead>
                <TableHead className="text-[11px] font-bold text-primary-foreground">GRUPO</TableHead>
                <TableHead className="text-right text-[11px] font-bold text-primary-foreground">VALOR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeRows.length ? (
                activeRows.map((r, idx) => (
                  <TableRow key={`${r.date}-${idx}`} className={idx % 2 === 0 ? "bg-primary/5" : ""}>
                    <TableCell className="text-xs tabular-nums text-foreground">
                      {r.date ? new Date(r.date + "T00:00:00").toLocaleDateString("pt-BR") : "-"}
                    </TableCell>
                    <TableCell className="text-xs text-foreground">{r.categoria || "-"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.grupo || "-"}</TableCell>
                    <TableCell className="text-right text-xs tabular-nums font-semibold text-destructive">
                      {formatBRL(r.valor)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-10">
                    Nenhum lançamento encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
