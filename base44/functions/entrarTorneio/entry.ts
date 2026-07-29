import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { gerarChaveamento } from "../../shared/torneio.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { codigo_convite } = await req.json();
    if (!codigo_convite) return Response.json({ error: 'Informe o código de convite' }, { status: 400 });

    const torneios = await base44.asServiceRole.entities.Torneio.filter({ codigo_convite: String(codigo_convite).toUpperCase().trim() });
    const torneio = torneios[0];
    if (!torneio) return Response.json({ error: 'Torneio não encontrado com este código' }, { status: 404 });
    if (torneio.status !== 'MONTANDO') return Response.json({ error: 'Inscrições encerradas para este torneio' }, { status: 400 });

    const clubes = await base44.asServiceRole.entities.Clube.filter({ user_id: user.id });
    const clube = clubes[0];
    if (!clube) return Response.json({ error: 'Clube não encontrado' }, { status: 404 });
    const participantes = torneio.participantes || [];
    if (participantes.includes(clube.id)) return Response.json({ error: 'Você já está neste torneio' }, { status: 400 });
    if (participantes.length >= 8) return Response.json({ error: 'Torneio cheio (8 jogadores)' }, { status: 400 });

    const taxa = torneio.taxa_inscricao || 0;
    if (taxa > 0 && (clube.moedas || 0) < taxa) {
      return Response.json({ error: 'Moedas insuficientes para a taxa de inscrição' }, { status: 400 });
    }

    const novosParticipantes = [...participantes, clube.id];
    const update = { participantes: novosParticipantes, pote_moedas: (torneio.pote_moedas || 0) + taxa };
    if (taxa > 0) {
      await base44.asServiceRole.entities.Clube.update(clube.id, { moedas: (clube.moedas || 0) - taxa });
    }

    let iniciado = false;
    if (novosParticipantes.length === 8) {
      update.status = 'EM_ANDAMENTO';
      update.rodadas = gerarChaveamento(novosParticipantes);
      iniciado = true;
    }
    const atualizado = await base44.asServiceRole.entities.Torneio.update(torneio.id, update);
    return Response.json({ success: true, torneio: atualizado, iniciado });
  } catch (error) {
    console.error("entrarTorneio: erro", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}