import sqlite3
import textwrap

# Conecta na memória da IA
conn = sqlite3.connect("memoria_bebe.db")
c = conn.cursor()

# Puxa tudo que tá na tabela de "fatos_certos"
c.execute("SELECT palavra_chave, contexto FROM fatos_certos")
resultados = c.fetchall()

print("="*60)
print("🧠 DENTRO DA MENTE DA IA (O QUE ELA APRENDEU)")
print("="*60)

if not resultados:
    print("O banco de dados está vazio.")
else:
    for palavra, contexto in resultados:
        print(f"🔸 PALAVRA: {palavra.upper()}")
        
        # Quebra o texto para caber bonitinho na tela do celular
        texto_formatado = textwrap.fill(contexto, width=55)
        print(f"   {texto_formatado}\n")

conn.close()
