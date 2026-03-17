from extractor import extrair_financeiro, extrair_plano_contas, extrair_formas_pagamento
from loader import carregar_dados

def iniciar_sincronizacao():
    print("=== INICIANDO PIPELINE DATA HUB ===")
    
    # 1. Atualiza Tabelas de Apoio primeiro
    carregar_dados("plano_contas", extrair_plano_contas())
    carregar_dados("formas_pagamento", extrair_formas_pagamento())
    
    # 2. Atualiza o Financeiro (Ajuste o período se precisar)
    data_ini = "2023-01-01"
    data_fim = "2026-12-31" 
    
    recebimentos = extrair_financeiro("recebimentos", data_ini, data_fim)
    carregar_dados("recebimentos", recebimentos)
    
    pagamentos = extrair_financeiro("pagamentos", data_ini, data_fim)
    carregar_dados("pagamentos", pagamentos)
    
    print("\n🏁 Pipeline finalizado com sucesso!")

if __name__ == "__main__":
    iniciar_sincronizacao()