const fs = require('fs');
const path = './views/os.html';

let html = fs.readFileSync(path, 'utf8');

if (html.includes('emp-glass-card')) {
    console.log("⚠️ A UI Premium já foi instalada!");
    process.exit();
}

console.log("🛠️ Injetando Painel Premium de Tempo Real...");

const novaUI = `
<style>
    /* 💎 UI PREMIUM - EFEITO VIDRO E ANIMAÇÕES */
    .emp-glass-card {
        background: rgba(0, 31, 63, 0.6);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(127, 219, 255, 0.3);
        border-radius: 20px;
        padding: 20px;
        position: relative;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .emp-glass-card::before {
        content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
        background: radial-gradient(circle, rgba(127,219,255,0.1) 0%, transparent 70%);
        pointer-events: none;
    }
    .live-dot {
        width: 8px; height: 8px; background: #00ff88; border-radius: 50%; display: inline-block;
        box-shadow: 0 0 10px #00ff88; animation: pulse 1.5s infinite; margin-right: 5px;
    }
    @keyframes pulse { 0% { transform: scale(0.9); opacity: 0.7; } 50% { transform: scale(1.5); opacity: 1; } 100% { transform: scale(0.9); opacity: 0.7; } }
    .xp-bar-bg { background: rgba(255,255,255,0.1); height: 8px; border-radius: 4px; margin-top: 10px; overflow: hidden; }
    .xp-bar-fill { background: linear-gradient(90deg, #ff4a7a, #ffb300); height: 100%; width: 0%; transition: width 0.5s ease; }
    .val-ticker { font-family: monospace; font-size: 22px; font-weight: 900; letter-spacing: -1px; margin-top: 5px;}
</style>

<script>
    // 🧠 MOTOR DE TEMPO REAL DO FRONTEND (SOBRESCREVE O ANTIGO)
    let dadosCache = null;
    let chipsFicticios = 0;
    let caixaFicticio = 0;

    async function attEmpresa() {
        try {
            const res = await fetch('/api/empresa/info'); 
            const data = await res.json();
            if (!data.hasCompany) {
                document.getElementById('corp-main-panel').style.display = 'none';
                document.getElementById('corp-fundar-panel').style.display = 'block';
            } else {
                document.getElementById('corp-fundar-panel').style.display = 'none';
                document.getElementById('corp-main-panel').style.display = 'block';
                
                dadosCache = data;
                const emp = data.empresa; 
                const st = data.stats;
                
                // Sincroniza a matemática do servidor com a animação da tela
                chipsFicticios = emp.estoque["Microchips"] || 0;
                caixaFicticio = emp.caixa;

                // Transforma a UI antiga na Premium (Roda só 1 vez)
                if(!document.getElementById('live-indicator')) {
                    document.querySelector('.corp-stats-grid').innerHTML = \`
                        <div class="emp-glass-card">
                            <div class="stat-label"><span class="live-dot" id="live-indicator"></span> Caixa Matriz</div>
                            <div class="val-ticker" style="color:#00ff88" id="emp-caixa-live">R$ 0,00</div>
                            <div style="font-size:9px; color:#888; margin-top:10px; border-top:1px solid rgba(255,255,255,0.1); padding-top:8px;">
                                <i class="fas fa-arrow-down" style="color:#ff0055"></i> Custo Manutenção: R$ <span id="emp-custo-live">0</span>/min
                            </div>
                        </div>
                        <div class="emp-glass-card">
                            <div class="stat-label"><i class="fas fa-microchip" style="color:#7FDBFF"></i> Estoque Atual</div>
                            <div class="val-ticker" style="color:#7FDBFF" id="emp-estoque-live">0</div>
                            <div style="font-size:9px; color:#888; margin-top:10px; border-top:1px solid rgba(255,255,255,0.1); padding-top:8px;">
                                <i class="fas fa-arrow-up" style="color:#00ff88"></i> Produção: <span id="emp-prod-live">0</span>/min
                            </div>
                        </div>
                    \`;
                    
                    const headerInfo = document.querySelector('#corp-main-panel > div:first-child');
                    headerInfo.innerHTML = \`
                        <div style="width: 100%;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 5px;">
                                <div>
                                    <span class="corp-badge" style="font-size: 11px;" id="emp-nivel">Nível \${emp.nivel}</span> 
                                    <span class="corp-badge" style="border-color:#ff4a7a; color:#ff4a7a;" id="emp-rep"><i class="fas fa-star"></i> \${emp.reputacao}%</span>
                                </div>
                                <div style="font-size: 10px; color:#888; font-weight: bold;">XP: <span style="color:#fff;">\${emp.xp} / \${emp.nivel * 100}</span></div>
                            </div>
                            <div class="xp-bar-bg"><div class="xp-bar-fill" id="emp-xp-bar" style="width: 0%;"></div></div>
                        </div>
                    \`;
                }

                // Preenche os dados
                const xpNecessario = emp.nivel * 100;
                const xpPct = Math.min(100, (emp.xp / xpNecessario) * 100);
                document.getElementById('emp-nivel').innerText = 'Nível ' + emp.nivel;
                document.getElementById('emp-rep').innerHTML = '<i class="fas fa-star"></i> ' + emp.reputacao + '%';
                document.getElementById('emp-xp-bar').style.width = xpPct + '%';
                
                document.getElementById('emp-custo-live').innerText = st.custoManutencaoMinuto;
                document.getElementById('emp-prod-live').innerText = st.prodPorMinuto;

                // Carrossel de RH com Layout Limpo
                let htmlRH = '';
                for (let k in st.rh) {
                    const f = st.rh[k]; const tem = emp.funcionarios.includes(k); const locked = emp.nivel < f.reqLvl;
                    let btn = tem ? '<button class="btn-corp disabled"><i class="fas fa-check-circle"></i> NA EQUIPE</button>' : locked ? '<button class="btn-corp disabled"><i class="fas fa-lock"></i> REQUER NVL ' + f.reqLvl + '</button>' : '<button class="btn-corp" onclick="contratar(\\'' + k + '\\')">CONTRATAR<br><span style="font-size:8px">R$ ' + (f.salarioHora * 5) + '</span></button>';
                    htmlRH += '<div class="func-card"><i class="fas fa-user-tie" style="font-size:24px; color:#7FDBFF; margin-bottom:8px; text-align:center;"></i><b style="font-size:12px; text-align:center;">' + f.nome + '</b><div style="font-size:9px; color:#888; text-align:center; margin-bottom:10px;">' + f.cargo + '</div><div style="font-size:9px; color:#aaa; margin-bottom:10px; flex:1; text-align:center;">' + f.efeito + '</div>' + btn + '</div>';
                }
                document.getElementById('rh-container').innerHTML = htmlRH;
            }
        } catch(e) {}
    }

    // O CORAÇÃO DO TEMPO REAL (Roda a cada 1 segundo animando os números)
    setInterval(() => {
        if(document.getElementById('empresa-app').classList.contains('active') && dadosCache) {
            const st = dadosCache.stats;
            
            // Converte Por Minuto para Por Segundo
            const chipsPorSeg = st.prodPorMinuto / 60;
            const custoPorSeg = st.custoManutencaoMinuto / 60;
            
            // Simula o acréscimo sem pesar o servidor
            chipsFicticios += chipsPorSeg;
            if(chipsFicticios > st.limiteEstoque) chipsFicticios = st.limiteEstoque;
            caixaFicticio -= custoPorSeg;

            // Atualiza os painéis na velocidade da luz
            document.getElementById('emp-caixa-live').innerText = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(caixaFicticio);
            document.getElementById('emp-estoque-live').innerText = Math.floor(chipsFicticios) + ' / ' + st.limiteEstoque;
        }
    }, 1000);
</script>
`;

html = html.replace('</body>', novaUI + '\n</body>');
fs.writeFileSync(path, html);
console.log("✅ UPGRADE CONCLUÍDO! O Painel Premium com Tempo Real foi ativado.");
