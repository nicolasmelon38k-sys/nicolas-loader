const fs = require('fs');
const path = './views/os.html';
let html = fs.readFileSync(path, 'utf8');

if (html.includes('id="ap-upgrades"')) {
    console.log("⚠️ Os Upgrades já foram instalados no OS!");
    process.exit();
}

console.log("🛠️ Injetando Módulo de Upgrades na Empresa...");

// 1. Troca os botões de baixo para incluir o de Upgrades
const botoesAntigos = `<div style="display:flex; gap:10px; margin-top:10px;">
                <button class="btn-spring" style="background:#0a84ff; color:#fff;" onclick="vEmpresa()"><i class="fas fa-box"></i> Vender</button>
                <button class="btn-spring" style="background:#32d74b; color:#000;" onclick="rEmpresa()"><i class="fas fa-wallet"></i> Sacar</button>
            </div>`;
            
const botoesNovos = `<div style="display:flex; gap:8px; margin-top:10px;">
                <button class="btn-spring" style="background:#0a84ff; color:#fff; font-size:11px; padding:12px;" onclick="vEmpresa()"><i class="fas fa-box"></i> Vender</button>
                <button class="btn-spring" style="background:#32d74b; color:#000; font-size:11px; padding:12px;" onclick="rEmpresa()"><i class="fas fa-wallet"></i> Sacar</button>
                <button class="btn-spring" style="background:#ff9f0a; color:#fff; font-size:11px; padding:12px;" onclick="toggleUpgrades(true)"><i class="fas fa-rocket"></i> Expansão</button>
            </div>`;
html = html.replace(botoesAntigos, botoesNovos);

// 2. Injeta o HTML da nova aba de Upgrades dentro do modal da empresa
const fechamentoMain = `        </div>
    </div>
  </div>`;

const novaTelaUpgrades = `        </div>
        
        <div id="ap-upgrades" style="display:none; padding-top: 10px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
                <h3 style="font-weight:800; font-size:20px; color:#ff9f0a;"><i class="fas fa-rocket"></i> Expansão</h3>
                <button class="btn-spring" style="background:rgba(255,255,255,0.1); color:#fff; width:auto; padding:8px 15px; font-size:11px;" onclick="toggleUpgrades(false)"><i class="fas fa-arrow-left"></i> Voltar</button>
            </div>
            <div style="font-size:12px; color:#888; margin-bottom: 15px;">Adquira tecnologias usando o caixa da empresa (CNPJ).</div>
            <div id="upg-list" style="display: flex; flex-direction: column; gap: 12px;"></div>
        </div>

    </div>
  </div>`;
html = html.replace(fechamentoMain, novaTelaUpgrades);

// 3. Injeta as funções Javascript no final do arquivo
const jsInjetado = `
    // FUNÇÕES DE UPGRADES INJETADAS
    function toggleUpgrades(show) {
        document.getElementById('ap-main').style.display = show ? 'none' : 'block';
        document.getElementById('ap-upgrades').style.display = show ? 'block' : 'none';
        if(show && cacheEmp) renderizarUpgrades();
    }

    function renderizarUpgrades() {
        if(!cacheEmp) return;
        const upgDB = cacheEmp.stats.upgrades;
        const meusUpgs = cacheEmp.empresa.upgrades || [];
        let h = '';
        for(let k in upgDB) {
            let u = upgDB[k];
            let comprou = meusUpgs.includes(k);
            let semGrana = realCaixa < u.preco;
            
            let btn = comprou ? 
                '<button class="btn-spring" style="background:rgba(255,255,255,0.05); color:#888; width:auto; padding:10px 15px; font-size:10px;" disabled><i class="fas fa-check"></i> INSTALADO</button>' : 
                '<button class="btn-spring" style="background:'+u.cor+'; color:'+(u.cor==='#32d74b'?'#000':'#fff')+'; width:auto; padding:10px 15px; font-size:10px;" onclick="cUpgrade(\\''+k+'\\')">R$ '+u.preco+'</button>';
            
            h += \`<div class="apple-card" style="padding: 15px; margin-bottom:0; display:flex; justify-content:space-between; align-items:center;">
                    <div style="display:flex; gap:12px; align-items:center;">
                        <div style="width:40px; height:40px; border-radius:12px; background:rgba(255,255,255,0.05); display:grid; place-items:center;">
                            <i class="\${u.icon}" style="font-size:18px; color:\${u.cor};"></i>
                        </div>
                        <div>
                            <div style="font-weight:800; font-size:13px; color:#fff;">\${u.nome}</div>
                            <div style="font-size:10px; color:#888; margin-top:2px;">\${u.desc}</div>
                        </div>
                    </div>
                    \${btn}
                </div>\`;
        }
        document.getElementById('upg-list').innerHTML = h;
    }

    async function cUpgrade(id) {
        const r = await fetch('/api/empresa/comprar_upgrade', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({upgId:id}) });
        const d = await r.json();
        showAlerta(d.msg);
        if(d.success) { await syncEmp(); renderizarUpgrades(); }
    }
</script>
</body>`;
html = html.replace('</script>\n</body>', jsInjetado);

fs.writeFileSync(path, html);
console.log("✅ UPGRADES INJETADOS! O módulo de expansão foi adicionado com sucesso.");
