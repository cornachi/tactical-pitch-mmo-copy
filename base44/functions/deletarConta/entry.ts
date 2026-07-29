import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Exclusão de conta do usuário do app (conformidade Google Play Store).
// Remove todos os dados de jogo vinculados ao usuário (clube + dependentes).
// O registro de autenticação (User) é gerenciado pela plataforma.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const clubes = await base44.asServiceRole.entities.Clube.filter({ user_id: user.id });
    const clubeIds = clubes.map((c) => c.id);

    for (const cid of clubeIds) {
      try { await base44.asServiceRole.entities.AtributoTatico.deleteMany({ clube_id: cid }); } catch (e) {}
      try { await base44.asServiceRole.entities.Notificacao.deleteMany({ clube_id: cid }); } catch (e) {}
      try { await base44.asServiceRole.entities.MissaoDiaria.deleteMany({ clube_id: cid }); } catch (e) {}
      try { await base44.asServiceRole.entities.Trofeu.deleteMany({ clube_id: cid }); } catch (e) {}
      try { await base44.asServiceRole.entities.Conquista.deleteMany({ clube_id: cid }); } catch (e) {}
      try { await base44.asServiceRole.entities.DesafioPendente.deleteMany({ desafiante_id: cid }); } catch (e) {}
      try { await base44.asServiceRole.entities.DesafioPendente.deleteMany({ desafiado_id: cid }); } catch (e) {}
      try { await base44.asServiceRole.entities.HistoricoPartida.deleteMany({ desafiante_id: cid }); } catch (e) {}
      try { await base44.asServiceRole.entities.HistoricoPartida.deleteMany({ desafiado_id: cid }); } catch (e) {}
    }

    if (clubeIds.length > 0) {
      await base44.asServiceRole.entities.Clube.deleteMany({ user_id: user.id });
    }

    return Response.json({ success: true, removidos: clubeIds.length });
  } catch (error) {
    console.error("deletarConta: erro", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}