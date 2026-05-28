import sqlite3
import urllib.request
import urllib.parse
import json
import time
import re

# ==========================================
# 1. PREPARANDO A MEMÓRIA INTERNA (HD)
# ==========================================
conn = sqlite3.connect("memoria_bebe.db")
c = conn.cursor()
c.execute("CREATE TABLE IF NOT EXISTS fatos_certos (palavra_chave TEXT, contexto TEXT)")
conn.commit()

# ==========================================
# 2. O MÓDULO DE CURIOSIDADE E GRAMÁTICA
# ==========================================
class IACuriosa:
    def __init__(self):
        # Vocabulário base que ela já conhece de cara
        self.vocabulario_conhecido = ["eu", "você", "é", "o", "a", "que", "sim", "não", "posso", "na", "minha"]
        
    def deduzir_gramatica(self, palavra):
        # Lógica que você criou: analisar a palavra crua
        if palavra in ["a", "na", "minha"]:
            return "Artigo/Pronome Feminino ou Posse"
        elif palavra in ["o", "no", "meu"]:
            return "Artigo/Pronome Masculino ou Posse"
        elif palavra.endswith('a'):
            return "Provavelmente um substantivo feminino"
        elif palavra.endswith('o'):
            return "Provavelmente um substantivo masculino"
        elif palavra.endswith('r'):
            return "Provavelmente uma ação (Verbo no infinitivo)"
        return "Estrutura neutra ou desconhecida"

    def pesquisar_na_internet(self, palavra):
        print(f"\n  [🧠 Pensando...] Opa, encontrei uma palavra nova: '{palavra}'")
        
        # 1. Deduz a gramática antes de pesquisar (Ideia genial sua)
        gramatica = self.deduzir_gramatica(palavra)
        print(f"  [📚 Gramática] Analisando estrutura... {gramatica}")
        
        print(f"  [🌐 Curiosidade] Indo na internet buscar o que é isso...")
        url = f"https://pt.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&titles={urllib.parse.quote(palavra)}&format=json"
        
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                dados = json.loads(response.read().decode())
                paginas = dados['query']['pages']
                
                for page_id in paginas:
                    if 'extract' in paginas[page_id]:
                        texto_bruto = paginas[page_id]['extract']
                        # Pega só o primeiro parágrafo para não engolir a RAM
                        resumo = texto_bruto[:300].replace('\n', ' ')
                        
                        print(f"  [⏳ Download] Lendo o texto da internet...")
                        # A latência de 2 segundos para não travar o celular!
                        time.sleep(2)
                        
                        # 2. Avaliação de Certo/Errado super básica
                        aviso_moral = ""
                        if palavra in ["bater", "roubar", "matar", "crime"]:
                            aviso_moral = " (ALERTA: Isso é classificado como uma ação negativa/errada em sociedades humanas)."
                            print(f"  [⚖️ Moralidade] Detectei que essa ação causa danos. Marcando como ERRADO.")
                            
                        # Monta a nova memória
                        novo_conhecimento = f"Gramática: {gramatica}. Definição: {resumo}{aviso_moral}"
                        
                        # 3. Salva no HD (Memória Interna)
                        c.execute("INSERT INTO fatos_certos (palavra_chave, contexto) VALUES (?, ?)", (palavra, novo_conhecimento))
                        conn.commit()
                        
                        print(f"  [💾 Memória] Informação salva no SQLite com sucesso!")
                        
                        # 4. Libera a RAM destruindo as variáveis gigantes (Garbage Collection)
                        del texto_bruto
                        del dados
                        del resumo
                        
                        print(f"  [♻️ RAM] Variáveis limpas. Pronta para a próxima palavra.")
                        self.vocabulario_conhecido.append(palavra)
                        return True
                        
            print(f"  [❌ Internet] Não achei nada específico sobre '{palavra}' na Wiki.")
            return False
            
        except Exception as e:
            print(f"  [⚠️ Erro] Deu falha na conexão: {e}")
            return False

    def processar_frase(self, frase):
        palavras = re.findall(r'\b\w+\b', frase.lower())
        
        # Analisa palavra por palavra, bem devagar
        for palavra in palavras:
            if len(palavra) > 2 and palavra not in self.vocabulario_conhecido:
                # Se não conhece, aciona a curiosidade e vai pra internet
                sucesso = self.pesquisar_na_internet(palavra)
                if not sucesso:
                    self.vocabulario_conhecido.append(palavra) # Marca pra não ficar repetindo
                    
        print("\nIA Curiosa: Terminei de analisar a sua frase e salvei tudo que pude aprender no meu banco de dados. Pode olhar!")

# ==========================================
# 3. INTERFACE DE TESTE
# ==========================================
if __name__ == "__main__":
    ia = IACuriosa()
    print("="*60)
    print("🌍 IA CURIOSA INICIADA (Conectada à Internet | RAM Protegida)")
    print("="*60)
    print("Digite uma frase com palavras complexas (ex: 'posso bater na vizinha').")
    print("Ela vai parar, deduzir a gramática, pesquisar na web, esperar 2s e limpar a RAM.")
    
    while True:
        try:
            texto = input("\nVocê: ")
            if texto.lower() == 'sair':
                conn.close()
                break
            ia.processar_frase(texto)
        except KeyboardInterrupt:
            conn.close()
            break
