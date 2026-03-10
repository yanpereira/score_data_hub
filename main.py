from extractor import extrair_financeiro
from loader import carregar_dados_puros # Atualize o nome do import

def rodar_pipeline():
    print("Iniciando o Pipeline ELT - eGestor para Supabase (Dados Puros)")
    
    data_ini = "2026-01-01"
    data_fim = "2026-12-31"
    
    # 1. Extract (Agora com o parâmetro 'fields' trazendo tudo)
    recebimentos_raw = extrair_financeiro("recebimentos", data_ini, data_fim)
    pagamentos_raw = extrair_financeiro("pagamentos", data_ini, data_fim)
    
    # 2. Load (Joga nas tabelas separadas exatamente como a API mandou)
    carregar_dados_puros(recebimentos_raw, pagamentos_raw)
    
    print("\n🏁 Pipeline ELT finalizado com sucesso!")

if __name__ == "__main__":
    rodar_pipeline()