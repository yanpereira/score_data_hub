import os
import time
import json
import requests
from dotenv import load_dotenv
from auth_manager import get_valid_token

load_dotenv()
BASE_URL = os.getenv("EGESTOR_BASE_URL")

def extrair_financeiro(endpoint, dt_ini, dt_fim):
    """Extrai os dados brutos com TODOS os campos disponíveis na API."""
    url = f"{BASE_URL}/v1/{endpoint}"
    
    # Adicionamos o 'fields' com todas as colunas mapeadas por você
    campos_completos = "codigo,numDoc,descricao,valor,taxa,data,dtVenc,dtPgto,dtCad,dtComp,situacao,codContato,nomeContato,origem,codDisponivel,codModulo,obs,tags"
    
    params_iniciais = {
        "dtIni": dt_ini,
        "dtFim": dt_fim,
        "dtTipo": "dtVencPgto",
        "fields": campos_completos # << A Mágica acontece aqui!
    }
    
    pagina_atual = 1
    dados_completos = []
    
    print(f"\n🚀 Iniciando extração bruta de '{endpoint}' ({dt_ini} a {dt_fim})...")
    
    while True:
        token = get_valid_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        params = params_iniciais.copy()
        params["page"] = pagina_atual
        
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code == 429:
            print("⏳ Limite de requisições atingido. Pausando por 60 segundos...")
            time.sleep(60)
            continue
            
        response.raise_for_status()
        dados_resposta = response.json()
        
        dados_pagina = dados_resposta.get("data", [])
        
        if not dados_pagina:
            print(f"✅ Fim da paginação no endpoint '{endpoint}'.")
            break
            
        dados_completos.extend(dados_pagina)
        print(f"   📥 Página {pagina_atual} extraída ({len(dados_pagina)} registros brutos).")
        
        if pagina_atual >= dados_resposta.get("last_page", 1):
             break
             
        pagina_atual += 1
        time.sleep(1.1)
        
    return dados_completos