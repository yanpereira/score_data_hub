-- Adiciona coluna "tipo" na tabela orcamento_previsto para diferenciar DRE (competência) e DFC (caixa)

-- 1. Adiciona a coluna com default 'dre' (retrocompatível com os dados existentes)
alter table public.orcamento_previsto
  add column if not exists tipo text not null default 'dre'
  check (tipo in ('dre', 'dfc'));

-- 2. Remove a constraint antiga e recria incluindo "tipo"
alter table public.orcamento_previsto
  drop constraint if exists orcamento_previsto_unique;

alter table public.orcamento_previsto
  add constraint orcamento_previsto_unique
  unique (ano, mes, tipo, dfc_mascara, categoria_macro, categoria_lancamento);

-- 3. Índice auxiliar por tipo
create index if not exists idx_orcamento_previsto_tipo
  on public.orcamento_previsto (tipo, ano, mes);
