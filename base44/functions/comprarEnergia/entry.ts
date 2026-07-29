import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { acrescentarPote } from "../../shared/pote.ts";

// Teto base diário de energia de matchmaking (o Dept. Médico soma medico_nivel).
export const BASE_CAP_ENERGIA = 20;

// Pacotes de recarga de energia compráveis com moedas do clube.
export const PACOTES_ENERGIA = {
  5: 300,
  10: 500,
  20: 800,
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { qtd } = await req.json();
    if (!PACOTES_ENERGIA[qtd]) {
      return Response.json({ error: 'Quantidade inválida (use 5, 10 ou 20)' }, { status: 400 });
    }

    const clubes = await base44.asServiceRole.entities.Clube.filter({ user_id: user.id });
    const clube = clubes[0];
    if (!clube) return Response.json({ error: 'Clube não encontrado' }, { status: 404 });

    const custo = PACOTES_ENERGIA[qtd];
    const moedas = clube.moedas || 0;
    if (moedas < custo) {
      return Response.json({ error: 'Moedas insuficientes', custo, moedas }, { status: 400 });
    }

    const compradasHoje = clube.energias_compradas_hoje || 0;
    if (compradasHoje + qtd > 20) {
      return Response.json({ error: '⚠️ Você já atingiu o limite de 20 energias compradas hoje. Aguarde o reset diário!', compradas_hoje: compradasHoje }, { status: 400 });
    }

    const maxEnergia = BASE_CAP_ENERGIA + (clube.medico_nivel || 0);
    // Energia comprada pode acumular até 1 pacote grande acima do teto diário.
    const hardCeiling = maxEnergia + 20;
    const atual = clube.energia_matchmaking || 0;
    if (atual >= hardCeiling) {
      return Response.json({ error: 'Energia já está no limite máximo', max_energia: hardCeiling, energia_matchmaking: atual }, { status: 400 });
    }

    const novaEnergia = Math.min(hardCeiling, atual + qtd);
    const creditar = novaEnergia - atual;
    const novasMoedas = moedas - custo;

    await base44.asServiceRole.entities.Clube.update(clube.id, {
      moedas: novasMoedas,
      energia_matchmaking: novaEnergia,
      energias_compradas_hoje: compradasHoje + qtd,
    });

    try { await acrescentarPote(base44, Math.round(custo * 0.05)); } catch (e) {}

    return Response.json({
      success: true,
      energias_creditadas: creditar,
      energia_matchmaking: novaEnergia,
      max_energia: maxEnergia,
      custo,
      moedas: novasMoedas,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}