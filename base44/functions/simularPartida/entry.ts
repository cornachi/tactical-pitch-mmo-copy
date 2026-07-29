import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import {
  poderAtaque,
  poderDefesa,
  calcularDominancia,
  amostraPoisson,
  atualizarElo,
} from "../../shared/tactical.ts";
import { getMeta, aplicarMetaEfeito } from "../../shared/metas.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { desafiante_id, desafiado_id, tipo_partida, aposta_moedas } = await req.json();

    if (!desafiante_id || !desafiado_id) {
      return Response.json({ error: 'desafiante_id e desafiado_id são obrigatórios' }, { status: 400 });
    }
    if (desafiante_id === desafiado_id) {
      return Response.json({ error: 'Desafiante e desafiado não podem ser o mesmo clube' }, { status: 400 });
    }
    if (!['MATCHMAKING', 'DESAFIO'].includes(tipo_partida)) {
      return Response.json({ error: 'tipo_partida inválido (use MATCHMAKING ou DESAFIO)' }, { status: 400 });
    }

    const aposta = Math.min(Math.max(0, aposta_moedas || 0), 1000);

    // Carrega os clubes.
    const desafiante = await base44.asServiceRole.entities.Clube.get(desafiante_id);
    const desafiado = await base44.asServiceRole.entities.Clube.get(desafiado_id);
    if (!desafiante || !desafiado) {
      return Response.json({ error: 'Clube não encontrado' }, { status: 404 });
    }
    if (desafiante.user_id !== user.id) {
      return Response.json({ error: 'Você só pode jogar com o seu próprio clube' }, { status: 403 });
    }

    // Valida energia do desafiante conforme o tipo de partida.
    if (tipo_partida === 'MATCHMAKING') {
      if ((desafiante.energia_matchmaking || 0) < 1) {
        return Response.json({ error: 'Energia de matchmaking insuficiente' }, { status: 400 });
      }
    } else {
      if ((desafiante.energia_desafio || 0) < 1) {
        return Response.json({ error: 'Energia de desafio insuficiente' }, { status: 400 });
      }
      if (aposta > (desafiante.moedas || 0)) {
        return Response.json({ error: 'Aposta maior que suas moedas disponíveis' }, { status: 400 });
      }
    }

    // Carrega os 18 atributos táticos de cada clube.
    const attrsHome = await base44.asServiceRole.entities.AtributoTatico.filter({ clube_id: desafiante_id });
    const attrsAway = await base44.asServiceRole.entities.AtributoTatico.filter({ clube_id: desafiado_id });

    const atkHomeBase = poderAtaque(attrsHome);
    const defHomeBase = poderDefesa(attrsHome);
    const atkAwayBase = poderAtaque(attrsAway);
    const defAwayBase = poderDefesa(attrsAway);

    // Evento Meta da temporada ativa afeta todas as partidas do mês.
    const temporadaAtiva = (await base44.asServiceRole.entities.Temporada.filter({ ativa: true }))[0];
    const meta = temporadaAtiva?.evento_meta_atual ? getMeta(temporadaAtiva.evento_meta_atual) : null;
    const homeEf = aplicarMetaEfeito(meta, desafiante.especializacao, atkHomeBase, defHomeBase);
    const awayEf = aplicarMetaEfeito(meta, desafiado.especializacao, atkAwayBase, defAwayBase);
    const atkHome = homeEf.atk;
    const defHome = homeEf.def;
    const atkAway = awayEf.atk;
    const defAway = awayEf.def;

    const dom = calcularDominancia(atkHome, defAway, atkAway, defHome);

    const placar_home = amostraPoisson(dom.xg_home);
    const placar_away = amostraPoisson(dom.xg_away);

    const vencedor = placar_home > placar_away ? 'home' : placar_home < placar_away ? 'away' : 'empate';
    const scoreHome = vencedor === 'home' ? 1 : vencedor === 'empate' ? 0.5 : 0;

    // Atualizações de saldo / ELO / XP por tipo de partida.
    const updateHome = {};
    const updateAway = {};
    let moedas_ganhas = 0;
    let xp_ganhos = 0;
    let novoEloHome = desafiante.ranking_elo || 1000;
    let novoEloAway = desafiado.ranking_elo || 1000;
    let novaWinStreak = desafiante.win_streak || 0;

    if (tipo_partida === 'MATCHMAKING') {
      updateHome.energia_matchmaking = (desafiante.energia_matchmaking || 0) - 1;

      const elo = atualizarElo(
        desafiante.ranking_elo || 1000,
        desafiado.ranking_elo || 1000,
        scoreHome
      );
      novoEloHome = elo.novoA;
      novoEloAway = elo.novoB;
      updateHome.ranking_elo = novoEloHome;
      updateAway.ranking_elo = novoEloAway;

      let coinsHome, xpHome, coinsAway, xpAway;
      if (vencedor === 'home') {
        coinsHome = 150; xpHome = 60; coinsAway = 40; xpAway = 20;
      } else if (vencedor === 'away') {
        coinsHome = 40; xpHome = 20; coinsAway = 150; xpAway = 60;
      } else {
        coinsHome = 70; xpHome = 30; coinsAway = 70; xpAway = 30;
      }

      if (vencedor === 'home') {
        novaWinStreak = (desafiante.win_streak || 0) + 1;
        if (novaWinStreak >= 3) coinsHome = Math.round(coinsHome * 1.2);
      } else {
        novaWinStreak = 0;
      }
      updateHome.win_streak = novaWinStreak;
      updateHome.moedas = (desafiante.moedas || 0) + coinsHome;
      updateHome.xp = (desafiante.xp || 0) + xpHome;
      updateAway.moedas = (desafiado.moedas || 0) + coinsAway;
      updateAway.xp = (desafiado.xp || 0) + xpAway;
      moedas_ganhas = coinsHome;
      xp_ganhos = xpHome;
    } else {
      updateHome.energia_desafio = (desafiante.energia_desafio || 0) - 1;
      let transfer = 0;
      if (vencedor === 'home') {
        transfer = aposta;
        updateHome.moedas = (desafiante.moedas || 0) + aposta;
        updateAway.moedas = Math.max(0, (desafiado.moedas || 0) - aposta);
      } else if (vencedor === 'away') {
        transfer = -aposta;
        updateHome.moedas = Math.max(0, (desafiante.moedas || 0) - aposta);
        updateAway.moedas = (desafiado.moedas || 0) + aposta;
      }
      moedas_ganhas = transfer;
    }

    await base44.asServiceRole.entities.Clube.update(desafiante_id, updateHome);
    if (Object.keys(updateAway).length > 0) {
      await base44.asServiceRole.entities.Clube.update(desafiado_id, updateAway);
    }

    // Gera 3 insights táticos via LLM (com fallback determinístico).
    const prompt = `Você é um analista tático de futebol. Com base na partida abaixo, gere exatamente 3 insights táticos curtos (1 frase cada) em português do Brasil, explicando os fatores decisivos do resultado. Varie entre posse, contra-ataque, pressão, defesa e xG. Seja específico.

Partida: ${desafiante.nome_clube} (${desafiante.especializacao}) ${placar_home}x${placar_away} ${desafiado.nome_clube} (${desafiado.especializacao})
Dominância: ${dom.dominancia_home}% x ${dom.dominancia_away}%
xG: ${dom.xg_home} x ${dom.xg_away}
Poder de ataque: ${atkHome} x ${atkAway} | Poder de defesa: ${defHome} x ${defAway}
Vencedor: ${vencedor === 'home' ? desafiante.nome_clube : vencedor === 'away' ? desafiado.nome_clube : 'Empate'}

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
        vencedor === 'empate'
          ? 'A partida terminou em empate, com placar equilibrado.'
          : `${vencedor === 'home' ? desafiante.nome_clube : desafiado.nome_clube} foi mais eficiente no xG (${vencedor === 'home' ? dom.xg_home : dom.xg_away}).`,
        `xG final de ${dom.xg_home} x ${dom.xg_away} reflete a produção ofensiva dos dois times.`,
      ];
    }

    const historico = await base44.asServiceRole.entities.HistoricoPartida.create({
      desafiante_id,
      desafiado_id,
      tipo: tipo_partida,
      placar_home,
      placar_away,
      xg_home: dom.xg_home,
      xg_away: dom.xg_away,
      dominancia_home: dom.dominancia_home,
      aposta_moedas: tipo_partida === 'DESAFIO' ? aposta : 0,
      insights: { insights, dominancia_home: dom.dominancia_home, dominancia_away: dom.dominancia_away, atkHome, atkAway, defHome, defAway },
    });

    if (tipo_partida === 'DESAFIO') {
      const resultadoTxt = vencedor === 'home'
        ? 'você perdeu'
        : vencedor === 'away'
          ? 'você venceu'
          : 'empatou';
      await base44.asServiceRole.entities.Notificacao.create({
        clube_id: desafiado_id,
        partida_id: historico.id,
        titulo: 'Você foi desafiado!',
        mensagem: `${desafiante.nome_clube} desafiou você para uma partida apostando ${aposta} moedas. Resultado: ${resultadoTxt} (${placar_home}x${placar_away}).`,
        lida: false,
      });
    }

    return Response.json({
      success: true,
      partida_id: historico.id,
      meta_evento: meta ? { nome: meta.nome, descricao: meta.descricao } : null,
      tipo_partida,
      desafiante: { id: desafiante.id, nome_clube: desafiante.nome_clube, especializacao: desafiante.especializacao },
      desafiado: { id: desafiado.id, nome_clube: desafiado.nome_clube, especializacao: desafiado.especializacao },
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
      insights,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}