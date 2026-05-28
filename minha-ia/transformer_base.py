import math
import random
import sys
import re

# ==========================================
# 1. FUNÇÕES MATEMÁTICAS NUCLEARES
# ==========================================
def softmax(vetor):
    # Transforma qualquer número maluco em porcentagens (0.0 a 1.0)
    max_val = max(vetor) if vetor else 0
    exps = [math.exp(x - max_val) for x in vetor]
    soma = sum(exps)
    return [x / soma for x in exps] if soma > 0 else vetor

def dot_product(v1, v2):
    return sum(x * y for x, y in zip(v1, v2))

def mat_mul(matriz, vetor):
    # Multiplica a matriz de pesos pelo vetor da palavra
    return [dot_product(linha, vetor) for linha in matriz]

# ==========================================
# 2. A ARQUITETURA TRANSFORMER
# ==========================================
class MiniTransformer:
    def __init__(self, vocabulario, d_model=8):
        self.vocab = vocabulario
        self.vocab_size = len(vocabulario)
        self.d_model = d_model # Tamanho do vetor de cada palavra
        
        # Mapeamento: Palavra -> ID e ID -> Palavra
        self.word_to_id = {palavra: i for i, palavra in enumerate(vocabulario)}
        self.id_to_word = {i: palavra for i, palavra in enumerate(vocabulario)}
        
        # --- AS MATRIZES DE PESOS (Onde a IA guarda o "conhecimento") ---
        # Começam com valores aleatórios entre -0.1 e 0.1
        
        # [Camada 1] Embeddings: Transforma o ID em Vetor Numérico
        self.W_embedding = [[random.uniform(-0.1, 0.1) for _ in range(d_model)] for _ in range(self.vocab_size)]
        
        # [Camada 2] Atenção: Matrizes para criar Q (Pergunta), K (Chave), V (Valor)
        self.W_q = [[random.uniform(-0.1, 0.1) for _ in range(d_model)] for _ in range(d_model)]
        self.W_k = [[random.uniform(-0.1, 0.1) for _ in range(d_model)] for _ in range(d_model)]
        self.W_v = [[random.uniform(-0.1, 0.1) for _ in range(d_model)] for _ in range(d_model)]
        
        # [Camada 3] Saída: Transforma o vetor final de volta para o tamanho do vocabulário
        self.W_linear = [[random.uniform(-0.1, 0.1) for _ in range(d_model)] for _ in range(self.vocab_size)]

    def tokenizar(self, texto):
        # Transforma a frase em IDs (ex: "o gato" -> [2, 5])
        palavras = re.findall(r'\b\w+\b', texto.lower())
        return [self.word_to_id[p] for p in palavras if p in self.word_to_id]

    def forward(self, token_ids):
        # ==========================================
        # O "RACIOCÍNIO" (Passe de Ida)
        # ==========================================
        
        # Passo 1: Embeddings (IDs viram Vetores)
        X = [self.W_embedding[tid] for tid in token_ids]
        
        if not X: return None, None
        
        # Passo 2: Self-Attention (Calculando Q, K e V)
        Q = [mat_mul(self.W_q, x) for x in X]
        K = [mat_mul(self.W_k, x) for x in X]
        V = [mat_mul(self.W_v, x) for x in X]
        
        # A IA foca na última palavra da frase para tentar prever a próxima
        q_atual = Q[-1]
        
        scores_atencao = []
        for k in K:
            # Fórmula: (Q * K^T) / sqrt(d_k)
            score = dot_product(q_atual, k) / math.sqrt(self.d_model)
            scores_atencao.append(score)
            
        # Transforma os scores em porcentagem
        pesos_atencao = softmax(scores_atencao)
        
        # Mistura os Valores (V) baseado nos pesos de atenção (O Contexto)
        contexto = [0.0] * self.d_model
        for i in range(len(V)):
            for dim in range(self.d_model):
                contexto[dim] += pesos_atencao[i] * V[i][dim]
                
        # Passo 3: Camada Linear (Achata o contexto para o tamanho do vocabulário)
        logits = mat_mul(self.W_linear, contexto)
        
        # Passo 4: Softmax (Gera as probabilidades finais)
        probabilidades = softmax(logits)
        
        return probabilidades, pesos_atencao

# ==========================================
# 3. INTERFACE DE TESTE
# ==========================================
if __name__ == "__main__":
    # Um vocabulário minúsculo só para testar a mecânica
    vocab = ["o", "a", "eu", "gosto", "de", "programação", "IA", "computador", "aprender", "muito"]
    
    modelo = MiniTransformer(vocab, d_model=8)
    
    print("="*50)
    print("🧠 TRANSFORMER INICIADO (Pesos Aleatórios/Sem Treino)")
    print("="*50)
    
    entrada = "eu gosto de"
    print(f"Entrada do usuário: '{entrada}'\n")
    
    ids = modelo.tokenizar(entrada)
    print(f"[Camada 0] Tokenização: {ids}")
    
    probs, atencao = modelo.forward(ids)
    
    if probs:
        print(f"[Camada 2] Atenção da última palavra nos tokens anteriores:")
        for i, id_token in enumerate(ids):
            print(f"   -> Olhou para '{modelo.id_to_word[id_token]}' com {atencao[i]*100:.2f}% de foco")
            
        # Pega o ID com a maior probabilidade de ser a próxima palavra
        id_previsto = probs.index(max(probs))
        palavra_prevista = modelo.id_to_word[id_previsto]
        
        print(f"\n[Camada Final] Previsão da próxima palavra: '{palavra_prevista}'")
        print(f"Probabilidade calculada (chute aleatório por enquanto): {max(probs)*100:.2f}%")
    else:
        print("Palavras não estão no vocabulário.")
