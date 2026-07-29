import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sortearMeta, premiacaoPorPosicao } from "../../shared/metas.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Fecha a temporada ativa atual.
    const ativas = await base44.asServiceRole.entities.Temporada.filter({ ativa: true });
    const temporadaAtual = ativas[0];

    // Ranking final ordenado por ELO.
    const clubes = await base44.asServiceRole.entities.Clube.list("-ranking_elo", 10000);

    const updates = clubes.map((c, i) => {
      const pos = i + 1;
      const premio = premiacaoPorPosicao(pos);
      const novoElo = Math.round(1000 + (c.ranking_elo || 1000) * 0.2);
      return {
        id: c.id,
        moedas: (c.moedas || 0) + premio,
        ranking_elo: novoElo,
      };
    });
    await base44.asServiceRole.entities.Clube.bulkUpdate(updates);

    // Sorteia novo Evento Meta e inicia nova temporada (próximo mês).
    const novoMetaKey = sortearMeta();
    const agora = new Date();
    const proximoMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 1);
    const mesAno = `${proximoMes.getFullYear()}-${String(proximoMes.getMonth() + 1).padStart(2, "0")}`;
    const dataInicio = proximoMes.toISOString().slice(0, 10);
    const fim = new Date(proximoMes.getFullYear(), proximoMes.getMonth() + 1, 0);
    const dataFim = fim.toISOString().slice(0, 10);

    if (temporadaAtual) {
      await base44.asServiceRole.entities.Temporada.update(temporadaAtual.id, { ativa: false });
    }
    await base44.asServiceRole.entities.Temporada.create({
      mes_ano: mesAno,
      evento_meta_atual: novoMetaKey,
      ativa: true,
      data_inicio: dataInicio,
      data_fim: dataFim,
    });

    return Response.json({
      temporada_encerrada: temporadaAtual?.mes_ano || null,
      nova_temporada: mesAno,
      novo_meta: novoMetaKey,
      clubes_premiados: updates.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}