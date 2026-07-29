import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { gerarCodigoConvite } from "../../shared/torneio.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { nome, taxa_inscricao } = await req.json();
    if (!nome || !nome.trim()) return Response.json({ error: 'Informe o nome do torneio' }, { status: 400 });
    const taxa = Math.max(0, Math.floor(Number(taxa_inscricao) || 0));

    const clubes = await base44.asServiceRole.entities.Clube.filter({ user_id: user.id });
    const clube = clubes[0];
    if (!clube) return Response.json({ error: 'Clube não encontrado' }, { status: 404 });
    if (taxa > 0 && (clube.moedas || 0) < taxa) {
      return Response.json({ error: 'Moedas insuficientes para a taxa de inscrição' }, { status: 400 });
    }

    const codigo_convite = gerarCodigoConvite();
    let pote = 0;
    if (taxa > 0) {
      await base44.asServiceRole.entities.Clube.update(clube.id, { moedas: (clube.moedas || 0) - taxa });
      pote = taxa;
    }

    const torneio = await base44.asServiceRole.entities.Torneio.create({
      nome: nome.trim(),
      criador_id: clube.id,
      taxa_inscricao: taxa,
      codigo_convite,
      status: 'MONTANDO',
      participantes: [clube.id],
      rodadas: {},
      pote_moedas: pote,
    });
    return Response.json({ success: true, torneio });
  } catch (error) {
    console.error("criarTorneio: erro", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}