import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sortearMeta, premiacaoPorPosicao } from "../../shared/metas.ts";
import { calcularRankingsMensais } from "../../shared/rankings.ts";

// Encerra a temporada: distribui premiação global (ELO) + premiações dos rankings
// especiais (teto de 10% do prêmio do 1º lugar global, proporcionais por posição),
// reseta ELO e inicia nova temporada com novo Evento Meta.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const ativas = await base44.asServiceRole.entities.Temporada.filter({ ativa: true });
    const temporadaAtual = ativas[0];

    const agora = new Date();
    const anoMesFechamento = temporadaAtual?.mes_ano
      || `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}`;

    const clubes = await base44.asServiceRole.entities.Clube.list("-ranking_elo", 10000);

    // Rankings especiais do mês que está sendo encerrado.
    const rankings = await calcularRankingsMensais(base44, clubes, anoMesFechamento);
    const premioGlobal1 = premiacaoPorPosicao(1);
    const tetoEspecial = Math.floor(premioGlobal1 * 0.10);
    const premioEspecial = (pos) => pos <= 10 ? Math.round(tetoEspecial * (11 - pos) / 10) : 0;

    const premioExtra = {};
    ["vitorias", "ataque", "defesa", "desafios", "infra", "comissao"].forEach((k) => {
      (rankings[k] || []).forEach((r) => {
        premioExtra[r.id] = (premioExtra[r.id] || 0) + premioEspecial(r.pos);
      });
    });

    const updates = clubes.map((c, i) => {
      const pos = i + 1;
      const premio = premiacaoPorPosicao(pos) + (premioExtra[c.id] || 0);
      const novoElo = Math.round(1000 + (c.ranking_elo || 1000) * 0.2);
      return { id: c.id, moedas: (c.moedas || 0) + premio, ranking_elo: novoElo };
    });
    await base44.asServiceRole.entities.Clube.bulkUpdate(updates);

    // Nova temporada (próximo mês) com novo Evento Meta sorteado.
    const novoMetaKey = sortearMeta();
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
      premiados_especiais: Object.keys(premioExtra).length,
      teto_especial: tetoEspecial,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}