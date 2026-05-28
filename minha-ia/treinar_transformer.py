import math
import random
import re

def softmax(vetor):
    max_val = max(vetor) if vetor else 0
    exps = [math.exp(x - max_val) for x in vetor]
    soma = sum(exps)
    return [x / soma for x in exps] if soma > 0 else vetor

def dot_product(v1, v2):
    return sum(x * y for x, y in zip(v1, v2))

def mat_mul(matriz, vetor):
    return [dot_product(linha, vetor) for linha in matriz]

class MiniTransformerTreinavel:
    def __init__(self, vocabulario, d_model=8):
        self.vocab = vocabulario
        self.vocab_size = len(vocabulario)
        self.d_model = d_model
        self.word_to_id = {palavra: i for i, palavra in enumerate(vocabulario)}
        self.id_to_word = {i: palavra for i, palavra in enumerate(vocabulario)}
        
        # Matrizes de Pesos (Começam vazias/aleatórias)
        self.W_embedding = [[random.uniform(-0.1, 0.1) for _ in range(d_model)] for _ in range(self.vocab_size)]
        self.W_q = [[random.uniform(-0.1, 0.1) for _ in range(d_model)] for _ in range(d_model)]
        self.W_k = [[random.uniform(-0.1, 0.1) for _ in range(d_model)] for _ in range(d_model)]
        self.W_v = [[random.uniform(-0.1, 0.1) for _ in range(d_model)] for _ in range(d_model)]
        self.W_linear = [[random.uniform(-0.1, 0.1) for _ in range(d_model)] for _ in range(self.vocab_size)]

    def tokenizar(self, texto):
        palavras = re.findall(r'\b\w+\b', texto.lower())
        return [self.word_to_id[p] for p in palavras if p in self.word_to_id]

    def forward(self, token_ids):
        # 1. Embeddings
        X = [self.W_embedding[tid] for tid in token_ids]
        if not X: return None, None, None
        
        # 2. Attention
        Q = [mat_mul(self.W_q, x) for x in X]
        K = [mat_mul(self.W_k, x) for x in X]
        V = [mat_mul(self.W_v, x) for x in X]
        
        q_atual = Q[-1]
        scores_atencao = [dot_product(q_atual, k) / math.sqrt(self.d_model) for k in K]
        pesos_atencao = softmax(scores_atencao)
        
        contexto = [0.0] * self.d_model
        for i in range(len(V)):
            for dim in range(self.d_model):
                contexto[dim] += pesos_atencao[i] * V[i][dim]
                
        # 3. Saída e Probabilidades
        logits = mat_mul(self.W_linear, contexto)
        probabilidades = softmax(logits)
        
        return probabilidades, pesos_atencao, contexto

    def treinar_passo(self, entrada_ids, alvo_id, taxa_aprendizado=0.1):
        # Passa a informação pra frente (Forward)
        probabilidades, _, contexto = self.forward(entrada_ids)
        
        # Calcula o Erro (Cross-Entropy Loss)
        erro_loss = -math.log(max(probabilidades[alvo_id], 1e-10))
        
        # ==========================================
        # O BACKPROPAGATION (A Máquina Aprendendo)
        # ==========================================
        # Calcula a derivada da Cross-Entropy com o Softmax
        # A matemática diz que o gradiente é: Probabilidade Prevista - 1 (para o alvo certo)
        gradientes = list(probabilidades)
        gradientes[alvo_id] -= 1.0 
        
        # Atualiza a Matriz W_linear para acertar na próxima vez
        for i in range(self.vocab_size):
            for dim in range(self.d_model):
                # Peso Novo = Peso Antigo - (Taxa * Gradiente * Contexto)
                self.W_linear[i][dim] -= taxa_aprendizado * gradientes[i] * contexto[dim]
                
        return erro_loss

# --- EXECUÇÃO DO TREINAMENTO ---
if __name__ == "__main__":
    vocab = ["o", "a", "eu", "gosto", "de", "programação", "IA", "computador", "aprender", "muito"]
    modelo = MiniTransformerTreinavel(vocab, d_model=8)
    
    frase_entrada = "eu gosto de"
    palavra_alvo = "programação"
    
    ids_entrada = modelo.tokenizar(frase_entrada)
    id_alvo = modelo.word_to_id[palavra_alvo]
    
    print("="*50)
    print(f"🎯 OBJETIVO: Ensinar a IA a responder '{palavra_alvo}' após '{frase_entrada}'")
    print("="*50)
    
    # Vamos fazer a IA ler a frase e corrigir os pesos 100 vezes seguidas (100 Épocas)
    for epoca in range(1, 101):
        # O Treino real acontecendo
        loss = modelo.treinar_passo(ids_entrada, id_alvo, taxa_aprendizado=0.5)
        
        # Mostramos o progresso a cada 20 tentativas
        if epoca == 1 or epoca % 20 == 0:
            probs, _, _ = modelo.forward(ids_entrada)
            chance_acerto = probs[id_alvo] * 100
            
            # Pega o melhor chute atual
            id_previsto = probs.index(max(probs))
            palavra_prevista = modelo.id_to_word[id_previsto]
            
            print(f"Época {epoca:03d} | Erro (Loss): {loss:.4f} | Certeza na resposta: {chance_acerto:05.2f}% | Chute atual: '{palavra_prevista}'")
            
    print("\n[+] Treinamento Concluído!")
    probs_finais, _, _ = modelo.forward(ids_entrada)
    print(f"[!] Se você perguntar '{frase_entrada}' agora, ela vai responder '{modelo.id_to_word[probs_finais.index(max(probs_finais))]}'")
