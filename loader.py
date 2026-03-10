import os
from supabase import create_client, Client, ClientOptions
from dotenv import load_dotenv

load_dotenv()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
opcoes = ClientOptions(schema="score")
supabase: Client = create_client(url, key, options=opcoes)

def limpar_vazios(dados_lista):
    """Converte strings vazias da API ('') em None (Null no banco) para evitar erros."""
    for item in dados_lista:
        for k, v in item.items():
            if v == "":
                item[k] = None
    return dados_lista

def carregar_dados_puros(recebimentos_raw, pagamentos_raw):
    print("\n☁️ Iniciando carga PURA para o Supabase (Schema: score)...")
    
    # Limpa strings vazias que a API envia
    recebimentos_limpos = limpar_vazios(recebimentos_raw)
    pagamentos_limpos = limpar_vazios(pagamentos_raw)
    
    if recebimentos_limpos:
        try:
            print(f"Enviando {len(recebimentos_limpos)} Recebimentos...")
            supabase.table('recebimentos').upsert(recebimentos_limpos).execute()
            print("✅ Recebimentos salvos com sucesso!")
        except Exception as e:
            print(f"❌ Erro ao salvar Recebimentos: {e}")

    if pagamentos_limpos:
        try:
            print(f"Enviando {len(pagamentos_limpos)} Pagamentos...")
            supabase.table('pagamentos').upsert(pagamentos_limpos).execute()
            print("✅ Pagamentos salvos com sucesso!")
        except Exception as e:
            print(f"❌ Erro ao salvar Pagamentos: {e}")