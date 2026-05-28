import sqlite3
import os

DB = "memoria.db"

def conectar():
    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS memoria (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pergunta TEXT UNIQUE,
        pergunta_norm TEXT UNIQUE,
        resposta TEXT,
        resumo TEXT,
        tipo TEXT,
        classificacao TEXT,
        palavras_chave TEXT,
        modelo_origem TEXT,
        criado_em TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    return conn


def norm(txt):
    return txt.lower().strip()


def salvar(conn, pergunta, resposta):
    cur = conn.cursor()
    cur.execute("""
    INSERT OR REPLACE INTO memoria
    (pergunta, pergunta_norm, resposta)
    VALUES (?, ?, ?)
    """, (pergunta, norm(pergunta), resposta))
    conn.commit()


def buscar(conn, pergunta):
    cur = conn.cursor()
    cur.execute("""
    SELECT resposta FROM memoria WHERE pergunta_norm=?
    """, (norm(pergunta),))
    row = cur.fetchone()
    return row[0] if row else None


def responder(pergunta):
    # IA fake simples (fallback)
    return f"Entendi sua pergunta: {pergunta}"


def main():
    conn = conectar()

    print("="*50)
    print("🧠 IA LOCAL ESTÁVEL")
    print("="*50)

    while True:
        texto = input("Você: ")

        if texto == "sair":
            break

        memoria = buscar(conn, texto)

        if memoria:
            print("\n📚 MEMÓRIA:\n", memoria)
        else:
            print("\n🤖 Aprendendo...")
            resposta = responder(texto)
            salvar(conn, texto, resposta)
            print("\n", resposta)


    conn.close()

if __name__ == "__main__":
    main()
