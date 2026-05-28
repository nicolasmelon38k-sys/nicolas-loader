# 🤖 DAEMON-XBOT — CONTEXTO COMPLETO DO SISTEMA

Este arquivo descreve toda a estrutura, regras e funcionamento do bot.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📁 ESTRUTURA DO PROJETO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 index.js
→ Arquivo principal do bot (Baileys)
→ Controla:
- conexão WhatsApp
- leitura de mensagens
- execução de comandos
- registro automático de usuários
- XP por mensagem

📌 db.js
→ Banco de dados local (JSON)
→ Arquivo: data/database.json

📌 commands/
→ Todos os comandos do bot (modular)

📌 config.json
→ Prefixo e configurações gerais

📌 auth_info_baileys/
→ Sessão do WhatsApp

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🧠 SISTEMA DE BANCO (db.js)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 🔧 Funções principais:
- normalizarId(id)
- toMentionJid(id)
- ler()
- gravar(dados)
- estaRegistrado(id)
- obterUsuario(id)
- registrar(id, nome)
- salvar(id, novosDados)
- ganharXP(id, quantidade, sock, msg)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 👤 MODELO DE USUÁRIO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  nome,
  dinheiro,
  banco,
  xp,
  level,
  mensagens,
  emprego,
  status,
  comandos,
  tempoAtivo,
  inventario
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 💰 SISTEMA DE ECONOMIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💵 dinheiro = carteira
🏦 banco = saldo guardado
💎 total = dinheiro + banco

📌 Fluxo:
- !trabalhar → ganha dinheiro + XP
- !depositar → move dinheiro → banco
- !sacar → move banco → carteira
- !saldo → mostra tudo
- !banco → visão financeira detalhada

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 💼 SISTEMA DE EMPREGO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 comandos:
- !empregos → lista de empregos
- !cargo → escolher profissão
- !abandonar → sair do emprego
- !trabalhar → gera salário baseado no cargo

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ⭐ SISTEMA DE LEVEL / XP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- XP por mensagem automática (index.js)
- XP por trabalho (!trabalhar)
- level sobe com fórmula: 100 * (level²)
- level máximo: 100
- level up dá recompensa em dinheiro

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📊 SISTEMA SOCIAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- mensagens contam atividade
- tempoAtivo incrementa automaticamente
- comandos registrados por usuário

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📌 COMANDOS PRINCIPAIS

━━━━━━━━ ECONOMIA ━━━━━━━━
!saldo → visão completa financeira
!banco → carteira + banco detalhado
!depositar → transferir dinheiro para banco
!sacar → retirar do banco
!money → admin add dinheiro
!remover-money → admin remover dinheiro

━━━━━━━━ EMPREGOS ━━━━━━━━
!trabalhar → ganhar dinheiro
!empregos → lista de vagas
!cargo → escolher profissão
!abandonar → sair do emprego

━━━━━━━━ PERFIL ━━━━━━━━
!perfil → perfil completo do usuário
!level → aumentar level (admin)
!remover-level → reduzir level (admin)
!rank → ranking global

━━━━━━━━ SISTEMA ━━━━━━━━
!menu → painel principal
!s → figurinha
!play → música
!video4k → render vídeo

━━━━━━━━ ADMIN ━━━━━━━━
!dados → ver database
!admtest → teste admin
!teste → debug interno
!ls → listar info interna

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🔐 REGRAS DO SISTEMA

- sempre usar db.normalizarId antes de salvar/buscar
- nunca salvar ID direto sem normalização
- valores monetários limitados a 15 dígitos
- comandos admin só por whitelist de IDs
- banco nunca pode ficar negativo
- carteira nunca pode ficar negativa
- JSON deve ser sempre válido
- comandos sempre exportar execute()

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ⚙️ CONEXÃO (index.js)

- usa @whiskeysockets/baileys
- reconexão automática
- registra usuário ao usar comando
- dá XP por mensagem
- ignora status broadcast
- bloqueia newsletter IDs

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
