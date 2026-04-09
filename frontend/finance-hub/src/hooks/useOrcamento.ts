import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { externalSupabase } from "@/integrations/supabase/external-client";

export interface OrcamentoRow {
  id?: number;
  ano: number;
  mes: number;
  dfc_mascara: string;
  categoria_macro: string;
  categoria_lancamento: string;
  valor_previsto: number;
}

export type OrcamentoMap = Map<string, number>;

/** Chave única para lookup no mapa: "ano|mes|dfc_mascara|categoria_macro|categoria_lancamento" */
export function orcamentoKey(
  ano: number,
  mes: number,
  dfcMascara: string,
  categoriaMacro: string,
  categoriaLancamento: string
): string {
  return `${ano}|${mes}|${dfcMascara}|${categoriaMacro}|${categoriaLancamento}`;
}

/** Converte mês no formato "jan/2025" para { mes: 1, ano: 2025 } */
export function parseMonthKey(monthKey: string): { mes: number; ano: number } {
  const monthNames = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const [mStr, yStr] = monthKey.split("/");
  return { mes: monthNames.indexOf(mStr) + 1, ano: Number(yStr) };
}

function queryKey(ano: number) {
  return ["orcamento_previsto", ano];
}

export function useOrcamento(ano: number) {
  return useQuery<OrcamentoRow[]>({
    queryKey: queryKey(ano),
    queryFn: async () => {
      const { data, error } = await externalSupabase
        .from("orcamento_previsto")
        .select("*")
        .eq("ano", ano)
        .order("mes");
      if (error) throw error;
      return (data as OrcamentoRow[]) ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

/** Constrói um Map de lookup rápido a partir dos rows */
export function buildOrcamentoMap(rows: OrcamentoRow[]): OrcamentoMap {
  const map = new Map<string, number>();
  rows.forEach((r) => {
    const k = orcamentoKey(r.ano, r.mes, r.dfc_mascara, r.categoria_macro, r.categoria_lancamento);
    map.set(k, r.valor_previsto);
  });
  return map;
}

export function useUpsertOrcamento(ano: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (row: OrcamentoRow) => {
      const { error } = await externalSupabase
        .from("orcamento_previsto")
        .upsert(
          {
            ano: row.ano,
            mes: row.mes,
            dfc_mascara: row.dfc_mascara,
            categoria_macro: row.categoria_macro,
            categoria_lancamento: row.categoria_lancamento,
            valor_previsto: row.valor_previsto,
          },
          { onConflict: "ano,mes,dfc_mascara,categoria_macro,categoria_lancamento" }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey(ano) });
    },
  });
}
