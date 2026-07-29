import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Tarefa agendada (cron): reseta diariamente a energia de todos os clubes.
// Deve ser configurada como Workflow/Automação recorrente (diário 00:00)
// no dashboard, invocando esta função. Acesso restrito a admins para evitar
// disparos manuais por usuários comuns.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: somente administradores' }, { status: 403 });
    }

    // Reseta energia de todos os clubes. updateMany processa até 500 por chamada;
    // fazemos um loop para cobrir mais de 500 clubes.
    let hasMore = true;
    let totalAtualizados = 0;
    while (hasMore) {
      const res = await base44.asServiceRole.entities.Clube.updateMany(
        {},
        { $set: { energia_matchmaking: 6, energia_desafio: 3 } }
      );
      totalAtualizados += res.modified_count || 0;
      hasMore = res.has_more === true;
    }

    return Response.json({
      success: true,
      mensagem: 'Energia resetada para todos os clubes',
      clubes_atualizados: totalAtualizados,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}