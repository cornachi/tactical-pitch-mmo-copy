import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { INSTALACOES, custoInstalacao, CAMPO_NIVEL } from "../../shared/instalacoes.ts";

// Evolui (nível infinito) uma instalação ou cargo da comissão técnica.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { clube_id, tipo } = await req.json();
    if (!clube_id || !tipo) return Response.json({ error: 'clube_id e tipo são obrigatórios' }, { status: 400 });
    if (!(tipo in INSTALACOES)) return Response.json({ error: 'Tipo de instalação inválido' }, { status: 400 });

    const clube = await base44.asServiceRole.entities.Clube.get(clube_id);
    if (!clube) return Response.json({ error: 'Clube não encontrado' }, { status: 404 });
    if (clube.user_id !== user.id) return Response.json({ error: 'Acesso negado' }, { status: 403 });

    const campo = CAMPO_NIVEL[tipo];
    const nivelAtual = clube[campo] || 0;
    const custo = custoInstalacao(tipo, nivelAtual);

    if ((clube.moedas || 0) < custo) {
      return Response.json({ error: 'Moedas insuficientes', custo, moedas_atuais: clube.moedas || 0 }, { status: 400 });
    }

    const novasMoedas = (clube.moedas || 0) - custo;
    await base44.asServiceRole.entities.Clube.update(clube_id, { moedas: novasMoedas, [campo]: nivelAtual + 1 });

    return Response.json({
      success: true,
      tipo,
      nivel_anterior: nivelAtual,
      novo_nivel: nivelAtual + 1,
      custo,
      moedas_restantes: novasMoedas,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}