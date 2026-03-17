import os
import requests
from dotenv import load_dotenv
from supabase import create_client, Client, ClientOptions

load_dotenv()

# Inicializa o Supabase no schema 'score'
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
opcoes = ClientOptions(schema="score")
supabase: Client = create_client(url, key, options=opcoes)

# Credenciais Pluggy
CLIENT_ID = os.getenv("PLUGGY_CLIENT_ID")
CLIENT_SECRET = os.getenv("PLUGGY_CLIENT_SECRET")
BASE_URL = "https://api.pluggy.ai"

def obter_api_key():
    """Gera o token de acesso (API Key) na API do Pluggy"""
    print("🔑 Autenticando no Pluggy...")
    auth_url = f"{BASE_URL}/auth"
    payload = {"clientId": CLIENT_ID, "clientSecret": CLIENT_SECRET}
    headers = {"accept": "application/json", "content-type": "application/json"}
    
    response = requests.post(auth_url, json=payload, headers=headers)
    response.raise_for_status()
    
    return response.json().get("apiKey")

def extrair_e_carregar_pluggy():
    # 1. Pega a chave de API válida
    api_key = obter_api_key()
    headers = {
        "accept": "application/json",
        "X-API-KEY": api_key
    }
    
    print("🚀 Iniciando extração do Pluggy (Open Finance)...")
    
    # 2. Busca todas as conexões bancárias ativas (Items)
    items_response = requests.get(f"{BASE_URL}/items", headers=headers)
    items_response.raise_for_status()
    items = items_response.json().get("results", [])
    
    todas_contas_limpas = []
    todas_transacoes_limpas = []
    
    for item in items:
        item_id = item.get("id")
        connector_name = item.get("connector", {}).get("name", f"ID: {item.get('connectorId')}")
        status = item.get("status", "")
        
        print(f"\n🔍 Lendo conexão: {connector_name} (Status: {status})")
        
        # Se a conexão pedir atualização (token expirado no banco, MFA, etc), pulamos
        if status not in ["UPDATED", "UPDATING"]:
            print(f"   ⚠️ Conexão precisa ser atualizada no app Meu Pluggy. Pulando...")
            continue
            
        # 3. Busca as contas dessa conexão
        contas_response = requests.get(f"{BASE_URL}/accounts?itemId={item_id}", headers=headers)
        contas_response.raise_for_status()
        contas = contas_response.json().get("results", [])
        
        for conta in contas:
            print(f"   🏦 Conta: {conta.get('name')} | Saldo: {conta.get('balance')}")
            
            # Prepara a conta para o Supabase
            conta_dict = {
                "id": conta.get("id"),
                "itemId": conta.get("itemId"),
                "name": conta.get("name"),
                "type": conta.get("type"),
                "subtype": conta.get("subtype"),
                "currency": conta.get("currencyCode"),
                "balance": conta.get("balance"),
                "taxNumber": conta.get("taxNumber"),
                "owner": conta.get("owner")
            }
            todas_contas_limpas.append(conta_dict)
            
            # 4. Busca as transações dessa conta (puxando até 500 por vez)
            conta_id = conta.get("id")
            transacoes_response = requests.get(f"{BASE_URL}/transactions?accountId={conta_id}&limit=500", headers=headers)
            transacoes_response.raise_for_status()
            transacoes_data = transacoes_response.json()
            transacoes = transacoes_data.get("results", [])
            
            print(f"      📥 Extraídas {transacoes_data.get('total', len(transacoes))} transações.")
            
            for tx in transacoes:
                # Prepara transação para o banco
                tx_dict = {
                    "id": tx.get("id"),
                    "accountId": tx.get("accountId"),
                    "amount": tx.get("amount"),
                    "currency": tx.get("currencyCode"),
                    "description": tx.get("description"),
                    "date": str(tx.get("date"))[:10] if tx.get("date") else None,
                    "status": tx.get("status"),
                    "type": tx.get("type"),
                    "categoryId": tx.get("categoryId")
                }
                todas_transacoes_limpas.append(tx_dict)

    # 5. Envia tudo para o Supabase usando UPSERT (Atualiza ou Insere)
    if todas_contas_limpas:
        print("\n☁️ Enviando Contas para o Supabase (Schema: score)...")
        supabase.table('pluggy_contas').upsert(todas_contas_limpas).execute()
        print("✅ Contas sincronizadas com sucesso!")
        
    if todas_transacoes_limpas:
        print(f"☁️ Enviando {len(todas_transacoes_limpas)} Transações para o Supabase...")
        # O Supabase processa upserts grandes tranquilamente
        supabase.table('pluggy_transacoes').upsert(todas_transacoes_limpas).execute()
        print("✅ Transações sincronizadas com sucesso!")

if __name__ == "__main__":
    try:
        extrair_e_carregar_pluggy()
        print("\n🏁 Pipeline do Pluggy finalizado com sucesso!")
    except requests.exceptions.HTTPError as err:
        print(f"\n❌ Erro de HTTP (Pluggy API): {err}")
    except Exception as e:
        print(f"\n❌ Ocorreu um erro inesperado: {e}")