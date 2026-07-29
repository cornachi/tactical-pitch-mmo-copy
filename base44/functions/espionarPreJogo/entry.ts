import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { CATEGORIA_POR_ATRIBUTO, CLIMAS, preverModeloJogo, MODELOS_JOGO } from "../../shared/tactical.ts";

// Espião Pré-Jogo: custa moedas do jogo e revela os 3 atributos metodológicos
// mais fortes do adversário, o modelo de jogo previsto e o clima do confronto.
const CUSTO_ESPIAO = 150;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { desafiante_id, desafiado_id } = await req.json();
    if (!desafiante_id || !desafiado_id) {
      return Response.json({ error: 'desafiante_id e desafiado_id são obrigatórios' }, { status: 400 });
    }

    const desafiante = await base44.asServiceRole.entities.Clube.get(desafiante_id);
    if (!desafiante) return Response.json({ error: 'Clube desafiante não encontrado' }, { status: 404 });
    if (desafiante.user_id !== user.id) {
      return Response.json({ error: 'Você só pode espiar com o seu próprio clube' }, { status: 403 });
    }
    if ((desafiante.moedas || 0) < CUSTO_ESPIAO) {
      return Response.json({ error: 'Moedas insuficientes para o Espião' }, { status: 400 });
    }

    const desafiado = await base44.asServiceRole.entities.Clube.get(desafiado_id);
    if (!desafiado) return Response.json({ error: 'Adversário não encontrado' }, { status: 404 });

    const atributos = await base44.asServiceRole.entities.AtributoTatico.filter({ clube_id: desafiado_id });
    const top3 = atributos
      .map((a) => ({ nome: a.nome_atributo, nivel: a.nivel || 1, categoria: CATEGORIA_POR_ATRIBUTO[a.nome_atributo] }))
      .sort((a, b) => b.nivel - a.nivel)
      .slice(0, 3);

    const modelo_previsao = preverModeloJogo(atributos, desafiado.especializacao);
    const clima = CLIMAS[Math.floor(Math.random() * CLIMAS.length)];

    await base44.asServiceRole.entities.Clube.update(desafiante_id, { moedas: (desafiante.moedas || 0) - CUSTO_ESPIAO });

    return Response.json({
      success: true,
      custo: CUSTO_ESPIAO,
      top3,
      modelo_previsao,
      modelo_previsao_label: MODELOS_JOGO.find((m) => m.key === modelo_previsao)?.label || modelo_previsao,
      clima,
    });
  } catch (error) {
    console.error("espionarPreJogo: erro", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}