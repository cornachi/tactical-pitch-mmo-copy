import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Recarga de Energia de Matchmaking por anúncio assistido (Rewarded Ad).
// Ilimitada (sem teto diário), sem custo de moedas. Cap no teto padrão (20 + medico_nivel).
const BASE_CAP_ENERGIA = 20;
const RECOMPENSA_ANUNCIO = 5;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const clubes = await base44.asServiceRole.entities.Clube.filter({ user_id: user.id });
    const clube = clubes[0];
    if (!clube) return Response.json({ error: 'Clube não encontrado' }, { status: 404 });

    const maxEnergia = BASE_CAP_ENERGIA + (clube.medico_nivel || 0);
    const atual = clube.energia_matchmaking || 0;
    if (atual >= maxEnergia) {
      return Response.json({ error: 'Energia já está no limite máximo', max_energia: maxEnergia, energia_matchmaking: atual }, { status: 400 });
    }

    const novaEnergia = Math.min(maxEnergia, atual + RECOMPENSA_ANUNCIO);
    const creditar = novaEnergia - atual;

    await base44.asServiceRole.entities.Clube.update(clube.id, {
      energia_matchmaking: novaEnergia,
    });

    return Response.json({
      success: true,
      energias_creditadas: creditar,
      energia_matchmaking: novaEnergia,
      max_energia: maxEnergia,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}