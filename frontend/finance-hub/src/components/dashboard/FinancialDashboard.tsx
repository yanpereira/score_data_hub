import { useState, useMemo, useEffect } from "react";
import { useFinanceData } from "@/hooks/useFinanceData";
import type { MovimentacaoFinanceira, DateField } from "@/hooks/useFinanceData";
import { SidebarNav } from "./SidebarNav";
import { KPICards } from "./KPICards";
import { CategoryCharts } from "./CategoryCharts";
import { MonthlyChart } from "./MonthlyChart";
import { DFCMatrix } from "./DFCMatrix";
import { ExtratoTable } from "./ExtratoTable";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { AlertCircle, Home, BarChart3, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";

function DateRangeFilter({
  startDate, endDate, onStartChange, onEndChange
}: { startDate: string; endDate: string; onStartChange: (v: string) => void; onEndChange: (v: string) => void; }) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="date"
        value={startDate}
        onChange={(e) => onStartChange(e.target.value)}
        className="h-8 text-xs w-[130px] bg-card border-border rounded-lg"
      />
      <span className="text-muted-foreground text-xs">—</span>
      <Input
        type="date"
        value={endDate}
        onChange={(e) => onEndChange(e.target.value)}
        className="h-8 text-xs w-[130px] bg-card border-border rounded-lg"
      />
    </div>
  );
}

function filterByDate(data: MovimentacaoFinanceira[], start: string, end: string, dateField: DateField) {
  if (!start && !end) return data;
  return data.filter((d) => {
    const raw = d[dateField] as string | null;
    if (!raw) return false;
    const date = raw.slice(0, 10);
    if (start && date < start) return false;
    if (end && date > end) return false;
    return true;
  });
}

export function FinancialDashboard() {
  const { data, isLoading, error } = useFinanceData();
  const [activeTab, setActiveTab] = useState("visao-geral");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Determine dateField based on active tab
  const dateField: DateField = activeTab === "dre" ? "data_competencia" : "data_pagamento";

  // Auto-set date range based on active dateField
  useEffect(() => {
    if (data && data.length > 0) {
      const dates = data
        .map((d) => (d[dateField] as string | null)?.slice(0, 10))
        .filter(Boolean)
        .sort() as string[];
      if (dates.length) {
        setStartDate(dates[0]);
        setEndDate(dates[dates.length - 1]);
      }
    }
  }, [data, dateField]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    return filterByDate(data, startDate, endDate, dateField);
  }, [data, startDate, endDate, dateField]);

  return (
    <div className="min-h-screen bg-background flex">
      <SidebarNav activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="ml-14 flex-1">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-base font-extrabold text-primary tracking-tight">Score Data Hub</h1>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Análise Financeira</p>
          </div>
          <div className="flex items-center gap-4">
            <DateRangeFilter
              startDate={startDate}
              endDate={endDate}
              onStartChange={setStartDate}
              onEndChange={setEndDate}
            />
          </div>
        </header>

        <main className="p-6">
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 text-destructive mb-6">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm">Erro ao carregar dados financeiros.</p>
            </div>
          )}

          {isLoading ? (
            <DashboardSkeleton />
          ) : filteredData.length > 0 ? (
            <>
              {activeTab === "home" && (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <Home className="h-10 w-10 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Bem-vindo ao Painel Financeiro</h2>
                  <p className="text-muted-foreground max-w-md">
                    Use a barra lateral para navegar entre as diferentes análises: Visão Geral, DFC, DRE e mais.
                  </p>
                </div>
              )}
              {activeTab === "visao-geral" && (
                <div className="space-y-6">
                  <KPICards data={filteredData} allData={data || []} dateField={dateField} />
                  <div className="grid grid-cols-1 xl:grid-cols-[3fr_2fr] gap-6">
                    <MonthlyChart data={filteredData} dateField={dateField} />
                    <CategoryCharts data={filteredData} />
                  </div>
                </div>
              )}
              {activeTab === "dfc" && (
                <DFCMatrix data={filteredData} dateField="data_pagamento" regime="caixa" />
              )}
              {activeTab === "dre" && (
                <DFCMatrix data={filteredData} dateField="data_competencia" regime="competencia" />
              )}
              {activeTab === "extrato" && (
                <ExtratoTable data={filteredData} dateField={dateField} />
              )}
              {activeTab === "indicadores" && (
                 <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <BarChart3 className="h-10 w-10 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Módulo de Indicadores</h2>
                  <p className="text-muted-foreground max-w-md">
                    Esta seção está em desenvolvimento e em breve trará análises detalhadas de indicadores de performance.
                  </p>
                </div>
              )}
              {activeTab === "admin" && (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <ShieldCheck className="h-10 w-10 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold">Painel Administrativo</h2>
                  <p className="text-muted-foreground max-w-md">
                    Este é um espaço reservado para configurações do sistema e gestão de usuários.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum dado encontrado para o período selecionado.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}