import math
import random
import re
import sys

# --- Funções Matemáticas ---
def softmax(vetor):
    max_val = max(vetor) if vetor else 0
    exps = [math.exp(x - max_val) for x in vetor]
    soma = sum(exps)
    return [x / soma for x in exps] if soma > 0 else vetor

def dot_product(v1, v2):
    return sum(x * y for x, y in zip(v1, v2))

class CerebroReal:
    def __init__(self, vocabulario, d_model=8):
        self.vocab = vocabulario
        self.vocab_size = len(vocabulario)
        self.d_model = d_model
        
        self.w2i = {p: i for i, p in enumerate(vocabulario)}
        self.i2w = {i: p for i, p in enumerate(vocabulario)}
        
        # Matrizes (Começam ignorantes, com valores aleatórios pequenos)
        self.W_embedding = [[random.uniform(-0.5, 0.5) for _ in range(d_model)] for _ in range(self.vocab_size)]
        self.W_linear = [[random.uniform(-0.5, 0.5) for _ in range(d_model)] for _ in range(self.vocab_size)]

    def tokenizar(self, texto):
        palavras = re.findall(r'\b\w+\b', texto.lower())
        return [self.w2i[p] for p in palavras if p in self.w2i]

    def pensar(self, token_ids):
        # 1. Pega os vetores das palavras digitadas
        vetores = [self.W_embedding[tid] for tid in token_ids]
        if not vetores: return None, None
        
        # Para simplificar e rodar rápido no terminal, o "contexto" aqui é a soma dos vetores
        contexto = [sum(dim) for dim in zip(*vetores)]
        
        # 2. Transforma o contexto em previsões para o vocabulário
        logits = [dot_product(linha, contexto) for linha in self.W_linear]
        
        # 3. Gera a probabilidade
        probabilidades = softmax(logits)
        return probabilidades, contexto

    def aprender(self, entrada_ids, alvo_id, taxa=0.1):
        probs, contexto = self.pensar(entrada_ids)
        
        # Calcula o gradiente do erro
        gradientes = list(probs)
        gradientes[alvo_id] -= 1.0 
        
        # Backpropagation REAL: Atualiza a Camada Linear
        for i in range(self.vocab_size):
            for dim in range(self.d_model):
                self.W_linear[i][dim] -= taxa * gradientes[i] * contexto[dim]
                
        # Backpropagation REAL: Atualiza os Embeddings (O significado numérico da entrada)
        # Isso é o que faz a IA "entender" de verdade e a certeza subir pra 99%
        for tid in entrada_ids:
            for dim in range(self.d_model):
                erro_acumulado = sum(gradientes[i] * self.W_linear[i][dim] for i in range(self.vocab_size))
                self.W_embedding[tid][dim] -= taxa * erro_acumulado

        return probs[alvo_id] # Retorna a % de certeza

# --- EXECUÇÃO ---
if __name__ == "__main__":
    vocab = ["o", "a", "eu", "gosto", "de", "programação", "ia", "você", "é", "inteligente", "burra"]
    ia = CerebroReal(vocab, d_model=8)
    
    frase = "eu gosto de"
    alvo = "programação"
    ids_in = ia.tokenizar(frase)
    id_out = ia.w2i[alvo]
    
    print("\n[🧠] INICIANDO APRENDIZADO NEURAL PROFUNDO...")
    print("Aguarde a certeza matemática ultrapassar 95%...\n")
    
    certeza = 0.0
    epocas = 0
    # O VERDADEIRO TREINO: Só para de treinar quando realmente aprender!
    while certeza < 0.95:
        epocas += 1
        certeza = ia.aprender(ids_in, id_out, taxa=0.05)
        
        if epocas % 10 == 0:
            print(f"-> Época {epocas:03d} | Certeza que a resposta é '{alvo}': {certeza*100:.2f}%")
            
    print(f"\n[+] REDE NEURAL CALIBRADA em {epocas} épocas! A IA agora 'sabe' a resposta.")
    print("="*50)
    
    # --- O MODO INTERATIVO ---
    print("\n[ Terminal Interativo da IA - Digite 'sair' para fechar ]")
    while True:
        try:
            texto_usuario = input("\nVocê: ")
            if texto_usuario.lower() == 'sair':
                break
                
            ids_usuario = ia.tokenizar(texto_usuario)
            if not ids_usuario:
                print("IA: Não conheço essas palavras.")
                continue
                
            probs, _ = ia.pensar(ids_usuario)
            id_resposta = probs.index(max(probs))
            certeza_resposta = max(probs) * 100
            
            print(f"IA: {ia.i2w[id_resposta]} (Certeza matemática: {certeza_resposta:.2f}%)")
            
        except KeyboardInterrupt:
            break
