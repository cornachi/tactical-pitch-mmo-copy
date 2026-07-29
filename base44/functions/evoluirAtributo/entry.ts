import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { calcularCustoEvolucaoComCT, CATEGORIA_POR_ATRIBUTO } from "../../shared/tactical.ts";
import { registrarProgresso } from "../../shared/missoes.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { clube_id, nome_atributo } = await req.json();

    if (!clube_id || !nome_atributo) {
      return Response.json({ error: 'clube_id e nome_atributo são obrigatórios' }, { status: 400 });
    }
    if (!(nome_atributo in CATEGORIA_POR_ATRIBUTO)) {
      return Response.json({ error: 'Atributo tático inválido' }, { status: 400 });
    }

    // Busca o clube e valida posse pelo usuário autenticado.
    const clube = await base44.asServiceRole.entities.Clube.get(clube_id);
    if (!clube) return Response.json({ error: 'Clube não encontrado' }, { status: 404 });
    if (clube.user_id !== user.id) {
      return Response.json({ error: 'Você não tem permissão sobre este clube' }, { status: 403 });
    }

    // Busca o atributo tático do clube.
    const atributos = await base44.asServiceRole.entities.AtributoTatico.filter({
      clube_id,
      nome_atributo,
    });
    const atributo = atributos[0];
    if (!atributo) {
      return Response.json({ error: 'Atributo não encontrado para o clube' }, { status: 404 });
    }

    const nivelAtual = atributo.nivel || 1;
    const custo = calcularCustoEvolucaoComCT(nivelAtual, nome_atributo, clube.especializacao, clube.ct_nivel);

    if ((clube.moedas || 0) < custo) {
      return Response.json({
        error: 'Moedas insuficientes',
        custo,
        moedas_atuais: clube.moedas || 0,
      }, { status: 400 });
    }

    // Deduz as moedas e incrementa o nível do atributo.
    const novasMoedas = (clube.moedas || 0) - custo;
    await base44.asServiceRole.entities.Clube.update(clube_id, { moedas: novasMoedas });
    await base44.asServiceRole.entities.AtributoTatico.update(atributo.id, {
      nivel: nivelAtual + 1,
    });

    try {
      await registrarProgresso(base44.asServiceRole, clube_id, 'EVOLUIR', 1);
    } catch (e) { /* missões são best-effort */ }

    return Response.json({
      success: true,
      nome_atributo,
      nivel_anterior: nivelAtual,
      novo_nivel: nivelAtual + 1,
      custo,
      moedas_restantes: novasMoedas,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}