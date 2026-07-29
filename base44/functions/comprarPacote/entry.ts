import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getPacote } from "../../shared/pacotes.ts";
import { acrescentarPote } from "../../shared/pote.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { pacote_id } = await req.json();
    const pacote = getPacote(pacote_id);
    if (!pacote) {
      return Response.json({ error: 'Pacote inválido' }, { status: 400 });
    }

    const clubes = await base44.asServiceRole.entities.Clube.filter({ user_id: user.id });
    const clube = clubes[0];
    if (!clube) {
      return Response.json({ error: 'Clube não encontrado' }, { status: 404 });
    }

    await base44.asServiceRole.entities.TransacaoLoja.create({
      clube_id: clube.id,
      pacote_id: pacote.id,
      valor_reais: pacote.valor_reais,
      status: 'CONCLUIDO',
    });

    const novo_saldo = (clube.moedas || 0) + pacote.moedas;
    await base44.asServiceRole.entities.Clube.update(clube.id, { moedas: novo_saldo });

    try { await acrescentarPote(base44, Math.round(pacote.moedas * 0.05)); } catch (e) {}

    return Response.json({
      success: true,
      pacote: pacote.nome,
      moedas_creditadas: pacote.moedas,
      novo_saldo,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}