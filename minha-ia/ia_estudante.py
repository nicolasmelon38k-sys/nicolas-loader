import sqlite3
import urllib.request
import json
import sys

CHAVE_API = "AIzaSyAB39VOUSCZ4ZzG8Qiap0EiRO1nTYPPfk8"

# Lista de modelos por ordem de preferência (o sistema tenta um por um)
MODELOS = ["gemini-1.5-flash", "gemini-1.5-pro"]

conn = sqlite3.connect("memoria_bebe.db")
c = conn.cursor()
c.execute("CREATE TABLE IF NOT EXISTS aulas_gemini (pergunta TEXT, ensinamento_completo TEXT)")
conn.commit()

class IAEstudante:
    def perguntar_ao_gemini(self, frase_usuario):
        prompt_magico = f"Aja como professor: responda a esta dúvida e ensine-me: {frase_usuario}"
        
        # Loop de Fallback (a mesma lógica do seu ai.js)
        for model in MODELOS:
            print(f"  [📞 Conectando...] Tentando o modelo: {model}...")
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={CHAVE_API}"
            dados = json.dumps({"contents": [{"parts": [{"text": prompt_magico}]}]}).encode('utf-8')
            
            try:
                req = urllib.request.Request(url, data=dados, headers={'Content-Type': 'application/json'})
                with urllib.request.urlopen(req) as response:
                    resultado = json.loads(response.read().decode())
                    aula = resultado['candidates'][0]['content']['parts'][0]['text']
                    
                    # Salva no banco e retorna
                    c.execute("INSERT INTO aulas_gemini (pergunta, ensinamento_completo) VALUES (?, ?)", (frase_usuario, aula))
                    conn.commit()
                    return aula
            except Exception as e:
                print(f"  [⚠️ {model} falhou]: {e}. Tentando o próximo...")
        
        return "❌ Falha crítica: Todos os modelos da API estão indisponíveis."

    def processar_conversa(self, frase):
        c.execute("SELECT ensinamento_completo FROM aulas_gemini WHERE pergunta = ?", (frase,))
        resultado = c.fetchone()
        return resultado[0] if resultado else self.perguntar_ao_gemini(frase)

if __name__ == "__main__":
    aluna = IAEstudante()
    while True:
        try:
            texto = input("\nVocê: ")
            if texto.lower() == 'sair': break
            print(aluna.processar_conversa(texto))
        except KeyboardInterrupt: break
