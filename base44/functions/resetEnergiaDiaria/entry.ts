import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Tarefa agendada (cron): reseta diariamente a energia de todos os clubes.
// O Departamento Médico aumenta o teto/recuperação de energia (medico_nivel).
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: somente administradores' }, { status: 403 });
    }

    const clubes = await base44.asServiceRole.entities.Clube.list("-created_date", 10000);
    const updates = clubes.map((c) => {
      const med = c.medico_nivel || 0;
      return {
        id: c.id,
        energia_matchmaking: 20 + med,
        energia_desafio: 3 + Math.floor(med / 2),
        energias_compradas_hoje: 0,
      };
    });

    for (let i = 0; i < updates.length; i += 500) {
      await base44.asServiceRole.entities.Clube.bulkUpdate(updates.slice(i, i + 500));
    }

    return Response.json({
      success: true,
      mensagem: 'Energia resetada (com bônus do Dept. Médico)',
      clubes_atualizados: updates.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}