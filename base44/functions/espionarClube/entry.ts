import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { CATEGORIA_POR_ATRIBUTO } from "../../shared/tactical.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { clube_id } = await req.json();
    if (!clube_id) {
      return Response.json({ error: 'clube_id é obrigatório' }, { status: 400 });
    }

    const clube = await base44.asServiceRole.entities.Clube.get(clube_id);
    if (!clube) {
      return Response.json({ error: 'Clube não encontrado' }, { status: 404 });
    }

    const atributos = await base44.asServiceRole.entities.AtributoTatico.filter({ clube_id });

    const atributos_top = atributos
      .map((a) => ({
        nome: a.nome_atributo,
        nivel: a.nivel || 1,
        categoria: CATEGORIA_POR_ATRIBUTO[a.nome_atributo],
      }))
      .sort((a, b) => b.nivel - a.nivel)
      .slice(0, 3);

    return Response.json({
      clube_id: clube.id,
      nome_clube: clube.nome_clube,
      especializacao: clube.especializacao,
      atributos_top,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}