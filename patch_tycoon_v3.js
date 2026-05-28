const fs = require('fs');

console.log("🛠️ Iniciando Injeção Cirúrgica V3...");

// ==========================================
// 1. PATCH NO BACKEND (rotas_web/empresa.js)
// ==========================================
let backend = fs.readFileSync('./rotas_web/empresa.js', 'utf8');

// A: Manda o Level Global do jogador pro Frontend
backend = backend.replace(
    'empresa: emp,',
    'levelUser: user.level || 1, empresa: emp,'
);

// B: Arruma o bug do Nível no RH (agora usa o Nível Global do RPG)
backend = backend.replace(
    'if (user.empresa.nivel < func.reqLvl)',
    'if ((user.level || 1) < func.reqLvl)'
);

// C: Injeta a rota de "Investir Caixa"
const rotaInvestir = `
    app.post('/api/empresa/investir', checkAuth, (req, res) => {
        const idLimpo = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
        let user = db.obterUsuario(idLimpo);
        let valor = Number(req.body.valor);
        if (isNaN(valor) || valor <= 0 || (user.dinheiro || 0) < valor) return res.json({ success: false, msg: "Saldo Físico insuficiente!" });
        user.dinheiro -= valor; user.empresa.caixa += valor;
        if (!user.empresa.logs) user.empresa.logs = [];
        user.empresa.logs.unshift({ data: Date.now(), acao: "INVESTIMENTO", detalhe: "Sócio injetou R$ " + valor });
        db.salvar(idLimpo, user); res.json({ success: true, msg: "R$ " + valor + " injetados! A Fábrica voltou a operar." });
    });
`;
backend = backend.replace("app.post('/api/empresa/recolher'", rotaInvestir + "\n    app.post('/api/empresa/recolher'");

fs.writeFileSync('./rotas_web/empresa.js', backend);
console.log('✅ BACKEND PATCHED: Level arrumado e Sistema de Injeção criado!');


// ==========================================
// 2. PATCH NO FRONTEND (views/tycoon.html)
// ==========================================
let frontend = fs.readFileSync('./views/tycoon.html', 'utf8');

// A: Troca os botões velhos pelos botões com Injetor e Aviso de Falência
const oldBtns = `<button class="btn btn-sell" onclick="vender()"><i class="fas fa-truck-loading"></i> EXPORTAR ESTOQUE</button>
            <button class="btn btn-withdraw" onclick="sacar()"><i class="fas fa-wallet"></i> SACAR PARA CONTA FISICA</button>`;

const newBtns = `<div id="ui-alerta-caixa" style="display:none; background:rgba(255,69,58,0.1); border:1px solid var(--red); color:var(--red); padding:10px; border-radius:10px; font-size:11px; font-weight:bold; text-align:center; margin: 10px 0;">
                <i class="fas fa-exclamation-triangle"></i> FÁBRICA PARADA: INJETE DINHEIRO NO CAIXA (CNPJ) PARA LIGAR AS MÁQUINAS!
            </div>
            <button class="btn btn-sell" onclick="vender()"><i class="fas fa-truck-loading"></i> EXPORTAR ESTOQUE</button>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:10px;">
                <button class="btn" style="background:var(--blue); color:#fff; padding:15px; font-size:12px;" onclick="openMod('investir')"><i class="fas fa-coins"></i> INJETAR CAIXA</button>
                <button class="btn btn-withdraw" style="margin-top:0; font-size:12px;" onclick="openMod('sacar')"><i class="fas fa-wallet"></i> SACAR LUCRO</button>
            </div>`;
if(frontend.includes('onclick="sacar()"')) frontend = frontend.replace(oldBtns, newBtns);

// B: Coloca o Modal Bonito no final do HTML
const modalHtml = `
    <div id="banco-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.8); backdrop-filter:blur(10px); z-index:9999; justify-content:center; align-items:center;">
        <div style="background:var(--card); border:1px solid #333; padding:25px; border-radius:24px; width:85%; max-width:350px; text-align:center; box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
            <i class="fas fa-university" style="font-size:40px; color:#fff; margin-bottom:15px;" id="mod-icon"></i>
            <h3 id="mod-title" style="margin-bottom:10px; color:#fff; font-weight:900;">Banco</h3>
            <p id="mod-desc" style="font-size:12px; color:#888; margin-bottom:20px; line-height:1.4;">...</p>
            <input type="number" id="mod-val" placeholder="R$ 0" style="width:100%; padding:20px; border-radius:15px; border:1px solid #333; background:#000; color:#fff; font-size:24px; font-weight:900; text-align:center; margin-bottom:20px; outline:none;">
            <div style="display:flex; gap:10px;">
                <button class="btn" style="flex:1; background:#222; color:#fff; padding:15px;" onclick="document.getElementById('banco-modal').style.display='none'">CANCELAR</button>
                <button class="btn" style="flex:1; background:var(--green); color:#000; padding:15px;" id="mod-btn" onclick="execMod()">CONFIRMAR</button>
            </div>
        </div>
    </div>
`;
if(!frontend.includes('banco-modal')) frontend = frontend.replace('<div id="toast">', modalHtml + '\n    <div id="toast">');

// C: Arruma o JS (Level, Alerta visual de parada e o Modal novo)
frontend = frontend.replace('let lck = emp.nivel < r.reqLvl;', 'let lck = (d.levelUser||1) < r.reqLvl;');
frontend = frontend.replace(
    "document.getElementById('s-preco').innerText = 'R$ ' + fmt(st.precoChip) + ' / chip';",
    "document.getElementById('s-preco').innerText = 'R$ ' + fmt(st.precoChip) + ' / chip';\n            if(document.getElementById('ui-alerta-caixa')) document.getElementById('ui-alerta-caixa').style.display = (emp.caixa < st.finalCusto) ? 'block' : 'none';"
);

// D: Troca a função sacar velha pelas duas novas do modal
const oldSacar = /async function sacar\(\) \{[\s\S]*?\}/;
const newJS = `
        let modType = '';
        function openMod(tipo) {
            modType = tipo;
            document.getElementById('mod-val').value = '';
            document.getElementById('banco-modal').style.display = 'flex';
            if(tipo==='investir') {
                document.getElementById('mod-icon').className = 'fas fa-coins';
                document.getElementById('mod-icon').style.color = 'var(--blue)';
                document.getElementById('mod-title').innerText = 'Injetar Caixa (Ligar Máquinas)';
                document.getElementById('mod-desc').innerText = 'Tira saldo da sua Carteira Física e coloca no CNPJ para pagar a produção e ligar a fábrica.';
                document.getElementById('mod-btn').style.background = 'var(--blue)';
            } else {
                document.getElementById('mod-icon').className = 'fas fa-wallet';
                document.getElementById('mod-icon').style.color = 'var(--green)';
                document.getElementById('mod-title').innerText = 'Sacar Lucro';
                document.getElementById('mod-desc').innerText = 'Retira dinheiro do CNPJ direto para sua Carteira (Taxa de 5%).';
                document.getElementById('mod-btn').style.background = 'var(--green)';
            }
        }
        async function execMod() {
            let v = document.getElementById('mod-val').value;
            if(!v || v<=0) return showMsg('Valor inválido!');
            document.getElementById('mod-btn').innerText = 'PROCESSANDO...';
            let rota = modType === 'investir' ? '/api/empresa/investir' : '/api/empresa/recolher';
            const r = await fetch(rota, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({valor:v})});
            const d = await r.json(); 
            document.getElementById('mod-btn').innerText = 'CONFIRMAR';
            document.getElementById('banco-modal').style.display='none';
            showMsg(d.msg||d.erro); sync();
        }
`;
if(frontend.match(oldSacar)) frontend = frontend.replace(oldSacar, newJS);

fs.writeFileSync('./views/tycoon.html', frontend);
console.log('✅ FRONTEND PATCHED: Modais lindos, alertas de fábrica e Nível Global desbloqueado!');

