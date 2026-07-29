import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { ATRIBUTOS_INICIAIS } from "../../shared/tactical.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { nome_clube, pais, especializacao } = await req.json();
    if (!nome_clube || !pais) {
      return Response.json({ error: 'nome_clube e pais são obrigatórios' }, { status: 400 });
    }

    // Impede que um usuário crie mais de um clube.
    const existentes = await base44.asServiceRole.entities.Clube.filter({ user_id: user.id });
    if (existentes.length > 0) {
      return Response.json({
        error: 'Você já possui um clube',
        clube: existentes[0],
      }, { status: 400 });
    }

    const clube = await base44.asServiceRole.entities.Clube.create({
      user_id: user.id,
      nome_clube,
      pais,
      especializacao: especializacao || 'EQUILIBRADO',
      moedas: 1000,
      xp: 0,
      ranking_elo: 1000,
      energia_matchmaking: 6,
      energia_desafio: 3,
      win_streak: 0,
    });

    // Gera automaticamente os 18 atributos táticos iniciais no nível 1.
    const atributos = ATRIBUTOS_INICIAIS.map((a) => ({
      clube_id: clube.id,
      nome_atributo: a.nome,
      nivel: 1,
    }));
    await base44.asServiceRole.entities.AtributoTatico.bulkCreate(atributos);

    return Response.json({
      success: true,
      clube,
      atributos_criados: atributos.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}