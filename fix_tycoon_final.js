const fs = require('fs');

console.log("🧹 Iniciando Limpeza e Restauração do Tycoon...");

let html = fs.readFileSync('./views/tycoon.html', 'utf8');

// 1. ARRUMANDO OS BOTÕES (Caso tenham quebrado no patch anterior)
const novosBotoes = `
            <div id="ui-alerta-caixa" style="display:none; background:rgba(255,69,58,0.1); border:1px solid var(--red); color:var(--red); padding:10px; border-radius:10px; font-size:11px; font-weight:bold; text-align:center; margin: 10px 0;">
                <i class="fas fa-exclamation-triangle"></i> FÁBRICA PARADA: INJETE DINHEIRO NO CAIXA (CNPJ) PARA LIGAR AS MÁQUINAS!
            </div>
            <button class="btn btn-sell" onclick="vender()"><i class="fas fa-truck-loading"></i> EXPORTAR ESTOQUE</button>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:10px;">
                <button class="btn" style="background:var(--blue); color:#fff; padding:15px; font-size:12px;" onclick="openMod('investir')"><i class="fas fa-coins"></i> INJETAR CAIXA</button>
                <button class="btn btn-withdraw" style="margin-top:0; font-size:12px;" onclick="openMod('sacar')"><i class="fas fa-wallet"></i> SACAR LUCRO</button>
            </div>
`;
// Troca os botões velhos pelos novos com Injetor
html = html.replace(/<button class="btn btn-sell" onclick="vender\(\)">[\s\S]*?SACAR PARA CONTA FISICA<\/button>/, novosBotoes);


// 2. SUBSTITUINDO O JAVASCRIPT CORROMPIDO PELO NOVO E LIMPO
const scriptLimpo = `
<script>
    const fmt = v => new Intl.NumberFormat('pt-BR').format(v||0);
    let cache = null;

    function showMsg(m) { const t=document.getElementById('toast'); t.innerText=m; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),3000); }
    function switchTab(t) { document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active')); document.querySelectorAll('.section').forEach(x=>x.classList.remove('active')); event.target.classList.add('active'); document.getElementById('sec-'+t).classList.add('active'); }

    // Garante que o Modal do Banco sempre exista na tela
    if(!document.getElementById('banco-modal')) {
        document.body.insertAdjacentHTML('beforeend', \`
        <div id="banco-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.85); backdrop-filter:blur(8px); z-index:9999; justify-content:center; align-items:center;">
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
        </div>\`);
    }

    async function sync() {
        try {
            const r = await fetch('/api/empresa/info'); const d = await r.json();
            if(!d.hasCompany) return document.body.innerHTML = '<div style="padding:40px;text-align:center;"><h2>Sem Empresa</h2><button class="btn" style="background:var(--blue); color:#fff; padding:15px; width:100%; margin-top:20px;" onclick="fundar()">Fundar R$ 2.500</button></div>';
            cache = d; render(d);
        } catch(e) {}
    }
    setInterval(sync, 2000); sync();

    function render(d) {
        const emp = d.empresa; const st = d.stats;
        document.getElementById('ui-nome').innerText = emp.nome;
        if(document.getElementById('ui-saldofisico')) document.getElementById('ui-saldofisico').innerText = '💳 R$ ' + fmt(d.saldoReal);
        document.getElementById('ui-nivel').innerText = 'LVL ' + emp.nivel;
        document.getElementById('ui-caixa').innerText = 'R$ ' + fmt(emp.caixa);
        
        let lucroLiq = (emp.lucroAcumulado||0) - (emp.custoAcumulado||0);
        const lEl = document.getElementById('ui-lucro');
        lEl.innerText = 'R$ ' + fmt(lucroLiq);
        lEl.style.color = lucroLiq >= 0 ? 'var(--blue)' : 'var(--red)';

        let ch = Math.floor(emp.estoque["Microchips"]||0);
        document.getElementById('ui-estoque-txt').innerText = fmt(ch) + ' / ' + fmt(st.finalEstoque);
        document.getElementById('ui-estoque-bar').style.width = Math.min(100, (ch/st.finalEstoque)*100) + '%';

        document.getElementById('s-prod').innerText = fmt(st.finalProd) + ' / min';
        document.getElementById('s-custo').innerText = 'R$ ' + fmt(st.finalCusto) + ' / min';
        document.getElementById('s-preco').innerText = 'R$ ' + fmt(st.precoChip) + ' / chip';
        
        if(document.getElementById('ui-alerta-caixa')) document.getElementById('ui-alerta-caixa').style.display = (emp.caixa < st.finalCusto) ? 'block' : 'none';

        const b = st.baseInfo;
        document.getElementById('ui-math').innerHTML = 
            \`Produção: (Base \${b.prodBase} + Flat \${b.buffProdFlat}) x \${b.buffProdPct}%<br>\` +
            \`Manutenção: Base R$ \${b.custoBase} - \${b.buffCustoPct}% desconto\`;

        let hRH = '';
        for(let id in st.rh) {
            let r = st.rh[id]; let qtd = emp.equipe[id]||0; let lck = (d.levelUser||1) < r.reqLvl;
            let btn = lck ? \`<button class="btn btn-disabled" disabled>LVL \${r.reqLvl}</button>\` : \`<button class="btn btn-buy" onclick="contratar('\${id}')">R$ \${fmt(r.preco)}</button>\`;
            hRH += \`<div class="item-card"><div class="i-icon"><i class="\${r.icon}" style="color:#fff;"></i></div><div class="i-info"><div class="i-title">\${r.nome} \${qtd>0?'<span class="i-badge">x'+qtd+'</span>':''}</div><div class="i-desc">\${r.desc}</div></div>\${btn}</div>\`;
        }
        document.getElementById('list-rh').innerHTML = hRH;

        let hUpg = '';
        for(let id in st.upgrades) {
            let u = st.upgrades[id]; let tem = emp.upgrades.includes(id);
            let btn = tem ? \`<button class="btn btn-disabled" disabled>INSTALADO</button>\` : \`<button class="btn btn-buy" style="background:\${u.cor};" onclick="upg('\${id}')">R$ \${fmt(u.preco)}</button>\`;
            hUpg += \`<div class="item-card"><div class="i-icon"><i class="\${u.icon}" style="color:\${u.cor};"></i></div><div class="i-info"><div class="i-title">\${u.nome}</div><div class="i-desc">\${u.desc}</div></div>\${btn}</div>\`;
        }
        document.getElementById('list-tech').innerHTML = hUpg;
    }

    async function fundar() { const r=await fetch('/api/empresa/fundar',{method:'POST'}); const d=await r.json(); showMsg(d.msg); sync(); window.location.reload(); }
    async function contratar(id) { const r=await fetch('/api/empresa/contratar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({funcId:id})}); const d=await r.json(); showMsg(d.msg||d.erro); sync(); }
    async function upg(id) { const r=await fetch('/api/empresa/comprar_upgrade',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({upgId:id})}); const d=await r.json(); showMsg(d.msg||d.erro); sync(); }
    async function vender() { const r=await fetch('/api/empresa/vender',{method:'POST'}); const d=await r.json(); showMsg(d.msg||d.erro); sync(); }
    
    let modType = '';
    function openMod(tipo) {
        modType = tipo;
        document.getElementById('mod-val').value = '';
        document.getElementById('banco-modal').style.display = 'flex';
        if(tipo==='investir') {
            document.getElementById('mod-icon').className = 'fas fa-coins';
            document.getElementById('mod-icon').style.color = 'var(--blue)';
            document.getElementById('mod-title').innerText = 'Injetar Caixa (Ligar Máquinas)';
            document.getElementById('mod-desc').innerText = 'Tira saldo da sua Carteira Física e coloca no CNPJ.';
            document.getElementById('mod-btn').style.background = 'var(--blue)';
        } else {
            document.getElementById('mod-icon').className = 'fas fa-wallet';
            document.getElementById('mod-icon').style.color = 'var(--green)';
            document.getElementById('mod-title').innerText = 'Sacar Lucro';
            document.getElementById('mod-desc').innerText = 'Retira dinheiro do CNPJ para sua Carteira Física (Taxa 5%).';
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
</script>
`;

// Substitui tudo o que tiver de <script> até o final do arquivo pela versão consertada
const indexStart = html.indexOf('<script>');
if (indexStart !== -1) {
    html = html.substring(0, indexStart) + scriptLimpo + '\n</body>\n</html>';
    fs.writeFileSync('./views/tycoon.html', html);
    console.log('✅ JAVASCRIPT RESTAURADO: A tela descongelou e os modais estão online!');
} else {
    console.log('⚠️ Erro: Não achou a tag <script>. O arquivo pode estar vazio.');
}
