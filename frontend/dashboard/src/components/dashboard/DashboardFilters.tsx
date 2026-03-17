import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MESES, ESTADOS, CATEGORIAS } from "@/data/ecommerce-data";
import { Filter } from "lucide-react";

interface Props {
  mes: number;
  estado: string;
  categoria: string;
  onMesChange: (v: number) => void;
  onEstadoChange: (v: string) => void;
  onCategoriaChange: (v: string) => void;
}

export default function DashboardFilters({ mes, estado, categoria, onMesChange, onEstadoChange, onCategoriaChange }: Props) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wider">Filtros</span>
      </div>

      <Select value={String(mes)} onValueChange={(v) => onMesChange(Number(v))}>
        <SelectTrigger className="w-[160px] h-8 text-xs bg-card">
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="-1">Todos os meses</SelectItem>
          {MESES.map((m, i) => (
            <SelectItem key={i} value={String(i)}>{m} 2024</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={estado} onValueChange={onEstadoChange}>
        <SelectTrigger className="w-[140px] h-8 text-xs bg-card">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Todos">Todos os estados</SelectItem>
          {ESTADOS.map((e) => (
            <SelectItem key={e} value={e}>{e}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={categoria} onValueChange={onCategoriaChange}>
        <SelectTrigger className="w-[180px] h-8 text-xs bg-card">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Todas">Todas as categorias</SelectItem>
          {CATEGORIAS.map((c) => (
            <SelectItem key={c} value={c}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
