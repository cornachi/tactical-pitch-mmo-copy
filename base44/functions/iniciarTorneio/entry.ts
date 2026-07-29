import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { gerarChaveamento } from "../../shared/torneio.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { torneio_id } = await req.json();
    const torneio = await base44.asServiceRole.entities.Torneio.get(torneio_id);
    if (!torneio) return Response.json({ error: 'Torneio não encontrado' }, { status: 404 });

    const clubes = await base44.asServiceRole.entities.Clube.filter({ user_id: user.id });
    const clube = clubes[0];
    if (!clube || torneio.criador_id !== clube.id) {
      return Response.json({ error: 'Apenas o criador pode iniciar o torneio' }, { status: 403 });
    }
    if (torneio.status !== 'MONTANDO') return Response.json({ error: 'Torneio já iniciado' }, { status: 400 });
    const participantes = torneio.participantes || [];
    if (participantes.length < 2) return Response.json({ error: 'Mínimo de 2 jogadores para iniciar' }, { status: 400 });

    const atualizado = await base44.asServiceRole.entities.Torneio.update(torneio.id, {
      status: 'EM_ANDAMENTO',
      rodadas: gerarChaveamento(participantes),
    });
    return Response.json({ success: true, torneio: atualizado });
  } catch (error) {
    console.error("iniciarTorneio: erro", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}