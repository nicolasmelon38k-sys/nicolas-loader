import sqlite3
import math
import random
import re
import sys
import os

# ==========================================
# 1. CONEXÃO COM A MEMÓRIA (O HD DA IA)
# ==========================================
# Cria o banco de dados do bebê IA
conn = sqlite3.connect("memoria_bebe.db")
c = conn.cursor()
# Tabela de fatos que ela tem certeza (Certo)
c.execute("CREATE TABLE IF NOT EXISTS fatos_certos (palavra_chave TEXT, contexto TEXT)")
# Tabela do que ela não sabe (Aprender)
c.execute("CREATE TABLE IF NOT EXISTS coisas_para_aprender (pergunta_original TEXT)")
conn.commit()

# Injeta um conhecimento básico para ela não nascer totalmente vazia
c.execute("INSERT INTO fatos_certos (palavra_chave, contexto) SELECT 'programação', 'A programação é a arte de escrever códigos lógicos para computadores.' WHERE NOT EXISTS (SELECT 1 FROM fatos_certos WHERE palavra_chave='programação')")
conn.commit()

# ==========================================
# 2. O CÉREBRO DA IA (TRANSFORMER DINÂMICO)
# ==========================================
def softmax(vetor):
    max_val = max(vetor) if vetor else 0
    exps = [math.exp(x - max_val) for x in vetor]
    soma = sum(exps)
    return [x / soma for x in exps] if soma > 0 else vetor

def dot_product(v1, v2):
    return sum(x * y for x, y in zip(v1, v2))

class IABebe:
    def __init__(self, d_model=16):
        self.d_model = d_model
        # O bebê nasce com um vocabulário muito pequeno
        vocab_inicial = ["eu", "você", "é", "o", "que", "sim", "não"]
        self.w2i = {p: i for i, p in enumerate(vocab_inicial)}
        self.i2w = {i: p for i, p in enumerate(vocab_inicial)}
        self.vocab_size = len(vocab_inicial)
        
        # Matrizes do Cérebro
        self.W_embedding = [[random.uniform(-0.5, 0.5) for _ in range(d_model)] for _ in range(self.vocab_size)]
        self.W_linear = [[random.uniform(-0.5, 0.5) for _ in range(d_model)] for _ in range(self.vocab_size)]

    def tokenizar_e_crescer(self, texto):
        # NEUROPLASTICIDADE: Se a palavra não existe, o cérebro cresce na hora!
        palavras = re.findall(r'\b\w+\b', texto.lower())
        ids = []
        for p in palavras:
            if p not in self.w2i:
                # Aprende a palavra nova criando um vetor zerado/aleatório pra ela
                novo_id = self.vocab_size
                self.w2i[p] = novo_id
                self.i2w[novo_id] = p
                self.vocab_size += 1
                self.W_embedding.append([random.uniform(-0.5, 0.5) for _ in range(self.d_model)])
                self.W_linear.append([random.uniform(-0.5, 0.5) for _ in range(self.d_model)])
            ids.append(self.w2i[p])
        return ids

    def analisar_humor(self, palavras):
        # Sensor de Sentimento Básico
        felizes = ['bom', 'legal', 'amo', 'gosto', 'feliz', 'top', 'incrível', 'certo']
        bravas = ['ruim', 'odeio', 'chato', 'burra', 'errado', 'raiva', 'triste', 'merda']
        
        pontos = 0
        for p in palavras:
            if p in felizes: pontos += 1
            if p in bravas: pontos -= 1
            
        if pontos > 0: return "Você parece animado ou positivo. 😊"
        elif pontos < 0: return "Você parece frustrado ou negativo. 😔"
        else: return "Estou analisando sua frase de forma neutra e lógica. 🤖"

    def buscar_na_memoria(self, palavras):
        # Vai no SQLite buscar o que é "Certo"
        for p in palavras:
            if len(p) > 2: # Ignora 'o', 'a', 'é'
                c.execute("SELECT contexto FROM fatos_certos WHERE palavra_chave LIKE ?", ('%'+p+'%',))
                resultado = c.fetchone()
                if resultado:
                    return resultado[0]
        return None

    def raciocinar(self, pergunta_usuario):
        # 1. Transforma o texto em neurônios (e cresce se precisar)
        ids_entrada = self.tokenizar_e_crescer(pergunta_usuario)
        palavras_digitadas = [self.i2w[tid] for tid in ids_entrada]
        
        # 2. Analisa o seu humor
        humor_detectado = self.analisar_humor(palavras_digitadas)
        print(f"\n[Análise de Sentimento]: {humor_detectado}")
        
        # 3. Busca o Certo/Errado no SQLite
        fato_encontrado = self.buscar_na_memoria(palavras_digitadas)
        
        # 4. A Lógica de Confiança
        if fato_encontrado:
            # Ela "sabe" a resposta. Joga a resposta para a matemática mastigar.
            print("[Lógica]: Encontrei dados seguros no meu banco.")
            ids_contexto = self.tokenizar_e_crescer(fato_encontrado)
            
            # Aqui rodaria a atenção, mas para a conversa ser rápida:
            return fato_encontrado
        else:
            # Ela NÃO sabe. A confiança despenca.
            print("[Lógica]: Matemática confusa. Dados insuficientes para gerar resposta certa.")
            
            # 5. Guarda no banco de dados para aprender depois!
            c.execute("INSERT INTO coisas_para_aprender (pergunta_original) VALUES (?)", (pergunta_usuario,))
            conn.commit()
            
            return "Eu ainda sou uma IA bebê e não encontrei a lógica certa para isso no meu banco de dados. Guardei a sua pergunta no meu espaço de memória 'Aprender'. Pode me explicar o que isso significa para eu salvar na minha área de fatos certos?"

# ==========================================
# 3. O TERMINAL DA IA BEBÊ
# ==========================================
if __name__ == "__main__":
    bebe = IABebe()
    
    print("="*60)
    print("🍼 IA BEBÊ INICIADA (Neuroplasticidade Ativa | SQLite Conectado)")
    print("="*60)
    print("Dicas de uso:")
    print("- Diga palavras agressivas ou felizes para testar o humor.")
    print("- Pergunte sobre 'programação' para ver ela puxar um Fato Certo.")
    print("- Pergunte algo bizarro para ver ela salvar a dúvida no banco de dados.")
    
    while True:
        try:
            texto = input("\nVocê: ")
            if texto.lower() == 'sair':
                conn.close()
                break
                
            resposta_ia = bebe.raciocinar(texto)
            print(f"IA Bebê: {resposta_ia}")
            
        except KeyboardInterrupt:
            conn.close()
            break
