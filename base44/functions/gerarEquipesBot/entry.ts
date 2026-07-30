import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { ATRIBUTOS_INICIAIS } from "../../shared/tactical.ts";

const NOMES_BOTS = [
  "Tática FC",
  "Real Algoritmo",
  "Posse de Bola EC",
  "Pressionadores SC",
  "Contra-Ataque United",
  "Os Táticos",
  "FC Byte",
  "Algoritmo Atlético",
  "Motor Tático",
  "Genoma FC",
  "Lógica FC",
  "Pressão Total",
  "Velocidade United",
  "Mestres da Posse",
  "Furacão Tático",
  "Tiki Taka SC",
  "Guardiões do Meio",
  "Linha Defensiva EC",
  "Força Bruta FC",
  "Contra Golo SC",
];

const ESPECIALIZACOES = ["POSSE", "CONTRA_ATAQUE", "PRESSAO", "EQUILIBRADO"];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const clubes = NOMES_BOTS.map((nome) => ({
      user_id: "bot_system",
      nome_clube: nome,
      pais: "Botlândia",
      moedas: 1000,
      xp: 0,
      energia_matchmaking: 6,
      energia_desafio: 3,
      win_streak: 0,
      especializacao: ESPECIALIZACOES[Math.floor(Math.random() * ESPECIALIZACOES.length)],
      is_bot: true,
    }));

    const criados = await base44.asServiceRole.entities.Clube.bulkCreate(clubes);

    const atributos = [];
    for (const clube of criados) {
      for (const a of ATRIBUTOS_INICIAIS) {
        atributos.push({
          clube_id: clube.id,
          nome_atributo: a.nome,
          nivel: Math.floor(Math.random() * 5) + 1,
        });
      }
    }
    await base44.asServiceRole.entities.AtributoTatico.bulkCreate(atributos);

    return Response.json({
      clubes_criados: criados.length,
      atributos_criados: atributos.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}