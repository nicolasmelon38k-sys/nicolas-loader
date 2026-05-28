import sqlite3
import json

conn = sqlite3.connect("memoria.db")
cur = conn.cursor()

print("=" * 60)
print("🧠 BANCO DA IA")
print("=" * 60)

cur.execute("PRAGMA table_info(memoria)")
print("\nESTRUTURA:")
for row in cur.fetchall():
    print(row)

cur.execute("SELECT pergunta, resposta, resumo, tipo, classificacao, palavras_chave, modelo_origem, criado_em FROM memoria ORDER BY id DESC")
rows = cur.fetchall()

print("\nDADOS:\n")
for row in rows:
    print("-" * 60)
    print("PERGUNTA:", row[0])
    print("RESPOSTA:", row[1])
    print("RESUMO:", row[2])
    print("TIPO:", row[3])
    print("CLASSIFICAÇÃO:", row[4])
    print("PALAVRAS_CHAVE:", row[5])
    print("MODELO:", row[6])
    print("CRIADO_EM:", row[7])

conn.close()
