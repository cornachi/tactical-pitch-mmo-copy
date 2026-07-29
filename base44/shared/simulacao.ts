import {
  poderAtaque,
  poderDefesa,
  poderFisico,
  calcularDominancia,
  amostraPoisson,
  atualizarElo,
  gerarMomentum,
  gerarLances,
  gerarCartoes,
  CLIMAS,
  MODELO_CONTRA,
  preverModeloJogo,
} from "./tactical.ts";
import { getMeta, aplicarMetaEfeito } from "./metas.ts";
import { registrarProgresso } from "./missoes.ts";
import { acrescentarPote } from "./pote.ts";

// Núcleo da simulação de partida, compartilhado entre simularPartida (matchmaking)
// e responderDesafio (fluxo de desafio com reserva prévia de apostas).
// opts: { desafiante, desafiado, desafianteId, desafiadoId, tipoPartida, aposta, consumirEnergia, potReservado }
// - consumirEnergia: true para consumir energia_matchmaking do desafiante (matchmaking).
// - potReservado: true quando as apostas já foram reservadas (fluxo de desafio) —
//   o vencedor recebe o pote (aposta*2); empate devolve a aposta a cada lado.
export async function simularCore(base44, opts) {
  const {
    desafiante, desafiado, desafianteId, desafiadoId,
    tipoPartida, aposta, consumirEnergia, potReservado,
    modeloJogoHome, clima: climaForcado,
  } = opts;

  const attrsHome = await base44.asServiceRole.entities.AtributoTatico.filter({ clube_id: desafianteId });
  const attrsAway = await base44.asServiceRole.entities.AtributoTatico.filter({ clube_id: desafiadoId });
  const fisHome = poderFisico(attrsHome);
  const fisAway = poderFisico(attrsAway);

  let atkHomeBase = poderAtaque(attrsHome);
  let defHomeBase = poderDefesa(attrsHome);
  let atkAwayBase = poderAtaque(attrsAway);
  let defAwayBase = poderDefesa(attrsAway);

  const boostAux = (nivel) => (nivel || 0) * 1.5;
  if (atkHomeBase >= defHomeBase) atkHomeBase += boostAux(desafiante.comissao_auxiliar_tatico);
  else defHomeBase += boostAux(desafiante.comissao_auxiliar_tatico);
  if (atkAwayBase >= defAwayBase) atkAwayBase += boostAux(desafiado.comissao_auxiliar_tatico);
  else defAwayBase += boostAux(desafiado.comissao_auxiliar_tatico);

  const temporadaAtiva = (await base44.asServiceRole.entities.Temporada.filter({ ativa: true }))[0];
  const meta = temporadaAtiva?.evento_meta_atual ? getMeta(temporadaAtiva.evento_meta_atual) : null;
  const homeEf = aplicarMetaEfeito(meta, desafiante.especializacao, atkHomeBase, defHomeBase);
  const awayEf = aplicarMetaEfeito(meta, desafiado.especializacao, atkAwayBase, defAwayBase);
  let atkHome = homeEf.atk;
  let defHome = homeEf.def;
  let atkAway = awayEf.atk;
  let defAway = awayEf.def;

  // Condições climáticas sorteadas no início da partida.
  const clima = climaForcado
    ? (CLIMAS.find((c) => c.key === climaForcado) || CLIMAS[Math.floor(Math.random() * CLIMAS.length)])
    : CLIMAS[Math.floor(Math.random() * CLIMAS.length)];
  if (clima.key === "CHUVA") {
    // Penaliza a posse curta; beneficia o passe longo / força física (defesa).
    if (desafiante.especializacao === "POSSE") atkHome = Math.round(atkHome * 0.85);
    if (desafiado.especializacao === "POSSE") atkAway = Math.round(atkAway * 0.85);
    defHome += Math.round(fisHome * 0.1);
    defAway += Math.round(fisAway * 0.1);
  }

  // --- Termômetro da Torcida (fator casa do desafiante) ---
  // 0-25: revolta -> penalidade leve no fator casa. 81-100: êxtase -> +5% resiliência.
  const termTorcida = desafiante.termometro_torcida ?? 50;
  if (termTorcida <= 25) {
    atkHome = Math.round(atkHome * 0.95);
    defHome = Math.round(defHome * 0.95);
  } else if (termTorcida >= 81) {
    defHome = Math.round(defHome * 1.05);
  }

  // --- Cartões e expulsões gerados cedo (penalizam o placar, não só o visual) ---
  const { eventos: cartoes, expulsoes } = gerarCartoes(defHome, defAway);
  const expHome = expulsoes.filter((e) => e.lado === "home").length;
  const expAway = expulsoes.filter((e) => e.lado === "away").length;

  // --- Matriz de Vantagem Tática: modelo de jogo escolhido x modelo adversário ---
  const modeloAdversario = preverModeloJogo(attrsAway, desafiado.especializacao);
  let vantagemTatica = false;
  if (modeloJogoHome && MODELO_CONTRA[modeloJogoHome] === modeloAdversario) {
    atkHome = Math.round(atkHome * 1.25); // +25% de efetividade nas jogadas
    vantagemTatica = true;
  }

  // --- Rebalanceamento de expulsões (aplicado ANTES do placar) ---
  // 1 expulsão: -20% defesa + 25% desgaste de stamina.
  // 2+ expulsões: -50% defesa, ataque zerado, +60% na taxa de gols do adversário.
  let oppXgHomeMult = 1;
  let oppXgAwayMult = 1;
  if (expHome >= 2) { defHome = Math.round(defHome * 0.5); atkHome = 0; oppXgAwayMult = 1.6; }
  else if (expHome === 1) { defHome = Math.round(defHome * 0.8); }
  if (expAway >= 2) { defAway = Math.round(defAway * 0.5); atkAway = 0; oppXgHomeMult = 1.6; }
  else if (expAway === 1) { defAway = Math.round(defAway * 0.8); }

  const domBase = calcularDominancia(atkHome, defAway, atkAway, defHome);
  const xgHomeAdj = +(domBase.xg_home * oppXgHomeMult).toFixed(2);
  const xgAwayAdj = +(domBase.xg_away * oppXgAwayMult).toFixed(2);
  const totalXg = xgHomeAdj + xgAwayAdj;
  const dominancia_home = totalXg === 0 ? 50 : Math.round((xgHomeAdj / totalXg) * 100);
  const dom = { dominancia_home, dominancia_away: 100 - dominancia_home, xg_home: xgHomeAdj, xg_away: xgAwayAdj };

  const placar_home = amostraPoisson(dom.xg_home);
  const placar_away = amostraPoisson(dom.xg_away);
  const vencedor = placar_home > placar_away ? "home" : placar_home < placar_away ? "away" : "empate";
  const scoreHome = vencedor === "home" ? 1 : vencedor === "empate" ? 0.5 : 0;

  const momentum = gerarMomentum(attrsHome, attrsAway, dom, placar_home, placar_away, desafiante.comissao_prep_fisico, desafiado.comissao_prep_fisico);

  // Penalidade visual no momentum + desgaste extra de stamina nos blocos finais.
  const fatorExpulsao = (n) => (n >= 2 ? 0.5 : n === 1 ? 0.8 : 1);
  expulsoes.forEach((exp) => {
    const pen = exp.lado;
    const out = pen === "home" ? "away" : "home";
    const fator = fatorExpulsao(pen === "home" ? expHome : expAway);
    momentum.forEach((b) => {
      if (b.fim >= exp.minuto) {
        b.dominancia_pct[pen] = Math.round(b.dominancia_pct[pen] * fator);
        b.dominancia_pct[out] = 100 - b.dominancia_pct[pen];
      }
    });
  });
  if (expHome >= 1 || expAway >= 1) {
    momentum.forEach((b) => {
      if (b.inicio >= 46) {
        if (expHome >= 1) b.dominancia_pct.home = Math.round(b.dominancia_pct.home * 0.9);
        if (expAway >= 1) b.dominancia_pct.away = Math.round(b.dominancia_pct.away * 0.9);
        const s = b.dominancia_pct.home + b.dominancia_pct.away;
        b.dominancia_pct.home = s > 0 ? Math.round((b.dominancia_pct.home / s) * 100) : 50;
        b.dominancia_pct.away = 100 - b.dominancia_pct.home;
      }
    });
  }

  const lancesBase = gerarLances(desafiante, desafiado, placar_home, placar_away, momentum);
  const cartoesNarr = cartoes.map((c) => {
    const clube = c.lado === "home" ? desafiante : desafiado;
    const texto = c.tipo === "vermelho"
      ? `Aos ${c.minuto}' - Falta dura e o árbitro mostra cartão VERMELHO! ${clube.nome_clube} fica com um a menos 🟥.`
      : `Aos ${c.minuto}' - Falta dura e o árbitro mostra cartão amarelo para ${clube.nome_clube} 🟨.`;
    return { minuto: c.minuto, tipo: c.tipo === "vermelho" ? "CARTAO_VERMELHO" : "CARTAO_AMARELO", clube_autor_id: clube.id, texto_narrativo: texto, lado: c.lado };
  });
  const lances_narracao = [...lancesBase, ...cartoesNarr].sort((a, b) => a.minuto - b.minuto);

  const updateHome = {};
  const updateAway = {};
  let moedas_ganhas = 0;
  let xp_ganhos = 0;
  let novoEloHome = desafiante.ranking_elo || 1000;
  let novoEloAway = desafiado.ranking_elo || 1000;
  let novaWinStreak = desafiante.win_streak || 0;

  if (tipoPartida === "MATCHMAKING") {
    if (consumirEnergia) updateHome.energia_matchmaking = (desafiante.energia_matchmaking || 0) - 1;

    const elo = atualizarElo(desafiante.ranking_elo || 1000, desafiado.ranking_elo || 1000, scoreHome);
    novoEloHome = elo.novoA;
    novoEloAway = elo.novoB;
    updateHome.ranking_elo = novoEloHome;
    updateAway.ranking_elo = novoEloAway;

    let coinsHome, xpHome, coinsAway, xpAway;
    if (vencedor === "home") { coinsHome = 150; xpHome = 60; coinsAway = 40; xpAway = 20; }
    else if (vencedor === "away") { coinsHome = 40; xpHome = 20; coinsAway = 150; xpAway = 60; }
    else { coinsHome = 70; xpHome = 30; coinsAway = 70; xpAway = 30; }

    if (vencedor === "home") {
      novaWinStreak = (desafiante.win_streak || 0) + 1;
      if (novaWinStreak >= 3) coinsHome = Math.round(coinsHome * 1.2);
    } else {
      novaWinStreak = 0;
    }
    const bonusHome = 1 + 0.02 * (desafiante.estadio_nivel || 0) + (vencedor === "home" ? 0.015 * (desafiante.comissao_analista || 0) : 0);
    coinsHome = Math.round(coinsHome * bonusHome);
    updateHome.win_streak = novaWinStreak;
    updateHome.moedas = (desafiante.moedas || 0) + coinsHome;
    updateHome.xp = (desafiante.xp || 0) + xpHome;
    updateAway.moedas = (desafiado.moedas || 0) + coinsAway;
    updateAway.xp = (desafiado.xp || 0) + xpAway;
    moedas_ganhas = coinsHome;
    xp_ganhos = xpHome;
    try { await acrescentarPote(base44, Math.round((coinsHome + coinsAway) * 0.05)); } catch (e) {}
  } else {
    // DESAFIO
    if (potReservado) {
      const pot = aposta * 2;
      if (vencedor === "home") {
        updateHome.moedas = (desafiante.moedas || 0) + pot;
        moedas_ganhas = aposta;
      } else if (vencedor === "away") {
        updateAway.moedas = (desafiado.moedas || 0) + pot;
        moedas_ganhas = -aposta;
      } else {
        updateHome.moedas = (desafiante.moedas || 0) + aposta;
        updateAway.moedas = (desafiado.moedas || 0) + aposta;
        moedas_ganhas = 0;
      }
    } else {
      const bonusHome = 1 + 0.02 * (desafiante.estadio_nivel || 0) + (vencedor === "home" ? 0.015 * (desafiante.comissao_analista || 0) : 0);
      if (vencedor === "home") {
        const t = Math.round(aposta * bonusHome);
        updateHome.moedas = (desafiante.moedas || 0) + t;
        updateAway.moedas = Math.max(0, (desafiado.moedas || 0) - aposta);
        moedas_ganhas = t;
      } else if (vencedor === "away") {
        updateHome.moedas = Math.max(0, (desafiante.moedas || 0) - aposta);
        updateAway.moedas = (desafiado.moedas || 0) + aposta;
        moedas_ganhas = -aposta;
      }
    }
    try { await acrescentarPote(base44, Math.round((aposta || 0) * 0.05)); } catch (e) {}
  }

  // --- Atualização do Termômetro da Torcida após o resultado ---
  const diffGols = Math.abs(placar_home - placar_away);
  const deltaTorcida = (ganhou) =>
    ganhou === null ? (diffGols >= 2 ? 4 : 0) : ganhou ? (diffGols >= 3 ? 18 : 12) : -(diffGols >= 3 ? 18 : 10);
  const clampTorcida = (v) => Math.max(0, Math.min(100, v));
  const ganhouHome = vencedor === "home" ? true : vencedor === "away" ? false : null;
  const ganhouAway = vencedor === "away" ? true : vencedor === "home" ? false : null;
  updateHome.termometro_torcida = clampTorcida((desafiante.termometro_torcida ?? 50) + deltaTorcida(ganhouHome));
  updateAway.termometro_torcida = clampTorcida((desafiado.termometro_torcida ?? 50) + deltaTorcida(ganhouAway));

  if (Object.keys(updateHome).length > 0) await base44.asServiceRole.entities.Clube.update(desafianteId, updateHome);
  if (Object.keys(updateAway).length > 0) await base44.asServiceRole.entities.Clube.update(desafiadoId, updateAway);

  const prompt = `Você é um analista tático de futebol. Com base na partida abaixo, gere exatamente 3 insights táticos curtos (1 frase cada) em português do Brasil, explicando os fatores decisivos do resultado. Varie entre posse, contra-ataque, pressão, defesa e xG. Seja específico.

Partida: ${desafiante.nome_clube} (${desafiante.especializacao}) ${placar_home}x${placar_away} ${desafiado.nome_clube} (${desafiado.especializacao})
Dominância: ${dom.dominancia_home}% x ${dom.dominancia_away}%
xG: ${dom.xg_home} x ${dom.xg_away}
Poder de ataque: ${atkHome} x ${atkAway} | Poder de defesa: ${defHome} x ${defAway}
Vencedor: ${vencedor === "home" ? desafiante.nome_clube : vencedor === "away" ? desafiado.nome_clube : "Empate"}

Retorne JSON no formato {"insights": ["insight1", "insight2", "insight3"]}.`;

  let insights = [];
  try {
    const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: { insights: { type: "array", items: { type: "string" } } },
        required: ["insights"],
      },
    });
    insights = llmRes.insights || [];
  } catch (e) {
    insights = [
      `${desafiante.nome_clube} teve ${dom.dominancia_home}% de dominância contra ${dom.dominancia_away}% do adversário.`,
      vencedor === "empate"
        ? "A partida terminou em empate, com placar equilibrado."
        : `${vencedor === "home" ? desafiante.nome_clube : desafiado.nome_clube} foi mais eficiente no xG (${vencedor === "home" ? dom.xg_home : dom.xg_away}).`,
      `xG final de ${dom.xg_home} x ${dom.xg_away} reflete a produção ofensiva dos dois times.`,
    ];
  }

  const historico = await base44.asServiceRole.entities.HistoricoPartida.create({
    desafiante_id: desafianteId,
    desafiado_id: desafiadoId,
    tipo: tipoPartida,
    placar_home,
    placar_away,
    xg_home: dom.xg_home,
    xg_away: dom.xg_away,
    dominancia_home: dom.dominancia_home,
    aposta_moedas: tipoPartida === "DESAFIO" ? aposta : 0,
    insights: { insights, dominancia_home: dom.dominancia_home, dominancia_away: dom.dominancia_away, atkHome, atkAway, defHome, defAway, momentum, lances_narracao },
  });

  try {
    await registrarProgresso(base44.asServiceRole, desafianteId, "PARTIDAS", 1);
    await registrarProgresso(base44.asServiceRole, desafianteId, "GOLS", placar_home);
    if (tipoPartida === "DESAFIO" && vencedor === "home") {
      await registrarProgresso(base44.asServiceRole, desafianteId, "VENCER_DESAFIO", 1);
    }
  } catch (e) { /* best-effort */ }

  return {
    success: true,
    partida_id: historico.id,
    meta_evento: meta ? { nome: meta.nome, descricao: meta.descricao } : null,
    tipo_partida: tipoPartida,
    desafiante: { id: desafiante.id, nome_clube: desafiante.nome_clube, especializacao: desafiante.especializacao, cor_principal: desafiante.cor_principal, cor_secundaria: desafiante.cor_secundaria, icone_escudo: desafiante.icone_escudo, comissao_prep_fisico: desafiante.comissao_prep_fisico || 0, fisico: fisHome },
    desafiado: { id: desafiado.id, nome_clube: desafiado.nome_clube, especializacao: desafiado.especializacao, cor_principal: desafiado.cor_principal, cor_secundaria: desafiado.cor_secundaria, icone_escudo: desafiado.icone_escudo, comissao_prep_fisico: desafiado.comissao_prep_fisico || 0, fisico: fisAway },
    placar_home,
    placar_away,
    xg_home: dom.xg_home,
    xg_away: dom.xg_away,
    dominancia_home: dom.dominancia_home,
    dominancia_away: dom.dominancia_away,
    vencedor,
    win_streak: novaWinStreak,
    moedas_ganhas,
    xp_ganhos,
    novo_elo_desafiante: novoEloHome,
    momentum,
    lances_narracao,
    expulsoes,
    clima,
    modelo_jogo_home: modeloJogoHome || null,
    modelo_adversario: modeloAdversario,
    vantagem_tatica: vantagemTatica,
    termometro_torcida: updateHome.termometro_torcida,
    insights,
  };
}