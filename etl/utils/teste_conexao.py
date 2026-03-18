import requests

# O token JWT que você gerou
PERSONAL_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHAiOiIyNzEzZWVmYThmMGNiMTRhNDQyMjU5ODRlNGRkYzVmOCIsInN1YmRvbWluaW8iOiJzY29yZWNvbnN1bHRvcmlhIiwiY2xpZW50IjoiNjc3ODg2YzE0N2RlZGI1Yjc5MjYzZmNhNTNkMzM1ZjUzZDVhNGY3MyIsImNyZWF0ZWQiOjE3NzMxNDg3NjR9.I44JBjvxCfNd0wI4PcoYVheTU3TsPqhgR7SFMZuCcxk="
BASE_URL = "https://api.egestor.com.br/api"

def testar_conexao_egestor():
    print("Iniciando teste de conexão com a API do eGestor...")
    url = f"{BASE_URL}/oauth/access_token"
    
    payload = {
        "grant_type": "personal",
        "personal_token": PERSONAL_TOKEN
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        # Dispara a requisição POST para trocar o personal_token pelo access_token
        response = requests.post(url, json=payload, headers=headers)
        
        # Verifica se houve algum erro HTTP (ex: 401 Não Autorizado)
        response.raise_for_status()
        
        # Converte a resposta para JSON
        dados = response.json()
        access_token = dados.get("access_token")
        
        print("\n✅ Conexão bem-sucedida!")
        print(f"Status Code: {response.status_code}")
        # Exibe apenas o começo do token para confirmar que chegou, mantendo a segurança no console
        print(f"Access Token retornado: {access_token[:20]}... [OCULTADO]")
        print(f"Expira em: {dados.get('expires_in')} segundos")
        
        return access_token
        
    except requests.exceptions.HTTPError as err:
        print(f"\n❌ Falha na autenticação. Erro HTTP: {err}")
        print(f"Detalhes do erro: {response.text}")
    except Exception as e:
        print(f"\n❌ Ocorreu um erro inesperado: {e}")

if __name__ == "__main__":
    # Roda o teste
    token_temporario = testar_conexao_egestor()