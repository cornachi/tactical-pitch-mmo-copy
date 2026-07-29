import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { calcularRankingsMensais } from "../../shared/rankings.ts";

// Retorna os 7 rankings mensais para a tela de Rankings.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const agora = new Date();
    const anoMes = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}`;
    const clubes = await base44.asServiceRole.entities.Clube.list("-ranking_elo", 10000);
    const meuClube = clubes.find((c) => c.user_id === user.id) || null;
    const rankings = await calcularRankingsMensais(base44, clubes, anoMes);

    return Response.json({
      ano_mes: anoMes,
      meu_clube_id: meuClube?.id || null,
      rankings,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}