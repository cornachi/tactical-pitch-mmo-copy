import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getMissoesDiarias, RECOMPENSA_BONUS_DIARIO } from "../../shared/missoes.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { acao, clube_id, missao_id, idioma } = body || {};
    if (!clube_id) return Response.json({ error: 'clube_id é obrigatório' }, { status: 400 });

    const clube = await base44.asServiceRole.entities.Clube.get(clube_id);
    if (!clube) return Response.json({ error: 'Clube não encontrado' }, { status: 404 });
    if (clube.user_id !== user.id) {
      return Response.json({ error: 'Você não tem permissão sobre este clube' }, { status: 403 });
    }

    const client = base44.asServiceRole;

    if (acao === 'listar' || !acao) {
      const missoes = await getMissoesDiarias(client, clube_id, idioma);
      const todasConcluidas = missoes.length >= 3 && missoes.every((m) => m.concluida);
      const bonusResgatado = missoes.length >= 3 && missoes.every((m) => m.bonus_resgatado);
      return Response.json({
        missoes,
        todas_concluidas: todasConcluidas,
        bonus_disponivel: todasConcluidas && !bonusResgatado,
        bonus_resgatado: bonusResgatado,
        recompensa_bonus: RECOMPENSA_BONUS_DIARIO,
      });
    }

    if (acao === 'resgatar') {
      if (!missao_id) return Response.json({ error: 'missao_id é obrigatório' }, { status: 400 });
      const missoes = await client.entities.MissaoDiaria.filter({ clube_id });
      const missao = missoes.find((m) => m.id === missao_id);
      if (!missao) return Response.json({ error: 'Missão não encontrada' }, { status: 404 });
      if (!missao.concluida) return Response.json({ error: 'Missão ainda não concluída' }, { status: 400 });
      if (missao.resgatada) return Response.json({ error: 'Recompensa já resgatada' }, { status: 400 });
      await client.entities.MissaoDiaria.update(missao_id, { resgatada: true });
      const novasMoedas = (clube.moedas || 0) + (missao.recompensa_moedas || 0);
      await client.entities.Clube.update(clube_id, { moedas: novasMoedas });
      return Response.json({ success: true, moedas: novasMoedas, recompensa: missao.recompensa_moedas });
    }

    if (acao === 'resgatarBonus') {
      const missoes = await client.entities.MissaoDiaria.filter({ clube_id });
      if (missoes.length < 3) return Response.json({ error: 'Missões indisponíveis' }, { status: 400 });
      const todasConcluidas = missoes.every((m) => m.concluida);
      if (!todasConcluidas) return Response.json({ error: 'Conclua todas as missões primeiro' }, { status: 400 });
      const bonusResgatado = missoes.every((m) => m.bonus_resgatado);
      if (bonusResgatado) return Response.json({ error: 'Bônus já resgatado' }, { status: 400 });
      await Promise.all(missoes.map((m) => client.entities.MissaoDiaria.update(m.id, { bonus_resgatado: true })));
      const novasMoedas = (clube.moedas || 0) + RECOMPENSA_BONUS_DIARIO;
      await client.entities.Clube.update(clube_id, { moedas: novasMoedas });
      return Response.json({ success: true, moedas: novasMoedas, recompensa: RECOMPENSA_BONUS_DIARIO });
    }

    return Response.json({ error: 'Ação inválida' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}