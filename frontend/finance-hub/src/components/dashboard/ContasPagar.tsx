import { useMemo, useState } from "react";
import type { DateField, MovimentacaoFinanceira } from "@/hooks/useFinanceData";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatBRL } from "@/lib/finance-utils";

function normalizeText(v: string) {
  return v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function isSaida(tipo: unknown) {
  const t = normalizeText(String(tipo ?? ""));
  return t.includes("saida");
}

export function ContasPagar({ data, dateField }: { data: MovimentacaoFinanceira[]; dateField: DateField }) {
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = normalizeText(query);
    return data
      .filter((d) => isSaida(d.tipo_movimento))
      .filter((d) => (q ? normalizeText(String(d.categoria_lancamento ?? "")).includes(q) : true))
      .map((d) => {
        const raw = (d[dateField] as string | null) ?? d.data_pagamento;
        return {
          date: raw ? raw.slice(0, 10) : "",
          categoria: String(d.categoria_lancamento ?? ""),
          grupo: String(d.dfc_grupo ?? ""),
          valor: Number(d.valor_liquido ?? 0),
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [data, dateField, query]);

  const total = useMemo(() => rows.reduce((s, r) => s + Math.abs(r.valor), 0), [rows]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4 border-0 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <p className="text-[11px] text-muted-foreground mb-1">Total a pagar (período)</p>
          <p className="text-xl font-bold text-foreground tabular-nums">{formatBRL(total)}</p>
        </Card>
        <Card className="p-4 border-0 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <p className="text-[11px] text-muted-foreground mb-1">Lançamentos</p>
          <p className="text-xl font-bold text-foreground tabular-nums">{rows.length}</p>
        </Card>
        <Card className="p-4 border-0 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <p className="text-[11px] text-muted-foreground mb-2">Filtrar por categoria</p>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 text-sm"
            placeholder="Ex: impostos, fornecedores..."
          />
        </Card>
      </div>

      <Card className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
        <div className="p-4 pb-2">
          <h3 className="text-sm font-semibold text-foreground">A Pagar</h3>
          <p className="text-xs text-muted-foreground">Saídas no período selecionado</p>
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
              {rows.length ? (
                rows.map((r, idx) => (
                  <TableRow key={`${r.date}-${idx}`} className={idx % 2 === 0 ? "bg-primary/5" : ""}>
                    <TableCell className="text-xs tabular-nums text-foreground">
                      {r.date ? new Date(r.date).toLocaleDateString("pt-BR") : "-"}
                    </TableCell>
                    <TableCell className="text-xs text-foreground">{r.categoria || "-"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.grupo || "-"}</TableCell>
                    <TableCell className="text-right text-xs tabular-nums font-semibold text-destructive">
                      {formatBRL(Math.abs(r.valor))}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-10">
                    Nenhum lançamento encontrado para o filtro atual.
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
