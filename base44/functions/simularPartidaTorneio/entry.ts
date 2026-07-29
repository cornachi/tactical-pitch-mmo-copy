import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { simularConfrontoCopa } from "../../shared/copa.ts";
import { resolverByesAuto, finalDecidida } from "../../shared/torneio.ts";
import { registrarTrofeu } from "../../shared/trofeus.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { torneio_id, rodada, match_index } = await req.json();
    const torneio = await base44.asServiceRole.entities.Torneio.get(torneio_id);
    if (!torneio) return Response.json({ error: 'Torneio não encontrado' }, { status: 404 });
    if (torneio.status !== 'EM_ANDAMENTO') return Response.json({ error: 'Torneio não está em andamento' }, { status: 400 });

    const clubes = await base44.asServiceRole.entities.Clube.filter({ user_id: user.id });
    const clube = clubes[0];
    if (!clube) return Response.json({ error: 'Clube não encontrado' }, { status: 404 });
    const participantes = torneio.participantes || [];
    if (!participantes.includes(clube.id) && torneio.criador_id !== clube.id) {
      return Response.json({ error: 'Apenas participantes podem simular partidas' }, { status: 403 });
    }

    const rodadas = torneio.rodadas || {};
    const match = rodadas[rodada]?.[match_index];
    if (!match) return Response.json({ error: 'Partida não encontrada' }, { status: 404 });
    if (match.vencedor_id) return Response.json({ error: 'Partida já decidida' }, { status: 400 });
    if (!match.home_id || !match.away_id) return Response.json({ error: 'Partida ainda não definida' }, { status: 400 });

    const [home, away] = await Promise.all([
      base44.asServiceRole.entities.Clube.get(match.home_id),
      base44.asServiceRole.entities.Clube.get(match.away_id),
    ]);
    const r = await simularConfrontoCopa(base44, home, away);
    match.placar_home = r.placar_home;
    match.placar_away = r.placar_away;
    match.dominancia_home = r.dominancia_home;
    match.vencedor_id = r.vencedor_id;
    match.bye = false;

    resolverByesAuto(rodadas);

    let concluido = false;
    let premio = null;
    const finalInfo = finalDecidida(rodadas);
    if (finalInfo) {
      concluido = true;
      const pote = torneio.pote_moedas || 0;
      const premioCamp = Math.round(pote * 0.7);
      const premioVice = Math.round(pote * 0.3);
      const camp = await base44.asServiceRole.entities.Clube.get(finalInfo.campeao_id);
      await base44.asServiceRole.entities.Clube.update(finalInfo.campeao_id, { moedas: (camp.moedas || 0) + premioCamp });
      if (finalInfo.vice_id) {
        const vice = await base44.asServiceRole.entities.Clube.get(finalInfo.vice_id);
        await base44.asServiceRole.entities.Clube.update(finalInfo.vice_id, { moedas: (vice.moedas || 0) + premioVice });
      }
      try {
        await base44.asServiceRole.entities.Conquista.create({
          clube_id: finalInfo.campeao_id,
          titulo_obtido: `Campeão do Torneio: ${torneio.nome}`,
          data_desbloqueio: new Date().toISOString().slice(0, 10),
        });
      } catch (e) { /* best-effort */ }
      try {
        await base44.asServiceRole.entities.Notificacao.create({
          clube_id: finalInfo.campeao_id,
          titulo: '🏆 Campeão do Torneio!',
          mensagem: `Você venceu o torneio "${torneio.nome}" e levou ${premioCamp.toLocaleString('pt-BR')} moedas!`,
        });
      } catch (e) { /* best-effort */ }
      await registrarTrofeu(base44, { clube_id: finalInfo.campeao_id, tipo: "TORNEIO_8", colocacao: "CAMPEAO", edicao: torneio.nome });
      if (finalInfo.vice_id) await registrarTrofeu(base44, { clube_id: finalInfo.vice_id, tipo: "TORNEIO_8", colocacao: "VICE", edicao: torneio.nome });
      premio = { campeao_id: finalInfo.campeao_id, vice_id: finalInfo.vice_id, premio_campeao: premioCamp, premio_vice: premioVice };
    }

    const update = { rodadas };
    if (concluido) {
      update.status = 'CONCLUIDO';
      update.campeao_id = finalInfo.campeao_id;
      update.vice_id = finalInfo.vice_id || null;
    }
    const atualizado = await base44.asServiceRole.entities.Torneio.update(torneio.id, update);
    return Response.json({
      success: true,
      torneio: atualizado,
      resultado: { placar_home: r.placar_home, placar_away: r.placar_away, vencedor_id: r.vencedor_id },
      concluido,
      premio,
    });
  } catch (error) {
    console.error("simularPartidaTorneio: erro", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}