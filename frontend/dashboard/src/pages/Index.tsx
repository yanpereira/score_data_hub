import { useState, useMemo } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardMain from "@/components/dashboard/DashboardMain";
import { RECLAMACOES, filtrarReclamacoes } from "@/data/ecommerce-data";

const Index = () => {
  const [mes, setMes] = useState(-1);
  const [estado, setEstado] = useState("Todos");
  const [categoria, setCategoria] = useState("Todas");

  const dadosFiltrados = useMemo(
    () => filtrarReclamacoes(RECLAMACOES, { mes, estado, categoria }),
    [mes, estado, categoria]
  );

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar dados={dadosFiltrados} dadosCompletos={RECLAMACOES} />
      <DashboardMain
        dados={dadosFiltrados}
        dadosCompletos={RECLAMACOES}
        mes={mes}
        estado={estado}
        categoria={categoria}
        onMesChange={setMes}
        onEstadoChange={setEstado}
        onCategoriaChange={setCategoria}
      />
    </div>
  );
};

export default Index;
