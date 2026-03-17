// ==========================================
// Dados Fictícios - Reclamações E-commerce BR
// ==========================================

export const ESTADOS = [
  'SP', 'RJ', 'MG', 'RS', 'PR', 'BA', 'SC', 'PE', 'CE', 'GO',
  'DF', 'PA', 'MA', 'MT', 'MS', 'ES', 'PB', 'RN', 'AL', 'PI',
  'SE', 'RO', 'TO', 'AM', 'AC', 'AP', 'RR'
] as const;

export const REGIOES: Record<string, string[]> = {
  'Sudeste': ['SP', 'RJ', 'MG', 'ES'],
  'Sul': ['RS', 'PR', 'SC'],
  'Nordeste': ['BA', 'PE', 'CE', 'MA', 'PB', 'RN', 'AL', 'PI', 'SE'],
  'Centro-Oeste': ['GO', 'DF', 'MT', 'MS'],
  'Norte': ['PA', 'AM', 'RO', 'TO', 'AC', 'AP', 'RR'],
};

export const MESES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
] as const;

export const CATEGORIAS = [
  'Eletrônicos', 'Moda Feminina', 'Moda Masculina', 'Casa e Decoração',
  'Beleza e Perfumaria', 'Esporte e Lazer', 'Informática', 'Celulares',
  'Eletrodomésticos', 'Brinquedos', 'Livros', 'Automotivo',
  'Saúde e Bem-estar', 'Alimentos e Bebidas', 'Pet Shop'
] as const;

export const MOTIVOS = [
  'Atraso na entrega',
  'Produto com defeito',
  'Produto diferente do anunciado',
  'Cobrança indevida',
  'Dificuldade de reembolso',
  'Atendimento insatisfatório',
  'Produto não recebido',
  'Cancelamento não processado',
] as const;

export const CANAIS = [
  'Site', 'App', 'SAC Telefone', 'Redes Sociais', 'Reclame Aqui'
] as const;

export const LOJAS = [
  'MegaShop', 'SuperStore BR', 'FastBuy', 'LojaTop', 'CompraFácil',
  'BrasilMart', 'ShopNow', 'OfertaMax', 'TudoAqui', 'ExpressCompras'
] as const;

export type Reclamacao = {
  id: string;
  protocolo: string;
  mes: number; // 0-11
  estado: string;
  categoria: string;
  motivo: string;
  canal: string;
  loja: string;
  resolvida: boolean;
  reembolso: boolean;
  diasAberto: number;
  valor: number;
  data: string;
};

// Seed-based pseudo-random for consistency
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateReclamacoes(): Reclamacao[] {
  const rand = seededRandom(42);
  const reclamacoes: Reclamacao[] = [];

  // Weight distribution by state (population-proportional)
  const estadoPesos: Record<string, number> = {
    'SP': 22, 'RJ': 10, 'MG': 10, 'RS': 6, 'PR': 6, 'BA': 5, 'SC': 4, 'PE': 4,
    'CE': 4, 'GO': 3, 'DF': 3, 'PA': 3, 'MA': 2, 'MT': 2, 'MS': 2, 'ES': 2,
    'PB': 2, 'RN': 1.5, 'AL': 1.5, 'PI': 1, 'SE': 1, 'RO': 1, 'TO': 0.8,
    'AM': 1.5, 'AC': 0.5, 'AP': 0.3, 'RR': 0.3,
  };

  // Monthly volume variation (seasonal: more in Nov/Dec due to Black Friday/Natal)
  const mesVolume = [1400, 1300, 1350, 1400, 1500, 1450, 1550, 1600, 1650, 1700, 2100, 2242];

  // Resolution rate varies by month (improving over year)
  const mesResolucao = [0.82, 0.83, 0.84, 0.84, 0.85, 0.86, 0.86, 0.87, 0.87, 0.88, 0.88, 0.89];

  const totalPeso = Object.values(estadoPesos).reduce((a, b) => a + b, 0);

  let idCounter = 1;

  for (let mes = 0; mes < 12; mes++) {
    const volume = mesVolume[mes];
    const taxaResolucao = mesResolucao[mes];

    for (let i = 0; i < volume; i++) {
      // Pick state weighted
      let r = rand() * totalPeso;
      let estado = 'SP';
      for (const [est, peso] of Object.entries(estadoPesos)) {
        r -= peso;
        if (r <= 0) { estado = est; break; }
      }

      const categoria = CATEGORIAS[Math.floor(rand() * CATEGORIAS.length)];

      // Motivo weights: atraso is most common
      const motivoPesos = [30, 18, 15, 12, 8, 7, 6, 4];
      let mr = rand() * 100;
      let motivoIdx = 0;
      for (let m = 0; m < motivoPesos.length; m++) {
        mr -= motivoPesos[m];
        if (mr <= 0) { motivoIdx = m; break; }
      }
      const motivo = MOTIVOS[motivoIdx];

      // Canal weights
      const canalPesos = [15, 25, 20, 15, 25];
      let cr = rand() * 100;
      let canalIdx = 0;
      for (let c = 0; c < canalPesos.length; c++) {
        cr -= canalPesos[c];
        if (cr <= 0) { canalIdx = c; break; }
      }
      const canal = CANAIS[canalIdx];

      const loja = LOJAS[Math.floor(rand() * LOJAS.length)];
      const resolvida = rand() < taxaResolucao;
      const reembolso = resolvida ? rand() < 0.48 : rand() < 0.05;
      const diasAberto = resolvida
        ? Math.floor(rand() * 15) + 1
        : Math.floor(rand() * 60) + 10;
      const valor = Math.floor(rand() * 4500) + 50;
      const dia = Math.floor(rand() * 28) + 1;
      const data = `2024-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

      reclamacoes.push({
        id: `REC-${String(idCounter).padStart(6, '0')}`,
        protocolo: `${String(202400000 + idCounter)}`,
        mes,
        estado,
        categoria,
        motivo,
        canal,
        loja,
        resolvida,
        reembolso,
        diasAberto,
        valor,
        data,
      });

      idCounter++;
    }
  }

  return reclamacoes;
}

export const RECLAMACOES = generateReclamacoes();

// Helper functions for filtering and aggregation
export function filtrarReclamacoes(
  dados: Reclamacao[],
  filtros: { mes?: number; estado?: string; categoria?: string }
): Reclamacao[] {
  return dados.filter(r => {
    if (filtros.mes !== undefined && filtros.mes !== -1 && r.mes !== filtros.mes) return false;
    if (filtros.estado && filtros.estado !== 'Todos' && r.estado !== filtros.estado) return false;
    if (filtros.categoria && filtros.categoria !== 'Todas' && r.categoria !== filtros.categoria) return false;
    return true;
  });
}

export function calcularKPIs(dados: Reclamacao[]) {
  const total = dados.length;
  const resolvidas = dados.filter(r => r.resolvida).length;
  const naoResolvidas = total - resolvidas;
  const taxaResolucao = total > 0 ? (resolvidas / total) * 100 : 0;
  const comReembolso = dados.filter(r => r.reembolso).length;
  const taxaReembolso = total > 0 ? (comReembolso / total) * 100 : 0;
  const valorMedio = total > 0 ? dados.reduce((s, r) => s + r.valor, 0) / total : 0;
  const tempoMedioResolucao = resolvidas > 0
    ? dados.filter(r => r.resolvida).reduce((s, r) => s + r.diasAberto, 0) / resolvidas
    : 0;

  return { total, resolvidas, naoResolvidas, taxaResolucao, taxaReembolso, comReembolso, valorMedio, tempoMedioResolucao };
}

export function agruparPorMes(dados: Reclamacao[]) {
  const result = MESES.map((nome, i) => {
    const mesD = dados.filter(r => r.mes === i);
    const resolvidas = mesD.filter(r => r.resolvida).length;
    return { mes: nome, total: mesD.length, resolvidas, naoResolvidas: mesD.length - resolvidas };
  });
  return result;
}

export function agruparPorMotivo(dados: Reclamacao[]) {
  const map: Record<string, number> = {};
  dados.forEach(r => { map[r.motivo] = (map[r.motivo] || 0) + 1; });
  return Object.entries(map)
    .map(([motivo, count]) => ({ motivo, count }))
    .sort((a, b) => b.count - a.count);
}

export function agruparPorCanal(dados: Reclamacao[]) {
  const map: Record<string, number> = {};
  dados.forEach(r => { map[r.canal] = (map[r.canal] || 0) + 1; });
  return Object.entries(map)
    .map(([canal, count]) => ({ canal, count }))
    .sort((a, b) => b.count - a.count);
}

export function agruparPorEstado(dados: Reclamacao[]) {
  const map: Record<string, { total: number; resolvidas: number }> = {};
  dados.forEach(r => {
    if (!map[r.estado]) map[r.estado] = { total: 0, resolvidas: 0 };
    map[r.estado].total++;
    if (r.resolvida) map[r.estado].resolvidas++;
  });
  return Object.entries(map)
    .map(([estado, d]) => ({
      estado,
      total: d.total,
      resolucao: d.total > 0 ? (d.resolvidas / d.total) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

export function agruparPorCategoria(dados: Reclamacao[]) {
  const map: Record<string, number> = {};
  dados.forEach(r => { map[r.categoria] = (map[r.categoria] || 0) + 1; });
  return Object.entries(map)
    .map(([categoria, count]) => ({ categoria, count }))
    .sort((a, b) => b.count - a.count);
}

export function agruparPorLoja(dados: Reclamacao[]) {
  const map: Record<string, { total: number; resolvidas: number }> = {};
  dados.forEach(r => {
    if (!map[r.loja]) map[r.loja] = { total: 0, resolvidas: 0 };
    map[r.loja].total++;
    if (r.resolvida) map[r.loja].resolvidas++;
  });
  return Object.entries(map)
    .map(([loja, d]) => ({
      loja,
      total: d.total,
      resolucao: d.total > 0 ? (d.resolvidas / d.total) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}
