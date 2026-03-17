# Módulo ETL - Score Data Hub

Este módulo é responsável pela ingestão de dados financeiros no Data Hub. Ele extrai informações de sistemas externos (eGestor e Pluggy), realiza a limpeza e transformação, e sincroniza os dados no banco de dados Supabase.

## 📋 Arquitetura de Dados

O pipeline segue as seguintes etapas:
1. **Extração**: Busca dados de recebimentos, pagamentos e plano de contas via API REST.
2. **Transformação**: Processamento com Pandas para garantir tipos de dados corretos e tratamento de nulos.
3. **Carga**: Operações de UPSERT no banco de dados PostgreSQL (schema `score`).

## ⚙️ Configuração

### Arquivos Principais
- `main.py`: Ponto de entrada para sincronização do eGestor.
- `pluggy_sync.py`: Sincronização de contas e transações via Pluggy.
- `extractor.py`: Lógica de consumo de APIs externas.
- `transformer.py`: Lógica de limpeza e formatação de dados.
- `loader.py`: Integração com o cliente Supabase.

### Variáveis de Ambiente (.env)
Você deve criar um arquivo `.env` nesta pasta com as seguintes chaves:
```env
SUPABASE_URL=seu_url_supabase
SUPABASE_KEY=sua_chave_service_role
EGESTOR_BASE_URL=https://api.egestor.com.br/api
EGESTOR_CLIENT_ID=seu_client_id
EGESTOR_CLIENT_SECRET=seu_client_secret
PLUGGY_CLIENT_ID=seu_pluggy_id
PLUGGY_CLIENT_SECRET=seu_pluggy_secret
```

## 🚀 Como Executar

1. Instale as dependências:
```bash
pip install -r requirements.txt
```

2. Execute o pipeline principal:
```bash
python main.py
```

3. (Opcional) Execute a sincronização bancária:
```bash
python pluggy_sync.py
```
