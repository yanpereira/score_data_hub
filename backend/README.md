# Backend - Supabase Infrastructure

Este módulo gerencia a infraestrutura de dados do Score Data Hub.

## 💾 Banco de Dados (PostgreSQL)

O banco de dados é hospedado no Supabase e utiliza o schema `score` para separar os dados do Data Hub.

### Tabelas Principais:
- `fluxo_caixa`: Tabela central de movimentações (upsert via ETL).
- `plano_contas`: Hierarquia de categorias financeiras.
- `formas_pagamento`: Métodos de pagamento suportados.
- `movimentacao_financeira`: View consolidada para consumo do Frontend.

## 🛠️ Gerenciamento (CLI)

O projeto utiliza o Supabase CLI para gerenciamento local e deploys.

### Comandos Comuns:
1. Iniciar localmente:
```bash
supabase start
```

2. Aplicar migrações:
```bash
supabase db push
```

3. Gerar tipos TypeScript:
```bash
supabase gen types typescript --local > ../frontend/finance-hub/src/integrations/supabase/types.ts
```

## 🔒 Segurança

- O acesso aos dados é protegido por chaves de API e políticas de RLS (Row Level Security).
- O ETL utiliza a `SERVICE_ROLE_KEY` para operações de escrita (UPSERT).
- O Frontend utiliza a `ANON_KEY` para leitura, garantindo acesso seguro via cliente Supabase.
